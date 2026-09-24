import { Certainty, ProtocolStepKind, type Incident, type Protocol } from '@voicesos/shared';
import { AiValidationError } from '../common/errors.js';
import { currentStep } from '../protocols/engine.js';
import type { LlmExtraction } from './schema.js';
import { LlmIntent } from './schema.js';
import { validateExtraction } from './validate.js';

export type PipelineStage = 'schema' | 'state' | 'protocol' | 'safety';

export interface PipelineContext {
  incident: Incident;
  protocol: Protocol | null;
}

const INVENTED_GUIDANCE =
  /\b(aspirin|nitro|injection|incision|surgery|diagnose|diagnosis|prescribe|intubate|defibrillat|you should|give (him|her|them)|pour|force (him|her|them) to drink)\b/i;

const UNCERTAIN_ANSWERS = /^(unknown|unsure|i don't know|not sure)$/i;

function fail(stage: PipelineStage, message: string, detail?: Record<string, unknown>): never {
  throw new AiValidationError(message, { stage, ...detail });
}

function validateAgainstState(extraction: LlmExtraction): void {
  if (extraction.certainty === Certainty.KNOWN) {
    if (extraction.consciousness === 'unknown' || extraction.breathing === 'unknown' || extraction.ageGroup === 'unknown') {
      fail('state', 'Model claimed a known fact while marking the value unknown');
    }
  }
}

function validateAgainstProtocol(extraction: LlmExtraction, context: PipelineContext): void {
  const step = context.protocol ? currentStep(context.protocol, context.incident.state) : null;
  if (!step) return;

  const uncertain =
    extraction.certainty !== Certainty.KNOWN ||
    (extraction.questionAnswer !== null && UNCERTAIN_ANSWERS.test(extraction.questionAnswer));

  if (
    (step.kind === ProtocolStepKind.QUESTION || step.kind === ProtocolStepKind.ASSESSMENT) &&
    extraction.questionAnswer &&
    step.acceptedAnswers.length > 0 &&
    !step.acceptedAnswers.includes(extraction.questionAnswer) &&
    !uncertain
  ) {
    fail('protocol', 'Model answer is not accepted for the current protocol step', {
      stepId: step.id,
      questionAnswer: extraction.questionAnswer,
    });
  }

  if (
    (step.kind === ProtocolStepKind.ACTION || step.kind === ProtocolStepKind.ESCALATION) &&
    extraction.questionAnswer &&
    extraction.intent === LlmIntent.ANSWER
  ) {
    fail('protocol', 'Model tried to answer while the protocol is waiting for an action confirmation', {
      stepId: step.id,
    });
  }
}

function applySafetyRules(extraction: LlmExtraction): void {
  if (extraction.questionAnswer && UNCERTAIN_ANSWERS.test(extraction.questionAnswer) && extraction.certainty === Certainty.KNOWN) {
    fail('safety', 'Uncertainty must not be collapsed into a known answer');
  }

  const scanned = [
    extraction.questionAnswer,
    extraction.unsupportedRequest,
    extraction.locationDescription,
    ...extraction.symptoms,
    ...extraction.observations,
  ];

  for (const text of scanned) {
    if (text && INVENTED_GUIDANCE.test(text)) {
      fail('safety', 'Model output contains invented medical guidance', { text });
    }
  }
}

/**
 * Validation chain from Task 8:
 *
 * `LLM output → schema → state → protocol → safety rules`
 *
 * A failure at any stage rejects the whole turn. Nothing is applied.
 */
export function runSafetyPipeline(raw: string, context: PipelineContext): LlmExtraction {
  const extraction = validateExtraction(raw);
  validateAgainstState(extraction);
  validateAgainstProtocol(extraction, context);
  applySafetyRules(extraction);
  return extraction;
}
