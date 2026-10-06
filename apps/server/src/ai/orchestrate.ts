import {
  ActionStatus,
  AgeGroup,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EventSource,
  ProtocolStepKind,
  type Incident,
  type IsoDateTime,
  type Protocol,
  type ProtocolStep,
} from '@voicesos/shared';
import { nowIso } from '../database/ids.js';
import { applyCommand, type EngineEvent, type TransitionResult } from '../incidents/stateEngine.js';
import {
  answerProtocolStep,
  currentStep,
  giveProtocolAction,
  selectPublishedProtocol,
  startProtocol,
  stepPrompt,
  resolveProtocolAction,
} from '../protocols/index.js';
import { safePhrases } from './phrases.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';
import type { LlmProvider } from './provider.js';
import { runSafetyPipeline } from './pipeline.js';
import { LlmIntent, type LlmExtraction } from './schema.js';

export interface InterpretTurnInput {
  incident: Incident;
  transcript: string;
  protocols: Protocol[];
  provider: LlmProvider;
  at?: IsoDateTime;
}

export interface InterpretTurnResult {
  incident: Incident;
  events: EngineEvent[];
  /** Spoken line. Always protocol text or a fixed safe phrase — never model prose. */
  reply: string;
  source: 'protocol' | 'safe_fallback';
}

class ResultBuilder {
  incident: Incident;
  events: EngineEvent[] = [];

  constructor(incident: Incident) {
    this.incident = incident;
  }

  push(result: TransitionResult): void {
    this.incident = result.incident;
    this.events.push(...result.events);
  }
}

const UNRESPONSIVE_REPORT =
  /collapsed|unconscious|not responding|unresponsive|fainted|passed out|ወድቋ|ወደቀ|አይመልስም|ምላሽ አይሰጥ|kufe|deebii hin kenn|hin deebine/iu;

/**
 * A collapsed, unresponsive person is the one emergency this build can guide.
 * When the utterance says so plainly, those facts are filled in even if the
 * model did not recognise the language.
 */
function withTranscriptHints(transcript: string, extraction: LlmExtraction): LlmExtraction {
  if (!UNRESPONSIVE_REPORT.test(transcript)) return extraction;
  const modelWasUnsure = extraction.intent === LlmIntent.UNSUPPORTED || extraction.intent === LlmIntent.UNKNOWN;
  return {
    ...extraction,
    emergencyType: extraction.emergencyType ?? EmergencyType.UNCONSCIOUS,
    emergencyTypeConfidence: extraction.emergencyType
      ? extraction.emergencyTypeConfidence
      : Math.max(extraction.emergencyTypeConfidence, 0.8),
    consciousness:
      extraction.consciousness && extraction.consciousness !== ConsciousnessState.UNKNOWN
        ? extraction.consciousness
        : ConsciousnessState.UNRESPONSIVE,
    questionAnswer: extraction.questionAnswer ?? ConsciousnessState.UNRESPONSIVE,
    intent: modelWasUnsure ? LlmIntent.ANSWER : extraction.intent,
    unsupportedRequest: modelWasUnsure ? null : extraction.unsupportedRequest,
  };
}

function activeProtocol(incident: Incident, protocols: Protocol[]): Protocol | null {
  if (incident.state.currentProtocolId) {
    return protocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;
  }
  return selectPublishedProtocol(incident.state, protocols);
}

function mapQuestionAnswer(step: ProtocolStep, extraction: LlmExtraction): string | null {
  if (extraction.questionAnswer && step.acceptedAnswers.includes(extraction.questionAnswer)) {
    return extraction.questionAnswer;
  }
  if (step.updatesField === 'patient.consciousness' && extraction.consciousness) {
    return extraction.consciousness;
  }
  if (step.updatesField === 'patient.breathing' && extraction.breathing) {
    return extraction.breathing;
  }
  if (step.updatesField === 'patient.ageGroup' && extraction.ageGroup) {
    return extraction.ageGroup;
  }
  if (extraction.certainty === Certainty.UNCERTAIN || extraction.certainty === Certainty.UNKNOWN) {
    return extraction.questionAnswer ?? 'unknown';
  }
  if (extraction.questionAnswer) return extraction.questionAnswer;
  return null;
}

function applyFacts(builder: ResultBuilder, extraction: LlmExtraction, at: IsoDateTime): void {
  const state = builder.incident.state;
  const source = EventSource.AI;

  const describedAsUnresponsive =
    extraction.consciousness === ConsciousnessState.UNRESPONSIVE && !extraction.emergencyType;
  const emergencyType = extraction.emergencyType ?? (describedAsUnresponsive ? EmergencyType.UNCONSCIOUS : null);
  if (emergencyType && state.emergencyType === EmergencyType.UNKNOWN) {
    builder.push(
      applyCommand(
        builder.incident,
        {
          kind: 'set_emergency_type',
          emergencyType,
          confidence: extraction.emergencyTypeConfidence,
          source,
        },
        at,
      ),
    );
  }

  if (extraction.ageGroup && state.patient.ageGroup === AgeGroup.UNKNOWN) {
    builder.push(
      applyCommand(
        builder.incident,
        { kind: 'set_patient_fact', field: 'ageGroup', value: extraction.ageGroup, source },
        at,
      ),
    );
  }

  if (extraction.peopleAffected !== null && state.peopleAffected === null) {
    builder.push(
      applyCommand(
        builder.incident,
        { kind: 'set_people_affected', peopleAffected: extraction.peopleAffected, source },
        at,
      ),
    );
  }

  if (extraction.locationDescription && !state.location?.description) {
    const coordinates = state.location;
    builder.push(
      applyCommand(
        builder.incident,
        {
          kind: 'set_location',
          location: {
            description: extraction.locationDescription,
            latitude: coordinates?.latitude ?? null,
            longitude: coordinates?.longitude ?? null,
            accuracyMeters: coordinates?.accuracyMeters ?? null,
            certainty:
              coordinates?.certainty === Certainty.KNOWN || extraction.certainty === Certainty.KNOWN
                ? Certainty.KNOWN
                : Certainty.UNCERTAIN,
            reportedAt: at,
          },
          source,
        },
        at,
      ),
    );
  }

  for (const symptom of extraction.symptoms) {
    builder.push(
      applyCommand(builder.incident, { kind: 'add_symptom', symptom, source }, at),
    );
  }
  for (const observation of extraction.observations) {
    builder.push(
      applyCommand(builder.incident, { kind: 'add_observation', observation, source }, at),
    );
  }
}

function ensureProtocol(builder: ResultBuilder, protocols: Protocol[], at: IsoDateTime): Protocol | null {
  if (builder.incident.state.currentProtocolId) {
    return protocols.find((item) => item.id === builder.incident.state.currentProtocolId) ?? null;
  }
  const selected = selectPublishedProtocol(builder.incident.state, protocols);
  if (!selected) return null;
  builder.push(startProtocol(builder.incident, selected, at));
  return selected;
}

function giveCurrentActionIfNeeded(builder: ResultBuilder, protocol: Protocol, at: IsoDateTime): void {
  const step = currentStep(protocol, builder.incident.state);
  if (!step || (step.kind !== ProtocolStepKind.ACTION && step.kind !== ProtocolStepKind.ESCALATION)) {
    return;
  }
  const given = builder.incident.state.actions.some(
    (action) => action.stepId === step.id && action.status === ActionStatus.GIVEN,
  );
  if (!given) {
    builder.push(giveProtocolAction(builder.incident, protocol, at));
  }
}

function applyProtocolTurn(
  builder: ResultBuilder,
  protocol: Protocol,
  extraction: LlmExtraction,
  at: IsoDateTime,
): void {
  const step = currentStep(protocol, builder.incident.state);
  if (!step) return;

  if (step.kind === ProtocolStepKind.QUESTION || step.kind === ProtocolStepKind.ASSESSMENT) {
    const answer = mapQuestionAnswer(step, extraction);
    if (answer) {
      builder.push(
        answerProtocolStep(
          builder.incident,
          protocol,
          { answer, certainty: extraction.certainty },
          at,
        ),
      );
    }
  }

  if (step.kind === ProtocolStepKind.ACTION || step.kind === ProtocolStepKind.ESCALATION) {
    giveCurrentActionIfNeeded(builder, protocol, at);
    if (extraction.actionStatus) {
      builder.push(
        resolveProtocolAction(builder.incident, protocol, extraction.actionStatus, at),
      );
    }
  }

  giveCurrentActionIfNeeded(builder, protocol, at);
}

function spokenReply(incident: Incident, protocol: Protocol | null, blocked: boolean): InterpretTurnResult {
  const step = protocol ? currentStep(protocol, incident.state) : null;
  const protocolLine = step ? stepPrompt(step, incident.language) : null;
  const phrases = safePhrases(incident.language);

  if (!protocol) {
    return {
      incident,
      events: [],
      reply: phrases.unsupportedEmergency,
      source: 'safe_fallback',
    };
  }

  if (blocked) {
    const rest = protocolLine ?? phrases.stayWithThem;
    return {
      incident,
      events: [],
      reply: `${phrases.cannotInvent} ${rest}`,
      source: 'safe_fallback',
    };
  }

  return {
    incident,
    events: [],
    reply: protocolLine ?? phrases.stayWithThem,
    source: protocolLine ? 'protocol' : 'safe_fallback',
  };
}

/**
 * One conversation turn: the model interprets language; the protocol engine
 * decides what the user is told.
 */
export async function interpretTurn(input: InterpretTurnInput): Promise<InterpretTurnResult> {
  const at = input.at ?? nowIso();
  const protocolForPrompt = activeProtocol(input.incident, input.protocols);
  const raw = await input.provider.complete({
    system: buildSystemPrompt(input.incident, protocolForPrompt),
    user: buildUserPrompt(input.transcript),
  });
  const extraction = withTranscriptHints(
    input.transcript,
    runSafetyPipeline(raw, {
      incident: input.incident,
      protocol: protocolForPrompt,
    }),
  );

  return applyExtraction(input.incident, extraction, input.protocols, at);
}

/**
 * Applies an already-validated extraction to the incident and picks the spoken
 * line. Voice turns reach this through the LLM and safety pipeline; button
 * presses build the extraction on the server and skip the model entirely.
 */
export function applyExtraction(
  incident: Incident,
  extraction: LlmExtraction,
  protocols: Protocol[],
  at: IsoDateTime,
): InterpretTurnResult {
  if (extraction.intent === LlmIntent.REPEAT) {
    const spoken = spokenReply(incident, activeProtocol(incident, protocols), false);
    return { ...spoken, incident, events: [] };
  }

  const builder = new ResultBuilder(incident);
  applyFacts(builder, extraction, at);
  const protocol = ensureProtocol(builder, protocols, at);
  if (protocol) {
    applyProtocolTurn(builder, protocol, extraction, at);
  }

  // A turn that established facts is a description, even if the model also set
  // "unsupported". Refuse only when nothing usable was extracted.
  const blocked =
    builder.events.length === 0 &&
    (Boolean(extraction.unsupportedRequest) || extraction.intent === LlmIntent.UNSUPPORTED);
  const spoken = spokenReply(builder.incident, protocol, blocked);
  return {
    incident: builder.incident,
    events: builder.events,
    reply: spoken.reply,
    source: spoken.source,
  };
}
