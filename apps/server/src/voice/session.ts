import {
  ActionStatus,
  MessageRole,
  VoiceSessionPhase,
  type Incident,
  type Language,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { interpretTurn } from '../ai/orchestrate.js';
import { safePhrases } from '../ai/phrases.js';
import { currentStep, stepPrompt } from '../protocols/engine.js';
import { publishedProtocols } from '../protocols/catalog.js';
import { isPlaceCallStep } from '@voicesos/protocols';
import type { LlmProvider } from '../ai/provider.js';
import { AiValidationError, UpstreamUnavailableError, ValidationError } from '../common/errors.js';
import { getIncidentById, insertConversationMessage, listConversationMessages } from '../database/persist.js';
import { formatHistory } from './history.js';
import { prepareSpokenLine } from './spoken.js';
import { commitIncidentMutation } from '../incidents/apply.js';
import { openIncident } from '../incidents/service.js';
import {
  classifyVoiceTurn,
  isSupportedVoiceLanguage,
  VoiceFailure,
  type VoiceClassification,
  type VoiceTurnInput,
} from './classify.js';
import type { VoxideProvider } from './provider.js';

export interface VoiceTurnResult {
  incident: Incident;
  heard: string | null;
  reply: string;
  source: 'protocol' | 'safe_fallback';
  failure: VoiceFailure | null;
}

export interface HandleVoiceTurnInput extends VoiceTurnInput {
  incidentId: string;
  audioBase64?: string;
  mimeType?: string;
}

export function parseVoiceTurnBody(incidentId: string, body: unknown): HandleVoiceTurnInput {
  const record = body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  return {
    incidentId,
    transcript: typeof record['transcript'] === 'string' ? record['transcript'] : undefined,
    recognitionConfidence:
      typeof record['recognitionConfidence'] === 'number' ? record['recognitionConfidence'] : undefined,
    audioBase64: typeof record['audioBase64'] === 'string' ? record['audioBase64'] : undefined,
    mimeType: typeof record['mimeType'] === 'string' ? record['mimeType'] : undefined,
    silence: Boolean(record['silence']),
    timeout: Boolean(record['timeout']),
    interrupted: Boolean(record['interrupted']),
    recognitionFailed: Boolean(record['recognitionFailed']),
  };
}

function currentPrompt(incident: Incident): string {
  const protocol = publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  const step = protocol ? currentStep(protocol, incident.state) : null;
  if (step) return stepPrompt(step, incident.language);
  return safePhrases(incident.language).stayWithThem;
}

async function persistAndInterpret(
  incident: Incident,
  transcript: string,
  confidence: number | null,
  llmProvider: LlmProvider,
): Promise<VoiceTurnResult> {
  const history = formatHistory(await listConversationMessages(incident.id));
  let interpreted;
  try {
    interpreted = await interpretTurn({
      incident,
      transcript,
      history,
      protocols: publishedProtocols,
      provider: llmProvider,
    });
  } catch (error) {
    // A failed turn is not stored, so the next turn does not re-answer a question that never got a reply.
    if (error instanceof UpstreamUnavailableError) {
      return {
        incident,
        heard: null,
        reply: safePhrases(incident.language).noConnection,
        source: 'safe_fallback',
        failure: VoiceFailure.UPSTREAM,
      };
    }
    if (error instanceof AiValidationError) {
      return {
        incident,
        heard: null,
        reply: safePhrases(incident.language).sayAgain,
        source: 'safe_fallback',
        failure: null,
      };
    }
    throw error;
  }

  const committed = await commitIncidentMutation(interpreted.incident, interpreted.events);
  const heardAt = new Date();
  await Promise.all([
    insertConversationMessage({
      incidentId: incident.id,
      role: MessageRole.USER,
      transcript,
      language: incident.language,
      recognitionConfidence: confidence,
      createdAt: heardAt.toISOString(),
    }),
    insertConversationMessage({
      incidentId: incident.id,
      role: MessageRole.ASSISTANT,
      transcript: interpreted.reply,
      language: committed.incident.language,
      recognitionConfidence: null,
      createdAt: new Date(heardAt.getTime() + 1).toISOString(),
    }),
  ]);

  return {
    incident: committed.incident,
    heard: transcript,
    reply: interpreted.reply,
    source: interpreted.source,
    failure: null,
  };
}

function rejected(incident: Incident, classification: Extract<VoiceClassification, { action: 'reject' }>): VoiceTurnResult {
  return {
    incident,
    heard: null,
    reply: classification.reply,
    source: 'safe_fallback',
    failure: classification.failure,
  };
}

export function toVoiceTurnResponse(result: VoiceTurnResult): VoiceTurnResponse {
  return {
    incidentId: result.incident.id,
    voiceSessionId: result.incident.sessionId,
    phase: voicePhase(result),
    heard: result.heard,
    reply: prepareSpokenLine(result.reply),
    source: result.source,
    failure: result.failure,
    capability: isPlaceCallStep(result.incident.state.currentStepId) ? 'place_call' : null,
  };
}

function voicePhase(result: VoiceTurnResult): VoiceSessionPhase {
  if (result.failure) return VoiceSessionPhase.ERROR;
  if (result.incident.state.actions.some((action) => action.status === ActionStatus.GIVEN)) {
    return VoiceSessionPhase.AWAITING_CONFIRMATION;
  }
  return VoiceSessionPhase.SPEAKING;
}

export async function startVoiceSession(input: {
  language: Language;
  sessionId?: string;
}): Promise<{ incident: Incident }> {
  if (!isSupportedVoiceLanguage(input.language)) {
    throw new ValidationError('Unsupported voice language', [
      { path: 'language', message: `must be one of ${['en', 'am', 'om'].join(', ')}` },
    ]);
  }
  const incident = await openIncident({
    language: input.language,
    ...(input.sessionId ? { sessionId: input.sessionId } : {}),
  });
  return { incident };
}

/**
 * One spoken turn. Voxide (or the browser) supplies speech; this function
 * decides whether it may change state and what the user is told to hear next.
 */
export async function handleVoiceTurn(
  input: HandleVoiceTurnInput,
  deps: { llmProvider: LlmProvider; voxideProvider?: VoxideProvider | null },
): Promise<VoiceTurnResult> {
  const incident = await getIncidentById(input.incidentId);

  let transcript = input.transcript;
  let confidence = input.recognitionConfidence ?? null;

  if ((!transcript || transcript.trim() === '') && input.audioBase64) {
    if (!deps.voxideProvider) {
      throw new UpstreamUnavailableError('Voxide');
    }
    try {
      const heard = await deps.voxideProvider.transcribe({
        audioBase64: input.audioBase64,
        language: incident.language,
        mimeType: input.mimeType,
      });
      transcript = heard.transcript;
      confidence = heard.confidence;
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) {
        return {
          incident,
          heard: null,
          reply: safePhrases(incident.language).sayAgain,
          source: 'safe_fallback',
          failure: VoiceFailure.UPSTREAM,
        };
      }
      throw error;
    }
  }

  const classification = classifyVoiceTurn({
    transcript,
    language: incident.language,
    recognitionConfidence: confidence,
    silence: input.silence,
    timeout: input.timeout,
    interrupted: input.interrupted,
    recognitionFailed: input.recognitionFailed,
  });

  if (classification.action === 'reject') {
    return rejected(incident, classification);
  }

  if (classification.action === 'repeat') {
    return {
      incident,
      heard: transcript?.trim() ?? null,
      reply: currentPrompt(incident),
      source: incident.state.currentProtocolId ? 'protocol' : 'safe_fallback',
      failure: null,
    };
  }

  return persistAndInterpret(incident, classification.transcript, classification.confidence, deps.llmProvider);
}
