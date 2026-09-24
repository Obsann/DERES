import {
  ActionStatus,
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  WarningSeverity,
  type Handoff,
  type HandoffFact,
  type HandoffWarning,
  type Id,
  type Incident,
  type IncidentEvent,
  type IsoDateTime,
  type Protocol,
  type UncertaintyNote,
} from '@voicesos/shared';
import { createId } from '../database/ids.js';
import { hasUncertainty, unknownFacts } from '../incidents/facts.js';

const FIELD_LABELS: Record<string, string> = {
  emergencyType: 'Emergency type',
  location: 'Location',
  peopleAffected: 'People affected',
  'patient.ageGroup': 'Age group',
  'patient.consciousness': 'Consciousness',
  'patient.breathing': 'Breathing',
};

function knownFact(label: string, value: string, establishedAt: IsoDateTime | null): HandoffFact {
  return { label, value, certainty: Certainty.KNOWN, establishedAt };
}

function derivedUnknown(field: string, at: IsoDateTime): UncertaintyNote {
  return {
    field,
    reason: `${FIELD_LABELS[field] ?? field} was never established`,
    source: EventSource.SYSTEM,
    recordedAt: at,
  };
}

function collectUncertainty(incident: Incident, at: IsoDateTime): UncertaintyNote[] {
  const notes = [...incident.state.uncertainty];
  for (const field of unknownFacts(incident.state)) {
    if (!hasUncertainty(incident.state, field)) {
      notes.push(derivedUnknown(field, at));
    }
  }
  return notes;
}

function criticalInformation(incident: Incident): HandoffFact[] {
  const { state } = incident;
  const facts: HandoffFact[] = [];
  const at = state.updatedAt;

  if (state.emergencyType !== EmergencyType.UNKNOWN) {
    facts.push(knownFact('Emergency type', state.emergencyType, at));
  }
  if (state.patient.consciousness !== ConsciousnessState.UNKNOWN) {
    facts.push(knownFact('Consciousness', state.patient.consciousness, at));
  }
  if (state.patient.breathing !== BreathingState.UNKNOWN) {
    facts.push(knownFact('Breathing', state.patient.breathing, at));
  }
  if (state.patient.ageGroup !== AgeGroup.UNKNOWN) {
    facts.push(knownFact('Age group', state.patient.ageGroup, at));
  }
  if (state.peopleAffected !== null) {
    facts.push(knownFact('People affected', String(state.peopleAffected), at));
  }
  if (state.location && state.location.certainty === Certainty.KNOWN) {
    const value = state.location.description ?? `${state.location.latitude},${state.location.longitude}`;
    if (value && value !== 'null,null') {
      facts.push(knownFact('Location', value, state.location.reportedAt));
    }
  }

  return facts;
}

function warnings(incident: Incident): HandoffWarning[] {
  const items: HandoffWarning[] = [];
  const { state } = incident;

  if (state.escalationStatus === EscalationState.ESCALATED) {
    items.push({ severity: WarningSeverity.CRITICAL, message: 'Incident is escalated; professional help is involved or underway' });
  } else if (state.escalationStatus === EscalationState.RECOMMENDED) {
    items.push({ severity: WarningSeverity.CRITICAL, message: 'Professional help has been recommended' });
  }

  if (state.emergencyType === EmergencyType.UNKNOWN) {
    items.push({ severity: WarningSeverity.IMPORTANT, message: 'Emergency type was never established' });
  }

  if (
    state.patient.consciousness === ConsciousnessState.UNRESPONSIVE &&
    state.patient.breathing === BreathingState.UNKNOWN
  ) {
    items.push({
      severity: WarningSeverity.CRITICAL,
      message: 'Person is unresponsive and breathing was never established',
    });
  }

  const outstanding = state.actions.filter((action) => action.status === ActionStatus.GIVEN);
  if (outstanding.length > 0) {
    items.push({
      severity: WarningSeverity.IMPORTANT,
      message: `${outstanding.length} instruction(s) given but not confirmed`,
    });
  }

  return items;
}

function protocolLabels(incident: Incident, protocol: Protocol | null): {
  currentProtocolName: string | null;
  currentStepLabel: string | null;
} {
  if (!protocol || protocol.id !== incident.state.currentProtocolId) {
    return { currentProtocolName: protocol?.name ?? null, currentStepLabel: null };
  }
  const step = protocol.steps.find((item) => item.id === incident.state.currentStepId);
  return {
    currentProtocolName: protocol.name,
    currentStepLabel: step?.label ?? null,
  };
}

/**
 * Build a responder handoff from the incident record only.
 *
 * Unknown fields become uncertainty, never a stated fact. The timeline is the
 * events that were passed in; none are invented here.
 */
export function generateHandoff(input: {
  incident: Incident;
  timeline: IncidentEvent[];
  protocol?: Protocol | null;
  version: number;
  at: IsoDateTime;
  id?: Id;
}): Handoff {
  const { incident, timeline, protocol = null, version, at } = input;
  const labels = protocolLabels(incident, protocol);

  return {
    id: input.id ?? createId(),
    incidentId: incident.id,
    version,
    emergencyType: incident.state.emergencyType,
    location: incident.state.location,
    startedAt: incident.startedAt,
    peopleAffected: incident.state.peopleAffected,
    patient: incident.state.patient,
    criticalInformation: criticalInformation(incident),
    observedSymptoms: [...incident.state.patient.majorSymptoms],
    questionsAnswered: [...incident.state.relevantAnswers],
    actionsTaken: [...incident.state.actions],
    currentProtocolId: incident.state.currentProtocolId,
    currentProtocolName: labels.currentProtocolName,
    currentStepLabel: labels.currentStepLabel,
    status: incident.status,
    escalationStatus: incident.state.escalationStatus,
    uncertainty: collectUncertainty(incident, at),
    warnings: warnings(incident),
    timeline,
    generatedAt: at,
  };
}
