import { Language } from '@voicesos/shared';

export interface SafePhraseSet {
  cannotInvent: string;
  unsupportedEmergency: string;
  stayWithThem: string;
  sayAgain: string;
  noConnection: string;
}

/**
 * Spoken lines that do not come from the model.
 *
 * Used when there is no published protocol, the request is unsupported, or
 * the model output is unusable. Short and action-oriented on purpose.
 * Amharic and Afaan Oromoo are pending native-speaker review
 * (docs/ux/translation-review.md).
 */
export const SAFE_PHRASES_BY_LANGUAGE: Record<Language, SafePhraseSet> = {
  [Language.ENGLISH]: {
    cannotInvent: 'I cannot tell you to do that.',
    unsupportedEmergency:
      'I can only guide you for an unresponsive adult. Call emergency services now for any other emergency.',
    stayWithThem: 'Stay with them and call emergency services if you have not already.',
    sayAgain: 'I need you to say that again. Call emergency services if someone is unresponsive.',
    noConnection: 'I have no connection. Use the buttons, or try speaking again in a moment.',
  },
  [Language.AMHARIC]: {
    cannotInvent: 'ያንን እንዲያደርጉ ልነግርዎ አልችልም።',
    unsupportedEmergency:
      'መምራት የምችለው ምላሽ ለማይሰጥ አዋቂ ሰው ብቻ ነው። ለሌላ ማንኛውም ድንገተኛ አደጋ አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ።',
    stayWithThem: 'ከአጠገባቸው ይቆዩ፤ እስካሁን ካልደወሉ ወደ ድንገተኛ አገልግሎት ይደውሉ።',
    sayAgain: 'እባክዎ እንደገና ይናገሩ። አንድ ሰው ምላሽ የማይሰጥ ከሆነ ወደ ድንገተኛ አገልግሎት ይደውሉ።',
    noConnection: 'ግንኙነት የለኝም። ቁልፎቹን ይጠቀሙ፣ ወይም ትንሽ ቆይተው እንደገና ይናገሩ።',
  },
  [Language.AFAAN_OROMO]: {
    cannotInvent: "Waan sana akka gootu sitti himuu hin danda'u.",
    unsupportedEmergency:
      "Ani kan si qajeelchuu danda'u ga'eessa deebii hin kennineef qofa. Balaa tasaa kan biraatiif amma tajaajila balaa tasaatiif bilbili.",
    stayWithThem: 'Isaan bira turi; yoo hanga ammaatti hin bilbilin, tajaajila balaa tasaatiif bilbili.',
    sayAgain: "Maaloo irra deebi'ii dubbadhu. Namni deebii hin kennu yoo ta'e, tajaajila balaa tasaatiif bilbili.",
    noConnection: "Quunnamtiin hin jiru. Tuqaawwan fayyadami, ykn booda irra deebi'ii dubbadhu.",
  },
};

export const SAFE_PHRASES = SAFE_PHRASES_BY_LANGUAGE[Language.ENGLISH];

export function safePhrases(language: Language): SafePhraseSet {
  return SAFE_PHRASES_BY_LANGUAGE[language] ?? SAFE_PHRASES;
}
