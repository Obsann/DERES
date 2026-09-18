/**
 * Canonical VoiceSOS enumerations.
 *
 * Declared as frozen const objects rather than TypeScript `enum` so the values
 * survive JSON transport unchanged and can be used identically by the server,
 * the web client and the database layer.
 */

/**
 * Emergency scenarios. These are the candidates listed in the engineering
 * specification section 10; the MVP supports only the subset that has been
 * converted into an approved protocol (Task 6). `UNKNOWN` is not a fallback
 * for "we guessed wrong" - it means the system has not established a
 * supported emergency type and must not improvise guidance.
 */
export const EmergencyType = {
  UNCONSCIOUS: 'unconscious',
  SEVERE_BLEEDING: 'severe_bleeding',
  CHOKING: 'choking',
  BURN: 'burn',
  SUSPECTED_STROKE: 'suspected_stroke',
  SEIZURE: 'seizure',
  SEVERE_ALLERGIC_REACTION: 'severe_allergic_reaction',
  UNKNOWN: 'unknown',
} as const;
export type EmergencyType = (typeof EmergencyType)[keyof typeof EmergencyType];

/** Lifecycle of an incident record. */
export const IncidentStatus = {
  /** Live emergency, the bystander is being guided. */
  ACTIVE: 'active',
  /** Escalation triggered, professional help advised or contacted. */
  ESCALATED: 'escalated',
  /** A handoff has been generated and delivered to a responder. */
  HANDED_OFF: 'handed_off',
  /** Ended normally. */
  CLOSED: 'closed',
  /** Session was interrupted and never resumed. */
  ABANDONED: 'abandoned',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

/**
 * Languages under investigation for the MVP. Actual availability depends on
 * confirmed Voxide support (task.md Phase 13).
 */
export const Language = {
  ENGLISH: 'en',
  AMHARIC: 'am',
  AFAAN_OROMO: 'om',
} as const;
export type Language = (typeof Language)[keyof typeof Language];

/** Authentication roles (specification section 19). */
export const UserRole = {
  USER: 'USER',
  RESPONDER: 'RESPONDER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * How confident the system is about a single recorded fact.
 *
 * Uncertainty is a first-class value, never silently collapsed into a
 * confident answer. Contradictory information moves a fact to `UNCERTAIN`
 * rather than overwriting the earlier assumption.
 */
export const Certainty = {
  KNOWN: 'known',
  UNCERTAIN: 'uncertain',
  UNKNOWN: 'unknown',
} as const;
export type Certainty = (typeof Certainty)[keyof typeof Certainty];

/** Patient responsiveness. */
export const ConsciousnessState = {
  RESPONSIVE: 'responsive',
  UNRESPONSIVE: 'unresponsive',
  UNKNOWN: 'unknown',
} as const;
export type ConsciousnessState =
  (typeof ConsciousnessState)[keyof typeof ConsciousnessState];

/** Patient breathing. */
export const BreathingState = {
  NORMAL: 'normal',
  ABNORMAL: 'abnormal',
  ABSENT: 'absent',
  UNKNOWN: 'unknown',
} as const;
export type BreathingState = (typeof BreathingState)[keyof typeof BreathingState];

/** Coarse age band - protocols differ for infants and children. */
export const AgeGroup = {
  INFANT: 'infant',
  CHILD: 'child',
  ADULT: 'adult',
  UNKNOWN: 'unknown',
} as const;
export type AgeGroup = (typeof AgeGroup)[keyof typeof AgeGroup];

/** Whether professional help has been recommended or involved. */
export const EscalationState = {
  NONE: 'none',
  RECOMMENDED: 'recommended',
  ESCALATED: 'escalated',
} as const;
export type EscalationState = (typeof EscalationState)[keyof typeof EscalationState];

/** Who or what produced a message, event or state change. */
export const EventSource = {
  USER: 'user',
  AI: 'ai',
  PROTOCOL: 'protocol',
  RESPONDER: 'responder',
  SYSTEM: 'system',
} as const;
export type EventSource = (typeof EventSource)[keyof typeof EventSource];

/** Speaker of a conversation message. */
export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

/** Entries on the incident timeline. */
export const IncidentEventType = {
  INCIDENT_CREATED: 'incident_created',
  MESSAGE_ADDED: 'message_added',
  PROTOCOL_SELECTED: 'protocol_selected',
  QUESTION_ASKED: 'question_asked',
  ANSWER_RECORDED: 'answer_recorded',
  STATE_CHANGED: 'state_changed',
  ACTION_GIVEN: 'action_given',
  ACTION_CONFIRMED: 'action_confirmed',
  PROTOCOL_STEP_CHANGED: 'protocol_step_changed',
  UNCERTAINTY_RECORDED: 'uncertainty_recorded',
  ESCALATION_TRIGGERED: 'escalation_triggered',
  SAFETY_BLOCK: 'safety_block',
  HANDOFF_GENERATED: 'handoff_generated',
  INCIDENT_CLOSED: 'incident_closed',
} as const;
export type IncidentEventType =
  (typeof IncidentEventType)[keyof typeof IncidentEventType];

/** Progress of a single protocol-approved instruction. */
export const ActionStatus = {
  /** Instruction delivered to the user, no confirmation yet. */
  GIVEN: 'given',
  /** User confirmed they performed it. */
  CONFIRMED: 'confirmed',
  /** User reported they could not perform it. */
  UNABLE: 'unable',
  /** Deliberately skipped, for example the step became irrelevant. */
  SKIPPED: 'skipped',
} as const;
export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

/** Kind of protocol step. */
export const ProtocolStepKind = {
  /** Ask the user one critical question. */
  QUESTION: 'question',
  /** Instruct the user to do one thing. */
  ACTION: 'action',
  /** Ask the user to observe and report something. */
  ASSESSMENT: 'assessment',
  /** Direct the user to professional help. */
  ESCALATION: 'escalation',
  /** Terminal step for this protocol. */
  EXIT: 'exit',
} as const;
export type ProtocolStepKind =
  (typeof ProtocolStepKind)[keyof typeof ProtocolStepKind];

/** Comparison used by protocol entry, transition and exit conditions. */
export const ConditionOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  IN: 'in',
  IS_KNOWN: 'is_known',
  IS_UNKNOWN: 'is_unknown',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
} as const;
export type ConditionOperator =
  (typeof ConditionOperator)[keyof typeof ConditionOperator];

/** Severity attached to a handoff warning. */
export const WarningSeverity = {
  INFO: 'info',
  IMPORTANT: 'important',
  CRITICAL: 'critical',
} as const;
export type WarningSeverity = (typeof WarningSeverity)[keyof typeof WarningSeverity];
