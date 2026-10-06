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
  inProgress: string;
  stayCalm: string;
  callShort: string;
  liveEmergency: string;
  whatsHappening: string;
  ambulanceCalled: string;
  ambulanceNotCalled: string;
  ambulanceTapToCall: string;
  locationTitle: string;
  locationRetry: string;
  progressTitle: string;
  progressDone: (n: number) => string;
  inProgressNow: string;
  protocolNote: string;
  answerHint: string;
  actionHint: string;
  youAnswered: (answer: string) => string;
  preparingNext: string;
  stayWithThem: string;
  wellGuideYou: string;
  eyebrow: string;
  noAccountNeeded: string;
  startCaption: string;
  beforeBegin: string;
  languageLocked: string;
  continueInLanguage: string;
  responderAccess: string;
  offlineLive: string;
  repeatInstruction: string;
  stayedWithThem: string;
  handoffHint: string;
  viewHandoff: string;
  sessionAside: string;
  live: string;
  voiceReady: string;
  callConfirmed: string;
  notConfirmed: string;
  emsService: string;
  openingLabel: string;
  cannotGuide: string;
  callNowHeadline: string;
  tellOperator: string;
  returnStart: string;
  /** Short names for protocol steps, by step id. The spoken prompt is the protocol's own text. */
  stepNames: Record<string, string>;
}

const ambulance = EMERGENCY_NUMBERS.ambulance;

const en: EmergencyCopy = {
  languageName: 'English',
  headline: 'Stay with them.',
  subhead: 'Clear, spoken first-aid steps while emergency help is on the way.',
  startEmergency: 'Start emergency',
  changeLanguage: 'Change language',
  chooseLanguage: 'Choose your language',
  starting: 'Starting…',
  whatHappened: 'What happened?',
  collapsed: 'Someone collapsed or is not responding',
  somethingElse: 'Something else',
  onlyCollapse: 'This flow supports an unresponsive adult only. Call emergency services now.',
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
  voiceUnavailable: 'Voice is unavailable right now.',
  voiceUnavailableBody: 'Continue with the buttons on screen.',
  sendFailed: 'Could not send. Try again.',
  offline: 'Connection lost',
  offlineBody: 'The buttons still work. Call emergency services if you need an ambulance.',
  newEmergency: 'Start a new emergency',
  arrivedTitle: 'Help has arrived.',
  arrivedBody: 'Responders are here. Give them space and share what you observed.',
  kind: {
    [ProtocolStepKind.QUESTION]: 'Question',
    [ProtocolStepKind.ASSESSMENT]: 'Check',
    [ProtocolStepKind.ACTION]: 'Do this now',
    [ProtocolStepKind.ESCALATION]: 'Get help now',
    [ProtocolStepKind.EXIT]: 'Keep going',
  },
  phase: {
    [VoiceSessionPhase.IDLE]: 'Tap to speak',
    [VoiceSessionPhase.LISTENING]: 'Listening — tap when finished',
    [VoiceSessionPhase.PROCESSING]: 'Understanding…',
    [VoiceSessionPhase.SPEAKING]: 'DERES is speaking — tap to interrupt',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'Say "done" when finished',
    [VoiceSessionPhase.ERROR]: 'Voice unavailable — tap to retry',
  },
  inProgress: 'Guidance active',
  stayCalm: 'Follow one step at a time.',
  callShort: `Call ${ambulance}`,
  liveEmergency: 'Live status',
  whatsHappening: 'Current situation',
  ambulanceCalled: 'Ambulance called',
  ambulanceNotCalled: 'Ambulance call pending',
  ambulanceTapToCall: `Tap to call ${ambulance}`,
  locationTitle: 'Location sharing',
  locationRetry: 'Tap to try location sharing again',
  progressTitle: 'Your progress',
  progressDone: (n) => `${n} completed`,
  inProgressNow: 'Current step',
  protocolNote: 'Instructions follow a fixed first-aid protocol.',
  answerHint: 'Say yes, no, or not sure.',
  actionHint: "Say done, or I can't.",
  youAnswered: (answer) => `You answered “${answer}”`,
  preparingNext: 'Loading the next step…',
  stayWithThem: 'Stay with them.',
  wellGuideYou: "We'll guide you.",
  eyebrow: 'Emergency first aid',
  noAccountNeeded: 'No account needed',
  startCaption: 'For an adult who has collapsed or is not responding',
  beforeBegin: 'Before we begin',
  languageLocked: 'The emergency will stay in this language.',
  continueInLanguage: 'Continue in English',
  responderAccess: 'Responder access',
  offlineLive: 'Offline — guidance still works. Responders cannot see updates yet.',
  repeatInstruction: 'Repeat instruction',
  stayedWithThem: 'You stayed with them.',
  handoffHint: 'Show this phone to the responder. They can see the steps you completed.',
  viewHandoff: 'View handoff summary',
  sessionAside: 'Emergency session',
  live: 'Live',
  voiceReady: 'Ready',
  callConfirmed: 'Call confirmed',
  notConfirmed: 'Not confirmed',
  emsService: `${ambulance} ambulance`,
  openingLabel: 'Opening',
  cannotGuide: 'DERES cannot guide this emergency',
  callNowHeadline: `Call ${ambulance} now.`,
  tellOperator: 'Tell the operator what happened and where you are. Follow their instructions.',
  returnStart: 'Return to start',
  stepNames: {
    'step-check-response': 'Check response',
    'step-call-ems': `Call ${ambulance}`,
    'step-open-airway': 'Open airway',
    'step-check-breathing': 'Check breathing',
    'step-cpr': 'Chest compressions',
    'step-recovery-position': 'Recovery position',
    'step-wait-for-help': 'Stay with them',
    'step-stay-breathing': 'Keep checking breathing',
    'step-stay-responsive': 'Stay with them',
  },
};

const am: EmergencyCopy = {
  languageName: 'አማርኛ',
  headline: 'ከአጠገባቸው ይቆዩ።',
  subhead: 'እርዳታ በመንገድ ላይ እያለ ግልጽ የመጀመሪያ እርዳታ ደረጃዎች በድምጽ ይሰጣሉ።',
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
  offlineBody: 'ቁልፎቹ አሁንም ይሰራሉ። አምቡላንስ ካስፈለገዎት ወደ ድንገተኛ አገልግሎት ይደውሉ።',
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
    [VoiceSessionPhase.LISTENING]: 'እያዳመጥኩ ነው — ሲጨርሱ ይንኩ',
    [VoiceSessionPhase.PROCESSING]: 'በመረዳት ላይ…',
    [VoiceSessionPhase.SPEAKING]: 'ድረስ እየተናገረ ነው — ለማቋረጥ ይንኩ',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'ሲጨርሱ "ጨርሻለሁ" ይበሉ',
    [VoiceSessionPhase.ERROR]: 'ድምጽ አይገኝም — እንደገና ይንኩ',
  },
  inProgress: 'ድንገተኛ አደጋ በሂደት ላይ',
  stayCalm: 'ይረጋጉ። ከእርስዎ ጋር ነኝ።',
  callShort: `${ambulance} ይደውሉ`,
  liveEmergency: 'የቀጥታ ድንገተኛ',
  whatsHappening: 'ምን እየሆነ ነው',
  ambulanceCalled: 'አምቡላንስ ተጠርቷል',
  ambulanceNotCalled: 'አምቡላንስ ገና አልተጠራም',
  ambulanceTapToCall: `${ambulance} ለመደወል ይንኩ`,
  locationTitle: 'አካባቢ ማጋራት',
  locationRetry: 'አካባቢዎን ለማጋራት ይንኩ',
  progressTitle: 'የእርስዎ ሂደት',
  progressDone: (n) => `${n} ተጠናቋል`,
  inProgressNow: 'አሁን በሂደት ላይ',
  protocolNote: 'ድረስ የተገመገመ የመጀመሪያ እርዳታ ፕሮቶኮልን ይከተላል። የሕክምና መመሪያን በፍጹም አይፈጥርም ወይም አይቀይርም።',
  answerHint: 'አዎ፣ አይ፣ ወይም እርግጠኛ አይደለሁም ይበሉ',
  actionHint: 'ጨርሻለሁ ወይም አልችልም ይበሉ',
  youAnswered: (answer) => `“${answer}” ብለው መልሰዋል`,
  preparingNext: 'ቀጣዩን መመሪያ በማዘጋጀት ላይ…',
  stayWithThem: 'ከአጠገባቸው ይቆዩ።',
  wellGuideYou: 'እኛ እንመራዎታለን።',
  eyebrow: 'የድንገተኛ የመጀመሪያ እርዳታ',
  noAccountNeeded: 'መለያ አያስፈልግም',
  startCaption: 'ለወደቀ ወይም ምላሽ ለማይሰጥ አዋቂ',
  beforeBegin: 'ከመጀመራችን በፊት',
  languageLocked: 'ድንገተኛው በዚህ ቋንቋ ይቀጥላል።',
  continueInLanguage: 'በአማርኛ ይቀጥሉ',
  responderAccess: 'የአዳኝ መግቢያ',
  offlineLive: 'ከመስመር ውጭ — መመሪያው ይቀጥላል። አዳኞች ገና አይመለከቱም።',
  repeatInstruction: 'መመሪያውን ድገም',
  stayedWithThem: 'ከአጠገባቸው ቆይተዋል።',
  handoffHint: 'ይህን ስልክ ለአዳኙ ያሳዩ። የጨረሷቸውን ደረጃዎች ማየት ይችላሉ።',
  viewHandoff: 'ማጠቃለያ ይመልከቱ',
  sessionAside: 'የድንገተኛ ክፍለ ጊዜ',
  live: 'ቀጥታ',
  voiceReady: 'ዝግጁ',
  callConfirmed: 'ጥሪ ተረጋግጧል',
  notConfirmed: 'አልተረጋገጠም',
  emsService: `${ambulance} አምቡላንስ`,
  openingLabel: 'መጀመሪያ',
  cannotGuide: 'ድረስ ይህን ድንገተኛ መምራት አይችልም',
  callNowHeadline: `አሁኑኑ ${ambulance} ይደውሉ።`,
  tellOperator: 'ምን እንደሆነ እና የት እንዳሉ ለኦፕሬተሩ ይንገሩ። መመሪያቸውን ይከተሉ።',
  returnStart: 'ወደ መጀመሪያ ተመለስ',
  stepNames: {
    'step-check-response': 'ምላሽ ማረጋገጥ',
    'step-call-ems': `${ambulance} መደወል`,
    'step-open-airway': 'የአየር መንገድ መክፈት',
    'step-check-breathing': 'አተነፋፈስ ማረጋገጥ',
    'step-cpr': 'የደረት ግፊት',
    'step-recovery-position': 'የማገገሚያ አቀማመጥ',
    'step-wait-for-help': 'ከአጠገባቸው መቆየት',
    'step-stay-breathing': 'አተነፋፈስን መከታተል',
    'step-stay-responsive': 'ከአጠገባቸው መቆየት',
  },
};

const om: EmergencyCopy = {
  languageName: 'Afaan Oromoo',
  headline: 'Isaan bira turi.',
  subhead: "Gargaarsi karaa irratti jiru yeroo, tarkaanfiiwwan gargaarsa jalqabaa ifa ta'an sagaleedhaan siin kenna.",
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
  offlineBody: "Tuqaawwan ammas hojjetu. Ambulaansii yoo barbachise, tajaajila balaa tasaatiif bilbili.",
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
    [VoiceSessionPhase.LISTENING]: 'Dhaggeeffachaa jira — yeroo xumurtu tuqi',
    [VoiceSessionPhase.PROCESSING]: 'Hubachaa jira…',
    [VoiceSessionPhase.SPEAKING]: 'DERES dubbachaa jira — addaan kutuuuf tuqi',
    [VoiceSessionPhase.AWAITING_CONFIRMATION]: 'Yeroo xumurtu "xumureera" jedhi',
    [VoiceSessionPhase.ERROR]: 'Sagaleen hin argamu — irra deebi\'ii tuqi',
  },
  inProgress: 'Balaan tasaa adeemsa irra jira',
  stayCalm: 'Tasgabbaa\'i. Si wajjin jira.',
  callShort: `${ambulance} bilbili`,
  liveEmergency: 'Balaa tasaa kallattii',
  whatsHappening: "Maaltu ta'aa jira",
  ambulanceCalled: 'Ambulaansiin waamameera',
  ambulanceNotCalled: 'Ambulaansiin ammallee hin waamamne',
  ambulanceTapToCall: `${ambulance} bilbiluuf tuqi`,
  locationTitle: 'Bakka qooduu',
  locationRetry: 'Bakka kee qooduuf tuqi',
  progressTitle: 'Adeemsa kee',
  progressDone: (n) => `${n} xumurame`,
  inProgressNow: 'Amma adeemsa irra jira',
  protocolNote: "DERES pirotokoolii gargaarsa jalqabaa ilaalame hordofa. Qajeelfama yaalaa gonkumaa hin uumu ykn hin jijjiiru.",
  answerHint: 'Eeyyee, lakki, ykn hin beeku jedhi',
  actionHint: "Xumureera ykn hin danda'u jedhi",
  youAnswered: (answer) => `“${answer}” jettee deebifte`,
  preparingNext: 'Qajeelfama itti aanu qopheessaa jira…',
  stayWithThem: 'Isaan bira turi.',
  wellGuideYou: 'Si qajeelchanna.',
  eyebrow: 'Gargaarsa jalqabaa balaa tasaa',
  noAccountNeeded: 'Akkaawuntii hin barbaachisu',
  startCaption: 'Nama guddaa kufee ykn deebii hin kennineef',
  beforeBegin: 'Osoo hin jalqabin',
  languageLocked: 'Balaan tasaa afaan kana keessatti itti fufa.',
  continueInLanguage: 'Afaan Oromootiin itti fufi',
  responderAccess: 'Seensa gargaaraa',
  offlineLive: 'Sarara ala — qajeelfamni hojjeta. Gargaartonni ammallee hin argatan.',
  repeatInstruction: "Qajeelfama irra deebi'i",
  stayedWithThem: 'Isaan bira turte.',
  handoffHint: 'Bilbila kana gargaaraatti agarsiisi. Tarkaanfiiwwan xumurte arguu danda\'u.',
  viewHandoff: 'Cuunfaa harkaa fuudhu ilaali',
  sessionAside: 'Walgahii balaa tasaa',
  live: 'Kallattii',
  voiceReady: 'Qophaa\'eera',
  callConfirmed: 'Bilbilli mirkanaa\'eera',
  notConfirmed: 'Hin mirkanaa\'ne',
  emsService: `Ambulaansii ${ambulance}`,
  openingLabel: 'Jalqaba',
  cannotGuide: 'DERES balaa tasaa kana qajeelchuu hin danda\'u',
  callNowHeadline: `Amma ${ambulance} bilbili.`,
  tellOperator: 'Maaltu ta\'e fi eessa akka jirtu operaatarichatti himi. Qajeelfama isaanii hordofi.',
  returnStart: 'Gara jalqabaatti deebi\'i',
  stepNames: {
    'step-check-response': 'Deebii mirkaneessi',
    'step-call-ems': `${ambulance} bilbili`,
    'step-open-airway': 'Karaa hargansuu bani',
    'step-check-breathing': 'Hargansuu mirkaneessi',
    'step-cpr': 'Dhiibbaa laphee',
    'step-recovery-position': 'Haala fayyuu',
    'step-wait-for-help': 'Isaan bira turi',
    'step-stay-breathing': 'Hargansuu hordofi',
    'step-stay-responsive': 'Isaan bira turi',
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
