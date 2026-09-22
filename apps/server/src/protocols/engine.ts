import {
  type EmergencyState,
  type EscalationRule,
  type Id,
  type Language,
  type Protocol,
  type ProtocolStep,
} from '@voicesos/shared';
import { ProtocolViolationError } from '../common/errors.js';
import { conditionsHold } from './conditions.js';

export function findProtocolStep(protocol: Protocol, stepId: Id): ProtocolStep {
  const step = protocol.steps.find((item) => item.id === stepId);
  if (!step) {
    throw new ProtocolViolationError(`Protocol '${protocol.id}' has no step '${stepId}'`, {
      protocolId: protocol.id,
      stepId,
    });
  }
  return step;
}

export function currentStep(protocol: Protocol, state: EmergencyState): ProtocolStep | null {
  if (state.currentProtocolId !== protocol.id || state.currentStepId === null) return null;
  return findProtocolStep(protocol, state.currentStepId);
}

export function selectPublishedProtocol(state: EmergencyState, protocols: Protocol[]): Protocol | null {
  return (
    protocols.find(
      (protocol) =>
        protocol.published &&
        protocol.emergencyType === state.emergencyType &&
        conditionsHold(state, protocol.entryConditions),
    ) ?? null
  );
}

export function assertProtocolSelectable(protocol: Protocol, state: EmergencyState): void {
  if (!protocol.published) {
    throw new ProtocolViolationError('Unpublished protocols cannot be selected', {
      protocolId: protocol.id,
    });
  }
  if (protocol.emergencyType !== state.emergencyType) {
    throw new ProtocolViolationError('Protocol does not match the established emergency type', {
      protocolId: protocol.id,
      emergencyType: state.emergencyType,
    });
  }
  if (!conditionsHold(state, protocol.entryConditions)) {
    throw new ProtocolViolationError('Protocol entry conditions are not met', {
      protocolId: protocol.id,
    });
  }
}

export function nextStepId(protocol: Protocol, state: EmergencyState, fromStepId: Id): Id | null {
  const step = findProtocolStep(protocol, fromStepId);
  const match = step.transitions.find((transition) => conditionsHold(state, transition.conditions));
  if (!match) {
    throw new ProtocolViolationError('No permitted transition from this protocol step', {
      protocolId: protocol.id,
      stepId: fromStepId,
    });
  }
  return match.toStepId;
}

export function matchingEscalation(protocol: Protocol, state: EmergencyState): EscalationRule | null {
  return protocol.escalationRules.find((rule) => conditionsHold(state, rule.conditions)) ?? null;
}

export function matchingContraindication(protocol: Protocol, state: EmergencyState, instruction: string) {
  const needle = instruction.trim().toLowerCase();
  return (
    protocol.contraindications.find((item) => {
      if (!conditionsHold(state, item.conditions)) return false;
      return needle.includes(item.prohibitedAction.toLowerCase()) || item.prohibitedAction.toLowerCase().includes(needle);
    }) ?? null
  );
}

export function assertActionPermitted(protocol: Protocol, state: EmergencyState, instruction: string): void {
  const blocked = matchingContraindication(protocol, state, instruction);
  if (blocked) {
    throw new ProtocolViolationError(blocked.reason, {
      protocolId: protocol.id,
      contraindicationId: blocked.id,
      prohibitedAction: blocked.prohibitedAction,
    });
  }
}

export function stepPrompt(step: ProtocolStep, language: Language): string {
  const text = step.prompt[language] ?? step.prompt.en;
  if (!text) {
    throw new ProtocolViolationError(`Protocol step '${step.id}' has no prompt for this language`, {
      stepId: step.id,
      language,
    });
  }
  return text;
}

export function protocolHasExited(protocol: Protocol, state: EmergencyState): boolean {
  return conditionsHold(state, protocol.exitConditions);
}
