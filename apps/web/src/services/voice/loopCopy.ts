import { Language } from '@voicesos/shared';

/** Lines the app speaks around a turn. Not medical instructions. */
export interface VoiceLoopCopy {
  greeting: string;
  permission: string;
  hearingYou: string;
  micDenied: string;
  thinking: string;
}

const en: VoiceLoopCopy = {
  greeting: "I'm DERES. I'll guide you one step at a time.",
  permission: 'I need the microphone so I can hear what happened.',
  hearingYou: 'I can hear you. Tell me what you see.',
  micDenied: "I can't hear you. Allow the microphone, or use the buttons on the screen.",
  thinking: "I'm thinking.",
};

const am: VoiceLoopCopy = {
  greeting: 'እኔ ድረስ ነኝ። አንድ ደረጃ በአንድ እመራዎታለሁ።',
  permission: 'ምን እንደተከሰተ ልሰማ ማይክሮፎኑ ያስፈልገኛል።',
  hearingYou: 'ሰምቻለሁ። የሚያዩትን ይንገሩኝ።',
  micDenied: 'መስማት አልችልም። ማይክሮፎኑን ይፍቀዱ፣ ወይም በስክሪኑ ላይ ያሉትን ቁልፎች ይጠቀሙ።',
  thinking: 'እያሰብኩ ነው።',
};

const om: VoiceLoopCopy = {
  greeting: 'Ani DERES dha. Tarkaanfii tokko tokkoon si qajeelcha.',
  permission: "Waan ta'e dhaga'uuf maaykiraafoonii na barbaachisa.",
  hearingYou: "Si dhaga'eera. Waan argitu natti himi.",
  micDenied: "Si dhaga'uu hin danda'u. Maaykiraafoonii hayyami, ykn tuqaatii iskiriinii irra jiru fayyadami.",
  thinking: 'Yaadaa jira.',
};

const BY_LANGUAGE: Record<Language, VoiceLoopCopy> = {
  [Language.ENGLISH]: en,
  [Language.AMHARIC]: am,
  [Language.AFAAN_OROMO]: om,
};

export function voiceLoopCopy(language: Language): VoiceLoopCopy {
  return BY_LANGUAGE[language] ?? en;
}
