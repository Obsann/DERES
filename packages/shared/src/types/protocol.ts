import type {
  ConditionOperator,
  EmergencyType,
  EscalationState,
  Language,
  ProtocolStepKind,
} from '../enums/index.js';
import type { Id, IsoDateTime } from './common.js';

/**
 * Where the clinical content came from.
 *
 * Required, not optional: a protocol without an attributable source cannot be
 * merged (git-workflow.md section 33).
 */
export interface ProtocolSource {
  /** Publishing body, for example a recognised first-aid or resuscitation council. */
  organisation: string;
  title: string;
  url: string | null;
  /** Edition or publication year of the guidance. */
  edition: string | null;
  retrievedAt: IsoDateTime;
  notes: string | null;
}

/**
 * A declarative test against {@link EmergencyState}.
 *
 * Conditions are data rather than code so that protocol content can be
 * reviewed by someone who does not read TypeScript.
 */
export interface ProtocolCondition {
  id: Id;
  /** Plain-language statement of what this checks. */
  description: string;
  /** Dot path into `EmergencyState`, for example `patient.breathing`. */
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[] | null;
}

/** Text shown or spoken to the user, per supported language. */
export type LocalisedText = Partial<Record<Language, string>>;

/** One step of a protocol. */
export interface ProtocolStep {
  id: Id;
  kind: ProtocolStepKind;
  /** Internal label for logs and review, not shown to the user. */
  label: string;
  /**
   * What the user is asked, told or asked to observe. The LLM may rephrase
   * this for fluency but may not change its meaning or add to it.
   */
  prompt: LocalisedText;
  /** All conditions must hold before this step may run. */
  entryConditions: ProtocolCondition[];
  /** Answers accepted for a `QUESTION` step; empty for other kinds. */
  acceptedAnswers: string[];
  /** Field of `EmergencyState` this step establishes, if any. */
  updatesField: string | null;
  /** Steps that may follow, evaluated in order; the first match wins. */
  transitions: ProtocolTransition[];
  /** Must the user confirm before moving on? True for most `ACTION` steps. */
  requiresConfirmation: boolean;
  /** What to do if the user cannot answer or is unsure. */
  onUncertain: Id | null;
}

/** A permitted move from one step to another. */
export interface ProtocolTransition {
  /** Target step, or null when this transition exits the protocol. */
  toStepId: Id | null;
  conditions: ProtocolCondition[];
  description: string;
}

/** Something the system must never instruct under the stated conditions. */
export interface Contraindication {
  id: Id;
  /** What must not be done, for example "do not give anything by mouth". */
  prohibitedAction: string;
  conditions: ProtocolCondition[];
  reason: string;
}

/** When to direct the user to professional help. */
export interface EscalationRule {
  id: Id;
  conditions: ProtocolCondition[];
  /** State to move the incident into when the rule fires. */
  escalateTo: EscalationState;
  /** What the user is told, for example to call emergency services now. */
  instruction: LocalisedText;
  reason: string;
}

/**
 * A machine-readable emergency protocol.
 *
 * The protocol engine, not the LLM, decides which guidance is permitted. The
 * model may only phrase what a protocol already allows.
 */
export interface Protocol {
  id: Id;
  name: string;
  /** Semantic version of the protocol content itself. */
  version: string;
  emergencyType: EmergencyType;
  source: ProtocolSource;
  /** When this protocol may be selected for an incident. */
  entryConditions: ProtocolCondition[];
  /** First step to run once selected. */
  initialStepId: Id;
  steps: ProtocolStep[];
  contraindications: Contraindication[];
  escalationRules: EscalationRule[];
  /** When the protocol is finished. */
  exitConditions: ProtocolCondition[];
  /** Languages the content has been authored and reviewed in. */
  languages: Language[];
  /** False while a protocol is drafted or under review. */
  published: boolean;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/** Where one incident currently sits inside its protocol. */
export interface ProtocolState {
  incidentId: Id;
  protocolId: Id;
  protocolVersion: string;
  currentStepId: Id | null;
  completedStepIds: Id[];
  /** Label of the next thing the system intends to establish or instruct. */
  nextPriority: string | null;
  escalationState: EscalationState;
  updatedAt: IsoDateTime;
}
