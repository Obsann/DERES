import {
  AgeGroup,
  BreathingState,
  ConditionOperator,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  Language,
  ProtocolStepKind,
  type Protocol,
  type ProtocolCondition,
} from '@voicesos/shared';

const RETRIEVED_AT = '2026-09-22T00:00:00.000Z';
const CREATED_AT = '2026-09-22T18:00:00.000Z';

function eq(id: string, field: string, value: string, description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.EQUALS, value };
}

function unknown(id: string, field: string, description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.IS_UNKNOWN, value: null };
}

function inValues(id: string, field: string, value: string[], description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.IN, value };
}

/**
 * Unresponsive adult — the MVP emergency protocol.
 *
 * Adult lay-rescuer Basic Life Support only. The protocol engine reads this
 * document; the LLM may rephrase a prompt but may not add a step.
 *
 * Source: European Resuscitation Council Guidelines 2021, Basic Life Support.
 */
export const unconsciousAdultProtocol: Protocol = {
  id: 'protocol-unconscious-adult',
  name: 'Unresponsive adult',
  version: '1.0.0',
  emergencyType: EmergencyType.UNCONSCIOUS,
  source: {
    organisation: 'European Resuscitation Council',
    title: 'ERC Guidelines 2021: Basic Life Support',
    url: 'https://cprguidelines.eu/',
    edition: '2021',
    retrievedAt: RETRIEVED_AT,
    notes:
      'Adult lay-rescuer path only. Untrained helpers are instructed to use compression-only chest compressions. Not a substitute for local emergency-service instructions.',
  },
  entryConditions: [
    eq('entry-type', 'emergencyType', EmergencyType.UNCONSCIOUS, 'Emergency is an unresponsive or collapsed person'),
    inValues('entry-age', 'patient.ageGroup', [AgeGroup.ADULT, AgeGroup.UNKNOWN], 'Adult or age not yet established'),
  ],
  initialStepId: 'step-check-response',
  steps: [
    {
      id: 'step-check-response',
      kind: ProtocolStepKind.QUESTION,
      label: 'Check response',
      prompt: {
        [Language.ENGLISH]: 'Tap their shoulders and shout. Are they responding to you?',
      },
      entryConditions: [],
      acceptedAnswers: [ConsciousnessState.UNRESPONSIVE, ConsciousnessState.RESPONSIVE],
      updatesField: 'patient.consciousness',
      transitions: [
        {
          toStepId: 'step-call-ems',
          conditions: [eq('resp-no', 'patient.consciousness', ConsciousnessState.UNRESPONSIVE, 'No response')],
          description: 'Unresponsive: call emergency services',
        },
        {
          toStepId: 'step-call-ems',
          conditions: [unknown('resp-unknown', 'patient.consciousness', 'Response not established')],
          description: 'Uncertain response: treat as unresponsive',
        },
        {
          toStepId: 'step-stay-responsive',
          conditions: [eq('resp-yes', 'patient.consciousness', ConsciousnessState.RESPONSIVE, 'They are responding')],
          description: 'Responsive: this protocol ends',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-call-ems',
    },
    {
      id: 'step-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Put the phone on speaker if you can.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-open-airway',
          conditions: [],
          description: 'After help is called, open the airway',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-open-airway',
    },
    {
      id: 'step-open-airway',
      kind: ProtocolStepKind.ACTION,
      label: 'Open the airway',
      prompt: {
        [Language.ENGLISH]: 'Tilt the head back and lift the chin to open the airway.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-check-breathing',
          conditions: [],
          description: 'Then check breathing',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-check-breathing',
    },
    {
      id: 'step-check-breathing',
      kind: ProtocolStepKind.QUESTION,
      label: 'Check breathing',
      prompt: {
        [Language.ENGLISH]: 'Look, listen and feel for up to 10 seconds. Are they breathing normally?',
      },
      entryConditions: [],
      acceptedAnswers: [BreathingState.NORMAL, BreathingState.ABNORMAL, BreathingState.ABSENT],
      updatesField: 'patient.breathing',
      transitions: [
        {
          toStepId: 'step-cpr',
          conditions: [eq('breath-absent', 'patient.breathing', BreathingState.ABSENT, 'Not breathing')],
          description: 'No breathing: start chest compressions',
        },
        {
          toStepId: 'step-cpr',
          conditions: [eq('breath-abnormal', 'patient.breathing', BreathingState.ABNORMAL, 'Not breathing normally')],
          description: 'Abnormal breathing: start chest compressions',
        },
        {
          toStepId: 'step-cpr',
          conditions: [unknown('breath-unknown', 'patient.breathing', 'Breathing not established')],
          description: 'Uncertain breathing: treat as not breathing normally',
        },
        {
          toStepId: 'step-recovery-position',
          conditions: [eq('breath-normal', 'patient.breathing', BreathingState.NORMAL, 'Breathing normally')],
          description: 'Breathing normally: recovery position',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-cpr',
    },
    {
      id: 'step-cpr',
      kind: ProtocolStepKind.ACTION,
      label: 'Chest compressions',
      prompt: {
        [Language.ENGLISH]:
          'Push hard and fast in the centre of the chest. Keep going until help takes over. Do not stop to check for a pulse.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-wait-for-help',
          conditions: [],
          description: 'Continue until professional help takes over',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-wait-for-help',
    },
    {
      id: 'step-recovery-position',
      kind: ProtocolStepKind.ACTION,
      label: 'Recovery position',
      prompt: {
        [Language.ENGLISH]: 'Roll them onto their side. Tilt the head back so they can keep breathing. Stay with them.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-stay-breathing',
          conditions: [],
          description: 'Keep checking breathing until help arrives',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-stay-breathing',
    },
    {
      id: 'step-wait-for-help',
      kind: ProtocolStepKind.EXIT,
      label: 'Continue until help arrives',
      prompt: {
        [Language.ENGLISH]: 'Keep pushing in the centre of the chest until emergency services take over.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [],
      requiresConfirmation: false,
      onUncertain: null,
    },
    {
      id: 'step-stay-breathing',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay and keep checking',
      prompt: {
        [Language.ENGLISH]: 'Stay with them. If breathing stops, start pushing in the centre of the chest.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [],
      requiresConfirmation: false,
      onUncertain: null,
    },
    {
      id: 'step-stay-responsive',
      kind: ProtocolStepKind.EXIT,
      label: 'They are responding',
      prompt: {
        [Language.ENGLISH]: 'They are responding. Stay with them and keep checking while you wait for help if you have already called.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [],
      requiresConfirmation: false,
      onUncertain: null,
    },
  ],
  contraindications: [
    {
      id: 'no-oral',
      prohibitedAction: 'Give food or drink',
      conditions: [
        eq('no-oral-unresponsive', 'patient.consciousness', ConsciousnessState.UNRESPONSIVE, 'Unresponsive'),
      ],
      reason: 'An unresponsive person can choke',
    },
    {
      id: 'no-leave',
      prohibitedAction: 'Leave them alone',
      conditions: [
        eq('no-leave-unresponsive', 'patient.consciousness', ConsciousnessState.UNRESPONSIVE, 'Unresponsive'),
      ],
      reason: 'An unresponsive person must not be left unattended',
    },
    {
      id: 'no-pillow',
      prohibitedAction: 'Put a pillow under the head',
      conditions: [
        eq('no-pillow-unresponsive', 'patient.consciousness', ConsciousnessState.UNRESPONSIVE, 'Unresponsive'),
      ],
      reason: 'Extra support under the head can close the airway',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-child',
      conditions: [
        inValues('esc-child', 'patient.ageGroup', [AgeGroup.INFANT, AgeGroup.CHILD], 'Not an adult'),
      ],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'This guidance is for adults. Call emergency services and follow their instructions.',
      },
      reason: 'Pediatric resuscitation is outside this protocol',
    },
    {
      id: 'escalate-not-breathing',
      conditions: [
        inValues(
          'esc-not-breathing',
          'patient.breathing',
          [BreathingState.ABSENT, BreathingState.ABNORMAL],
          'Not breathing normally',
        ),
      ],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Keep the emergency services on the line and start chest compressions.',
      },
      reason: 'Unresponsive and not breathing normally',
    },
    {
      id: 'escalate-unresponsive',
      conditions: [
        eq('esc-unresponsive', 'patient.consciousness', ConsciousnessState.UNRESPONSIVE, 'Person is unresponsive'),
      ],
      escalateTo: EscalationState.RECOMMENDED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now.',
      },
      reason: 'Unresponsive adult needs professional help',
    },
  ],
  exitConditions: [
    eq('exit-responsive', 'patient.consciousness', ConsciousnessState.RESPONSIVE, 'Person is responding'),
  ],
  languages: [Language.ENGLISH],
  published: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

export const publishedProtocols: Protocol[] = [unconsciousAdultProtocol];
