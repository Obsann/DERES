import {
  ConditionOperator,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  Language,
  ProtocolStepKind,
  type Protocol,
} from '@voicesos/shared';

const AT = '2026-09-22T18:00:00.000Z';

/**
 * Minimal published protocol used to prove the engine, not to guide a real
 * emergency. Task 6 replaces this with the approved MVP scenario.
 *
 * Path under test: entry → question → action → confirmation → next step.
 */
export const foundationProtocol: Protocol = {
  id: 'protocol-foundation',
  name: 'Foundation engine fixture',
  version: '0.1.0',
  emergencyType: EmergencyType.UNCONSCIOUS,
  source: {
    organisation: 'DERES test fixture',
    title: 'Protocol engine foundation fixture',
    url: null,
    edition: 'test',
    retrievedAt: AT,
    notes: 'Not clinical content. Used only to verify Task 5 execution.',
  },
  entryConditions: [
    {
      id: 'entry-unconscious',
      description: 'Emergency type is an unresponsive or collapsed person',
      field: 'emergencyType',
      operator: ConditionOperator.EQUALS,
      value: EmergencyType.UNCONSCIOUS,
    },
  ],
  initialStepId: 'step-check-response',
  steps: [
    {
      id: 'step-check-response',
      kind: ProtocolStepKind.QUESTION,
      label: 'Check response',
      prompt: { [Language.ENGLISH]: 'Are they responding to you?' },
      entryConditions: [],
      acceptedAnswers: [ConsciousnessState.UNRESPONSIVE, ConsciousnessState.RESPONSIVE],
      updatesField: 'patient.consciousness',
      transitions: [
        {
          toStepId: 'step-call-help',
          conditions: [
            {
              id: 'to-call-help',
              description: 'Person is unresponsive',
              field: 'patient.consciousness',
              operator: ConditionOperator.EQUALS,
              value: ConsciousnessState.UNRESPONSIVE,
            },
          ],
          description: 'Call for help when there is no response',
        },
        {
          toStepId: 'step-exit-responsive',
          conditions: [
            {
              id: 'to-exit-responsive',
              description: 'Person is responsive',
              field: 'patient.consciousness',
              operator: ConditionOperator.EQUALS,
              value: ConsciousnessState.RESPONSIVE,
            },
          ],
          description: 'Leave the unresponsive protocol if they are responding',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-call-help',
    },
    {
      id: 'step-call-help',
      kind: ProtocolStepKind.ACTION,
      label: 'Call for help',
      prompt: { [Language.ENGLISH]: 'Call emergency services now.' },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-check-breathing',
          conditions: [],
          description: 'After help is called, check breathing',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-check-breathing',
    },
    {
      id: 'step-check-breathing',
      kind: ProtocolStepKind.QUESTION,
      label: 'Check breathing',
      prompt: { [Language.ENGLISH]: 'Are they breathing normally?' },
      entryConditions: [],
      acceptedAnswers: ['normal', 'abnormal', 'absent'],
      updatesField: 'patient.breathing',
      transitions: [
        {
          toStepId: null,
          conditions: [],
          description: 'Fixture ends after breathing is established',
        },
      ],
      requiresConfirmation: false,
      onUncertain: null,
    },
    {
      id: 'step-exit-responsive',
      kind: ProtocolStepKind.EXIT,
      label: 'Leave unconscious protocol',
      prompt: { [Language.ENGLISH]: 'They are responding. Stay with them and keep checking.' },
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
        {
          id: 'no-oral-if-unresponsive',
          description: 'Do not give anything by mouth if unresponsive',
          field: 'patient.consciousness',
          operator: ConditionOperator.EQUALS,
          value: ConsciousnessState.UNRESPONSIVE,
        },
      ],
      reason: 'An unresponsive person can choke',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-unresponsive',
      conditions: [
        {
          id: 'escalate-when-unresponsive',
          description: 'Unresponsive adult needs professional help',
          field: 'patient.consciousness',
          operator: ConditionOperator.EQUALS,
          value: ConsciousnessState.UNRESPONSIVE,
        },
      ],
      escalateTo: EscalationState.RECOMMENDED,
      instruction: { [Language.ENGLISH]: 'Call emergency services now.' },
      reason: 'Unresponsive person',
    },
  ],
  exitConditions: [
    {
      id: 'exit-responsive',
      description: 'Person is responding',
      field: 'patient.consciousness',
      operator: ConditionOperator.EQUALS,
      value: ConsciousnessState.RESPONSIVE,
    },
  ],
  languages: [Language.ENGLISH],
  published: true,
  createdAt: AT,
  updatedAt: AT,
};
