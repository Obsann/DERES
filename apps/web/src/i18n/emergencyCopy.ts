import { Language, ProtocolStepKind, VoiceSessionPhase } from '@voicesos/shared';
import { EMERGENCY_NUMBERS } from '@/config/emergency';

/**
 * Interface text for the bystander screens. Medical instructions are NOT here:
 * they come from the protocol, verbatim. Amharic and Afaan Oromoo lines are
 * drafts pending native-speaker review (docs/ux/translation-review.md).
 */
export interface EmergencyCopy {
  languageName: string;
  headline: string;
  subhead: string;
  startEmergency: string;
  changeLanguage: string;
  chooseLanguage: string;
  starting: string;
  whatHappened: string;
  collapsed: string;
  somethingElse: string;
  onlyCollapse: string;
  yes: string;
  no: string;
  notSure: string;
  done: string;
  cantDo: string;
  repeat: string;
  callEmergency: string;
  helpArrived: string;
  step: (n: number) => string;
  locationRequesting: string;
  locationShared: string;
  locationNotShared: string;
  voiceUnavailable: string;
  voiceUnavailableBody: string;
  sendFailed: string;
  offline: string;
  offlineBody: string;
  newEmergency: string;
  arrivedTitle: string;
  arrivedBody: string;
  kind: Record<ProtocolStepKind, string>;
  phase: Record<VoiceSessionPhase, string>;
}

const ambulance = EMERGENCY_NUMBERS.ambulance;

const en: EmergencyCopy = {
  languageName: 'English',
  headline: 'Someone needs help?',
  subhead: "I'll guide you step by step, by voice or with these buttons.",
  startEmergency: 'Start emergency',
  changeLanguage: 'Change language',
  chooseLanguage: 'Choose your language',
  starting: 'Starting…',
  whatHappened: 'What happened?',
  collapsed: 'Someone collapsed or is not responding',
  somethingElse: 'Something else',
  onlyCollapse: 'I can only guide you for someone who has collapsed. Call emergency services now.',
  yes: 'Yes',
  no: 'No',
  notSure: 'Not sure',
  done: 'Done',
  cantDo: "I can't",
  repeat: 'Repeat',
  callEmergency: `Call ambulance ${ambulance}`,
  helpArrived: 'Help has arrived',
  step: (n) => `Step ${n}`,
  locationRequesting: 'Asking for your location…',
  locationShared: 'Location shared with responders',
  locationNotShared: 'Location not shared. Tell the operator where you are.',
  voiceUnavailable: 'Voice help is unavailable.',
  voiceUnavailableBody: 'Follow the steps on screen.',
  sendFailed: "That didn't send. Try again.",
  offline: 'Connection lost.',
  offlineBody: 'Keep following the last instruction.',
  newEmergency: 'Start a new emergency',
  arrivedTitle: 'Help has arrived.',
  arrivedBody: 'Let the responders take over. Thank you for helping.',
  kind: {
    [ProtocolStepKind.QUESTION]: 'Question',
    [ProtocolStepKind.ASSESSMENT]: 'Check',
    [ProtocolStepKind.ACTION]: 'Do this now',
    [ProtocolStepKind.ESCALATION]: 'Get help now',
    [ProtocolStepKind.EXIT]: 'Keep going',
  },
  phase: {
    [VoiceSessionPhase.IDLE]: 'Tap to speak',
    [VoiceSessionPhase.LISTENING]: 'Listening — speak now',
    [VoiceSessionPhase.PROCESSING]: 'Thinking…',
    [VoiceSessionPhase.SPEAKING]: 'Speaking',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'Say "done" when finished',
    [VoiceSessionPhase.ERROR]: 'Voice unavailable',
  },
};

const am: EmergencyCopy = {
  languageName: 'አማርኛ',
  headline: 'አንድ ሰው እርዳታ ይፈልጋል?',
  subhead: 'በድምጽ ወይም በእነዚህ ቁልፎች ደረጃ በደረጃ እመራዎታለሁ።',
  startEmergency: 'ድንገተኛ ጀምር',
  changeLanguage: 'ቋንቋ ቀይር',
  chooseLanguage: 'ቋንቋዎን ይምረጡ',
  starting: 'በመጀመር ላይ…',
  whatHappened: 'ምን ሆነ?',
  collapsed: 'አንድ ሰው ወድቋል ወይም ምላሽ አይሰጥም',
  somethingElse: 'ሌላ ነገር',
  onlyCollapse: 'መምራት የምችለው ለወደቀ ሰው ብቻ ነው። አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ።',
  yes: 'አዎ',
  no: 'አይ',
  notSure: 'እርግጠኛ አይደለሁም',
  done: 'ጨርሻለሁ',
  cantDo: 'አልችልም',
  repeat: 'እንደገና',
  callEmergency: `አምቡላንስ ይደውሉ ${ambulance}`,
  helpArrived: 'እርዳታ ደርሷል',
  step: (n) => `ደረጃ ${n}`,
  locationRequesting: 'አካባቢዎን በመጠየቅ ላይ…',
  locationShared: 'አካባቢዎ ለአዳኞች ተልኳል',
  locationNotShared: 'አካባቢዎ አልተላከም። ያሉበትን ቦታ ለኦፕሬተሩ ይንገሩ።',
  voiceUnavailable: 'የድምጽ እርዳታ አይገኝም።',
  voiceUnavailableBody: 'በስክሪኑ ላይ ያሉትን ደረጃዎች ይከተሉ።',
  sendFailed: 'አልተላከም። እንደገና ይሞክሩ።',
  offline: 'ግንኙነት ተቋርጧል።',
  offlineBody: 'የመጨረሻውን መመሪያ መከተልዎን ይቀጥሉ።',
  newEmergency: 'አዲስ ድንገተኛ ጀምር',
  arrivedTitle: 'እርዳታ ደርሷል።',
  arrivedBody: 'አዳኞቹ እንዲረከቡ ይፍቀዱ። ስለረዱ እናመሰግናለን።',
  kind: {
    [ProtocolStepKind.QUESTION]: 'ጥያቄ',
    [ProtocolStepKind.ASSESSMENT]: 'ያረጋግጡ',
    [ProtocolStepKind.ACTION]: 'አሁን ይህን ያድርጉ',
    [ProtocolStepKind.ESCALATION]: 'አሁን እርዳታ ይጥሩ',
    [ProtocolStepKind.EXIT]: 'ይቀጥሉ',
  },
  phase: {
    [VoiceSessionPhase.IDLE]: 'ለመናገር ይንኩ',
    [VoiceSessionPhase.LISTENING]: 'እያዳመጥኩ ነው — ይናገሩ',
    [VoiceSessionPhase.PROCESSING]: 'በማሰብ ላይ…',
    [VoiceSessionPhase.SPEAKING]: 'እየተናገርኩ ነው',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'ሲጨርሱ "ጨርሻለሁ" ይበሉ',
    [VoiceSessionPhase.ERROR]: 'ድምጽ አይገኝም',
  },
};

const om: EmergencyCopy = {
  languageName: 'Afaan Oromoo',
  headline: 'Namni gargaarsa barbaadaa jiraa?',
  subhead: "Sagaleen ykn qabduuwwan kanaan tarkaanfii tarkaanfiin si qajeelcha.",
  startEmergency: 'Balaa jalqabi',
  changeLanguage: 'Afaan jijjiiri',
  chooseLanguage: 'Afaan kee filadhu',
  starting: 'Jalqabaa jira…',
  whatHappened: 'Maaltu ta\'e?',
  collapsed: 'Namni kufe ykn deebii hin kennu',
  somethingElse: 'Waan biraa',
  onlyCollapse: "Kan ani qajeelchuu danda'u nama kufe qofa. Amma tajaajila balaa bilbili.",
  yes: 'Eeyyee',
  no: 'Lakki',
  notSure: 'Hin beeku',
  done: 'Xumureera',
  cantDo: "Hin danda'u",
  repeat: "Irra deebi'i",
  callEmergency: `Ambulaansii bilbili ${ambulance}`,
  helpArrived: "Gargaarsi ga'eera",
  step: (n) => `Tarkaanfii ${n}`,
  locationRequesting: 'Bakka kee gaafachaa jira…',
  locationShared: 'Bakki kee gargaartotaaf ergameera',
  locationNotShared: 'Bakki kee hin ergamne. Bakka jirtu operaatarichatti himi.',
  voiceUnavailable: 'Gargaarsi sagalee hin argamu.',
  voiceUnavailableBody: 'Tarkaanfiiwwan iskiriinii irra jiran hordofi.',
  sendFailed: "Hin ergamne. Irra deebi'ii yaali.",
  offline: 'Walqunnamtiin cite.',
  offlineBody: 'Qajeelfama dhumaa hordofuu itti fufi.',
  newEmergency: 'Balaa haaraa jalqabi',
  arrivedTitle: "Gargaarsi ga'eera.",
  arrivedBody: 'Gargaartonni akka fudhatan heyyami. Gargaaruu keetiif galatoomi.',
  kind: {
    [ProtocolStepKind.QUESTION]: 'Gaaffii',
    [ProtocolStepKind.ASSESSMENT]: 'Mirkaneessi',
    [ProtocolStepKind.ACTION]: 'Amma kana godhi',
    [ProtocolStepKind.ESCALATION]: 'Amma gargaarsa waami',
    [ProtocolStepKind.EXIT]: 'Itti fufi',
  },
  phase: {
    [VoiceSessionPhase.IDLE]: 'Dubbachuuf tuqi',
    [VoiceSessionPhase.LISTENING]: 'Dhaggeeffachaa jira — dubbadhu',
    [VoiceSessionPhase.PROCESSING]: 'Yaadaa jira…',
    [VoiceSessionPhase.SPEAKING]: 'Dubbachaa jira',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'Yeroo xumurtu "xumureera" jedhi',
    [VoiceSessionPhase.ERROR]: 'Sagaleen hin argamu',
  },
};

const COPY: Record<Language, EmergencyCopy> = {
  [Language.ENGLISH]: en,
  [Language.AMHARIC]: am,
  [Language.AFAAN_OROMO]: om,
};

export function emergencyCopy(language: Language): EmergencyCopy {
  return COPY[language] ?? en;
}

/** BCP 47 tag for the `lang` attribute so screen readers and fonts switch script. */
export function langAttr(language: Language): string {
  return language;
}
