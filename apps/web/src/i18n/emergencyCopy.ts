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
  sceneCrash: string;
  sceneStroke: string;
  sceneChoking: string;
  sceneBleeding: string;
  sceneBurns: string;
  somethingElse: string;
  sceneHint: string;
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
  tellOperatorCrash: string;
  tellOperatorStroke: string;
  returnStart: string;
  notFoundEyebrow: string;
  notFoundTitle: string;
  /** Short names for protocol steps, by step id. The spoken prompt is the protocol's own text. */
  stepNames: Record<string, string>;
}

const ambulance = EMERGENCY_NUMBERS.ambulance;

const en: EmergencyCopy = {
  languageName: 'English',
  headline: 'Stay with them.',
  subhead: 'Spoken, protocol-locked first-aid guidance while emergency services are en route.',
  startEmergency: 'Start emergency',
  changeLanguage: 'Change language',
  chooseLanguage: 'Choose your language',
  starting: 'Starting…',
  whatHappened: 'What happened?',
  collapsed: 'Someone collapsed or is not responding',
  sceneCrash: 'Crash or injury',
  sceneStroke: 'Possible stroke',
  sceneChoking: 'Choking',
  sceneBleeding: 'Severe bleeding',
  sceneBurns: 'Burn',
  somethingElse: 'Something else',
  sceneHint: 'Name what you see. Collapse, a crash, a stroke, choking, bleeding, and burns each have a different first-minute path.',
  onlyCollapse: 'Call emergency services now. Follow the operator if this scene has no published protocol.',
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
  voiceUnavailableBody: 'Buttons still run the protocol. Use them if you cannot speak clearly.',
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
  protocolNote: 'Instructions follow a fixed first-aid protocol. DERES does not invent medical advice.',
  answerHint: 'Tap or say yes, no, or not sure.',
  actionHint: "Tap or say done, or I can't.",
  youAnswered: (answer) => `You answered “${answer}”`,
  preparingNext: 'Loading the next step…',
  stayWithThem: 'Stay with them.',
  wellGuideYou: "We'll guide you.",
  eyebrow: 'Emergency first aid',
  noAccountNeeded: 'No account needed',
  startCaption: 'Name the scene first. Collapse, a crash, a stroke, choking, bleeding, and burns are not the same procedure.',
  beforeBegin: 'Before we begin',
  languageLocked: 'The emergency will stay in this language.',
  continueInLanguage: 'Continue in English',
  responderAccess: 'Responder access',
  offlineLive: 'Offline — guidance still works. Responders cannot see updates yet.',
  repeatInstruction: 'Repeat instruction',
  stayedWithThem: 'You stayed with them.',
  handoffHint: 'Show this phone. Responders see known facts, unknowns, and steps already done.',
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
  tellOperatorCrash: 'Tell 907 this is a crash or injury. Stay with them. Follow the operator.',
  tellOperatorStroke: 'Tell 907 this may be a stroke. Stay with them. Follow the operator.',
  returnStart: 'Return to start',
  notFoundEyebrow: 'Page not found',
  notFoundTitle: 'This screen is not part of DERES.',
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
    'step-stroke-call-ems': `Call ${ambulance}`,
    'step-fast-face': 'Face',
    'step-fast-arms': 'Arms',
    'step-fast-speech': 'Speech',
    'step-stroke-stay': 'Stay with them',
    'step-choke-call-ems': `Call ${ambulance}`,
    'step-back-blows': 'Five back blows',
    'step-abdominal-thrusts': 'Five abdominal thrusts',
    'step-choke-repeat': 'Repeat until it comes out',
    'step-choke-stay': 'Stay with them',
    'step-bleed-call-ems': `Call ${ambulance}`,
    'step-direct-pressure': 'Direct pressure',
    'step-pack-wound': 'Pack the wound',
    'step-tourniquet': 'Tourniquet',
    'step-bleed-stay': 'Stay with them',
    'step-burn-call-ems': `Call ${ambulance}`,
    'step-cool-burn': 'Cool with water',
    'step-burn-stay': 'Stay with them',
    'step-trauma-call-ems': `Call ${ambulance}`,
    'step-dont-move': 'Do not move them',
    'step-dont-remove': 'Do not pull objects out',
    'step-trauma-stay': 'Stay with them',
  },
};

const am: EmergencyCopy = {
  languageName: 'አማርኛ',
  headline: 'ከአጠገባቸው ይቆዩ።',
  subhead: 'የድንገተኛ አገልግሎት በመንገድ ላይ እያለ በታተመ ፕሮቶኮል የተዘጋ የድምጽ የመጀመሪያ እርዳታ መመሪያ ይሰጣል።',
  startEmergency: 'ድንገተኛ ጀምር',
  changeLanguage: 'ቋንቋ ቀይር',
  chooseLanguage: 'ቋንቋዎን ይምረጡ',
  starting: 'በመጀመር ላይ…',
  whatHappened: 'ምን ሆነ?',
  collapsed: 'አንድ ሰው ወድቋል ወይም ምላሽ አይሰጥም',
  sceneCrash: 'አደጋ ወይም ጉዳት',
  sceneStroke: 'የደም ሥር መዘጋት ሊሆን ይችላል',
  sceneChoking: 'መታነቅ',
  sceneBleeding: 'ከባድ ደም መፍሰስ',
  sceneBurns: 'ቃጠሎ',
  somethingElse: 'ሌላ ነገር',
  sceneHint: 'ያዩትን ይናገሩ። መውደቅ፣ አደጋ፣ የደም ሥር መዘጋት፣ መታነቅ፣ ደም መፍሰስ እና ቃጠሎ እያንዳንዱ የተለየ የመጀመሪያ ደቂቃ መንገድ አለው።',
  onlyCollapse: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ለዚህ ቦታ የታተመ ፕሮቶኮል ከሌለ የኦፕሬተሩን ይከተሉ።',
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
  voiceUnavailableBody: 'ቁልፎቹ ፕሮቶኮሉን ይቀጥላሉ። በግልጽ መናገር ካልቻሉ ይጠቀሙባቸው።',
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
  answerHint: 'ይንኩ ወይም አዎ፣ አይ፣ ወይም እርግጠኛ አይደለሁም ይበሉ',
  actionHint: 'ይንኩ ወይም ጨርሻለሁ ወይም አልችልም ይበሉ',
  youAnswered: (answer) => `“${answer}” ብለው መልሰዋል`,
  preparingNext: 'ቀጣዩን መመሪያ በማዘጋጀት ላይ…',
  stayWithThem: 'ከአጠገባቸው ይቆዩ።',
  wellGuideYou: 'እኛ እንመራዎታለን።',
  eyebrow: 'የድንገተኛ የመጀመሪያ እርዳታ',
  noAccountNeeded: 'መለያ አያስፈልግም',
  startCaption: 'መጀመሪያ ቦታውን ይናገሩ። መውደቅ፣ አደጋ፣ የደም ሥር መዘጋት፣ መታነቅ፣ ደም መፍሰስ እና ቃጠሎ አንድ አይነት ሂደት አይደሉም።',
  beforeBegin: 'ከመጀመራችን በፊት',
  languageLocked: 'ድንገተኛው በዚህ ቋንቋ ይቀጥላል።',
  continueInLanguage: 'በአማርኛ ይቀጥሉ',
  responderAccess: 'የአዳኝ መግቢያ',
  offlineLive: 'ከመስመር ውጭ — መመሪያው ይቀጥላል። አዳኞች ገና አይመለከቱም።',
  repeatInstruction: 'መመሪያውን ድገም',
  stayedWithThem: 'ከአጠገባቸው ቆይተዋል።',
  handoffHint: 'ይህን ስልክ ያሳዩ። አዳኞች የታወቀውን፣ ያልታወቀውን እና የተከናወነውን ያያሉ።',
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
  tellOperatorCrash: 'ለ 907 ይህ አደጋ ወይም ጉዳት መሆኑን ይንገሩ። ከአጠገባቸው ይቆዩ። የኦፕሬተሩን ይከተሉ።',
  tellOperatorStroke: 'ለ 907 ይህ የደም ሥር መዘጋት ሊሆን እንደሚችል ይንገሩ። ከአጠገባቸው ይቆዩ። የኦፕሬተሩን ይከተሉ።',
  returnStart: 'ወደ መጀመሪያ ተመለስ',
  notFoundEyebrow: 'ገጹ አልተገኘም',
  notFoundTitle: 'ይህ ስክሪን የድረስ አካል አይደለም።',
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
    'step-stroke-call-ems': `${ambulance} መደወል`,
    'step-fast-face': 'ፊት',
    'step-fast-arms': 'ክንዶች',
    'step-fast-speech': 'ንግግር',
    'step-stroke-stay': 'ከአጠገባቸው መቆየት',
    'step-choke-call-ems': `${ambulance} መደወል`,
    'step-back-blows': 'አምስት የጀርባ ግርፋት',
    'step-abdominal-thrusts': 'አምስት የሆድ ግፊት',
    'step-choke-repeat': 'እስኪወጣ ድረስ ይድገሙ',
    'step-choke-stay': 'ከአጠገባቸው መቆየት',
    'step-bleed-call-ems': `${ambulance} መደወል`,
    'step-direct-pressure': 'ቀጥተኛ ጫና',
    'step-pack-wound': 'ቁስሉን መሙላት',
    'step-tourniquet': 'ቱርኒኬት',
    'step-bleed-stay': 'ከአጠገባቸው መቆየት',
    'step-burn-call-ems': `${ambulance} መደወል`,
    'step-cool-burn': 'በውሃ ማቀዝቀዝ',
    'step-burn-stay': 'ከአጠገባቸው መቆየት',
    'step-trauma-call-ems': `${ambulance} መደወል`,
    'step-dont-move': 'አያንቀሳቅሷቸው',
    'step-dont-remove': 'የተሰካ ነገር አይጎትቱ',
    'step-trauma-stay': 'ከአጠገባቸው መቆየት',
  },
};

const om: EmergencyCopy = {
  languageName: 'Afaan Oromoo',
  headline: 'Isaan bira turi.',
  subhead: 'Yeroo tajaajilli balaa tasaa karaa irratti jirutti, qajeelfama gargaarsa jalqabaa sagaleedhaan, pirotokoolii maxxanfame irratti cufame, kenna.',
  startEmergency: 'Balaa jalqabi',
  changeLanguage: 'Afaan jijjiiri',
  chooseLanguage: 'Afaan kee filadhu',
  starting: 'Jalqabaa jira…',
  whatHappened: 'Maaltu ta\'e?',
  collapsed: 'Namni kufe ykn deebii hin kennu',
  sceneCrash: 'Balaa konkolaataa ykn miidhaa',
  sceneStroke: 'Shubbisa ta\'uu danda\'a',
  sceneChoking: 'Qoonqoo',
  sceneBleeding: 'Dhiiga baay\'ee',
  sceneBurns: 'Gubaa',
  somethingElse: 'Waan biraa',
  sceneHint: 'Waan argitu himi. Kufaatii, balaan konkolaataa, shubbisa, qoonqoo, dhiiga, fi gubaan karaa daqiiqaa jalqabaa adda qabu.',
  onlyCollapse: "Amma tajaajila balaa tasaatiif bilbili. Pirotokooliin maxxanfame yoo hin jirre, operaatara hordofi.",
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
  voiceUnavailableBody: 'Tuqaawwan pirotokoolii hojjetu. Yoo ifatti dubbachuu hin dandeenye isaan fayyadami.',
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
  answerHint: 'Tuqi ykn eeyyee, lakki, ykn hin beeku jedhi',
  actionHint: "Tuqi ykn xumureera ykn hin danda'u jedhi",
  youAnswered: (answer) => `“${answer}” jettee deebifte`,
  preparingNext: 'Qajeelfama itti aanu qopheessaa jira…',
  stayWithThem: 'Isaan bira turi.',
  wellGuideYou: 'Si qajeelchanna.',
  eyebrow: 'Gargaarsa jalqabaa balaa tasaa',
  noAccountNeeded: 'Akkaawuntii hin barbaachisu',
  startCaption: 'Jalqaba bakka himi. Kufaatii, balaan konkolaataa, shubbisa, qoonqoo, dhiiga fi gubaan tarkaanfii tokko miti.',
  beforeBegin: 'Osoo hin jalqabin',
  languageLocked: 'Balaan tasaa afaan kana keessatti itti fufa.',
  continueInLanguage: 'Afaan Oromootiin itti fufi',
  responderAccess: 'Seensa gargaaraa',
  offlineLive: 'Sarara ala — qajeelfamni hojjeta. Gargaartonni ammallee hin argatan.',
  repeatInstruction: "Qajeelfama irra deebi'i",
  stayedWithThem: 'Isaan bira turte.',
  handoffHint: 'Bilbila kana agarsiisi. Gargaartonni dhugaa beekaman, hin beekamne, fi tarkaanfiiwwan xumuraman argu.',
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
  tellOperatorCrash: '907 tti kun balaa konkolaataa ykn miidhaa ta\'uu himi. Isaan bira turi. Operaatara hordofi.',
  tellOperatorStroke: '907 tti kun shubbisa ta\'uu danda\'a himi. Isaan bira turi. Operaatara hordofi.',
  returnStart: 'Gara jalqabaatti deebi\'i',
  notFoundEyebrow: 'Fuulli hin argamne',
  notFoundTitle: 'Iskiriiniin kun kan DERES miti.',
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
    'step-stroke-call-ems': `${ambulance} bilbili`,
    'step-fast-face': 'Fuula',
    'step-fast-arms': 'Harka',
    'step-fast-speech': 'Dubbii',
    'step-stroke-stay': 'Isaan bira turi',
    'step-choke-call-ems': `${ambulance} bilbili`,
    'step-back-blows': 'Dhiibbaa dugdaa shan',
    'step-abdominal-thrusts': 'Dhiibbaa garaa shan',
    'step-choke-repeat': "Hanga bahu irra deebi'i",
    'step-choke-stay': 'Isaan bira turi',
    'step-bleed-call-ems': `${ambulance} bilbili`,
    'step-direct-pressure': 'Dhiibbaa kallattii',
    'step-pack-wound': 'Madaa guuti',
    'step-tourniquet': 'Tourniquet',
    'step-bleed-stay': 'Isaan bira turi',
    'step-burn-call-ems': `${ambulance} bilbili`,
    'step-cool-burn': 'Bishaanii qabbaneessi',
    'step-burn-stay': 'Isaan bira turi',
    'step-trauma-call-ems': `${ambulance} bilbili`,
    'step-dont-move': 'Hin sochosiin',
    'step-dont-remove': 'Waan cichaa jiru hin harkisin',
    'step-trauma-stay': 'Isaan bira turi',
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
