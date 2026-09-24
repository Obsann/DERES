import { EventSource, MessageRole, type Incident, type Language } from '@voicesos/shared';
import { interpretTurn } from '../ai/orchestrate.js';
import { SAFE_PHRASES } from '../ai/phrases.js';
import { currentStep, stepPrompt } from '../protocols/engine.js';
import { publishedProtocols } from '../protocols/catalog.js';
import type { LlmProvider } from '../ai/provider.js';
import { UpstreamUnavailableError, ValidationError } from '../common/errors.js';
import { nowIso } from '../database/ids.js';
import { getIncidentById, insertConversationMessage } from '../database/persist.js';
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

function currentPrompt(incident: Incident): string {
  const protocol = publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  const step = protocol ? currentStep(protocol, incident.state) : null;
  if (step) return stepPrompt(step, incident.language);
  return SAFE_PHRASES.stayWithThem;
}

async function persistAndInterpret(
  incident: Incident,
  transcript: string,
  confidence: number | null,
  llmProvider: LlmProvider,
): Promise<VoiceTurnResult> {
  await insertConversationMessage({
    incidentId: incident.id,
    role: MessageRole.USER,
    transcript,
    language: incident.language,
    recognitionConfidence: confidence,
  });

  const interpreted = await interpretTurn({
    incident,
    transcript,
    protocols: publishedProtocols,
    provider: llmProvider,
  });
  const committed = await commitIncidentMutation(interpreted.incident, interpreted.events);
  await insertConversationMessage({
    incidentId: incident.id,
    role: MessageRole.ASSISTANT,
    transcript: interpreted.reply,
    language: committed.incident.language,
    recognitionConfidence: null,
  });

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
          reply: SAFE_PHRASES.sayAgain,
          source: 'safe_fallback',
          failure: VoiceFailure.UPSTREAM,
        };
      }
      throw error;
    }
  }

  const classification = classifyVoiceTurn({
    transcript,
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
