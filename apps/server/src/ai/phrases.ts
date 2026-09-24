/**
 * Spoken lines that do not come from the model.
 *
 * Used when there is no published protocol, the request is unsupported, or
 * the model output is unusable. Short and action-oriented on purpose.
 */
export const SAFE_PHRASES = {
  cannotInvent: 'I cannot tell you to do that.',
  unsupportedEmergency:
    'I can only guide you for an unresponsive adult. Call emergency services now for any other emergency.',
  stayWithThem: 'Stay with them and call emergency services if you have not already.',
  sayAgain: 'I need you to say that again. Call emergency services if someone is unresponsive.',
} as const;
