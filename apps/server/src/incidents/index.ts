export type { IncidentCommand } from './commands.js';
export { applyIncidentCommand } from './apply.js';
export { knownFacts, unknownFacts, hasUncertainty } from './facts.js';
export { applyCommand } from './stateEngine.js';
export type { EngineEvent, TransitionResult } from './stateEngine.js';
