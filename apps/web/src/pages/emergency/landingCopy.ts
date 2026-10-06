import { Language } from '@voicesos/shared';
import type { IconName } from '@/components/ui';
import { EMERGENCY_NUMBERS } from '@/config/emergency';

const ambulance = EMERGENCY_NUMBERS.ambulance;

export interface LandingCopy {
  navPlatform: string;
  navHow: string;
  navResponders: string;
  heroLead: string;
  secondaryCta: string;
  trustLabel: string;
  trust: { label: string; value: string }[];
  evidenceEyebrow: string;
  evidenceTitle: string;
  evidenceBody: string;
  evidenceSource: string;
  evidence: { value: string; label: string; detail: string }[];
  problemEyebrow: string;
  problemTitle: string;
  problemBody: string;
  problemPoints: string[];
  solutionEyebrow: string;
  solutionTitle: string;
  solutionBody: string;
  solutionPoints: string[];
  solutionsEyebrow: string;
  solutionsTitle: string;
  solutions: { icon: IconName; title: string; body: string; outcome: string }[];
  impactEyebrow: string;
  impactTitle: string;
  impact: { icon: IconName; title: string; impact: string; body: string }[];
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { n: string; title: string; body: string }[];
  statsEyebrow: string;
  stats: { value: string; label: string; detail: string }[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  footerNote: string;
  footerTagline: string;
  footerNavigate: string;
  footerEmergency: string;
  footerAmbulance: string;
  footerFire: string;
  footerPolice: string;
  footerLanguages: string;
  footerRights: string;
  footerCall: string;
  previewUrl: string;
  previewEyebrow: string;
  previewTitle: string;
  previewLocation: string;
  previewLocationValue: string;
  previewBreathing: string;
  previewBreathingValue: string;
  previewAmbulance: string;
  previewAmbulanceValue: string;
  previewGuidance: string;
  previewKnown: string;
  previewUnknown: string;
  previewNow: string;
  usualPath: string;
}

const en: LandingCopy = {
  navPlatform: 'Platform',
  navHow: 'How it works',
  navResponders: 'For responders',
  heroLead:
    'Protect the person in front of you with spoken first-aid steps and a live picture for 907 responders — in English, Amharic, and Afaan Oromoo.',
  secondaryCta: 'Responder access',
  trustLabel: 'Built for the first minutes on scene',
  trust: [
    { label: 'Languages', value: 'English · አማርኛ · Afaan Oromoo' },
    { label: 'Ambulance', value: `${ambulance} on every emergency screen` },
    { label: 'Guidance', value: 'Published protocol — never invented' },
    { label: 'Handoff', value: 'Live facts for arriving responders' },
  ],
  evidenceEyebrow: 'Addis Ababa, 2020',
  evidenceTitle: 'The first person there is usually not a medic',
  evidenceBody:
    'Among 238 trauma patients at Addis Ababa Burn Emergency and Trauma Hospital, scene care came mostly from relatives and bystanders — not ambulance staff. When no care was given, lack of knowledge was the main reason. DERES is built for that person.',
  evidenceSource: 'G/Ananya & Zemede. Pre-hospital Care to Trauma Patients in Addis Ababa. Ethiop J Health Sci. 2021 (n=238).',
  evidence: [
    { value: '45%', label: 'Relatives as first carers', detail: 'Of those who received scene care' },
    { value: '33.9%', label: 'Bystanders as first carers', detail: 'Untrained people already acting' },
    { value: '61.2%', label: 'No care — lack of knowledge', detail: 'Main reason care was not given' },
    { value: '46.2%', label: 'Any care at the scene', detail: 'Fewer than half helped before hospital' },
  ],
  problemEyebrow: 'The problem',
  problemTitle: 'Untrained people are already first on scene',
  problemBody:
    'When someone collapses, relatives and bystanders are often the ones giving care — if they give any. Operators hear incomplete, stressed speech. Responders arrive without a shared picture of what was already tried. Those gaps waste the minutes that decide cardiac-arrest outcomes.',
  problemPoints: [
    'Lack of knowledge is why many freeze instead of acting',
    'A crash, a stroke, choking, bleeding, a burn, and a collapse are not the same procedure',
    'Responders walking in without knowing what was done',
  ],
  solutionEyebrow: 'The solution',
  solutionTitle: 'Linking the person on scene to emergency response',
  solutionBody:
    'DERES speaks one verified first-aid step at a time, in the language chosen for that emergency. Location and known facts stream to the responder view so help arrives with a picture, not a blank slate.',
  solutionPoints: [
    'Name the scene first — then the matching protocol, or a 907 call if we have none',
    'Voice or large buttons — both run the same path when speech fails',
    'Warnings, facts, and steps already taken',
  ],
  solutionsEyebrow: 'Platform',
  solutionsTitle: 'Four ways DERES tightens the chain of survival',
  solutions: [
    {
      icon: 'mic',
      title: 'Bystander guidance',
      body: 'Emergency speech is often stressed and incomplete. One spoken question or action at a time. Tap if you cannot speak. The medical line on screen is the protocol — DERES does not paraphrase it.',
      outcome: 'Faster, calmer first aid until help arrives.',
    },
    {
      icon: 'users',
      title: 'Community & worker safety',
      body: 'No account. Anyone nearby can start. Clinics, campuses, and street bystanders use the same flow — stay with them, follow the next step, call ambulance.',
      outcome: 'Fewer frozen minutes at the scene.',
    },
    {
      icon: 'building',
      title: 'Facility handoff',
      body: 'When help reaches a home, clinic, or workplace, show the phone. Responders see consciousness, breathing, location, and which steps were confirmed.',
      outcome: 'On-site teams pick up with context, not a recap.',
    },
    {
      icon: 'signal',
      title: 'Digital incident intelligence',
      body: 'The responder dashboard lists live incidents by urgency, with location, warnings, and a timeline. It is a handoff picture — not a fleet or dispatch system.',
      outcome: 'Less time reconstructing what already happened.',
    },
  ],
  impactEyebrow: 'Capabilities',
  impactTitle: 'What moves with the emergency',
  impact: [
    {
      icon: 'phone',
      title: `Direct ${ambulance} call`,
      impact: 'Cut delay when an ambulance is needed.',
      body: `A persistent ambulance ${ambulance} control stays on the emergency screen. DERES guides; it does not replace emergency services.`,
    },
    {
      icon: 'location',
      title: 'Verified location',
      impact: 'Reduce the friction of voice-only reports.',
      body: 'When the bystander allows it, coordinates go to responders with the incident — not only a spoken description.',
    },
    {
      icon: 'shield',
      title: 'Protocol, not a chatbot',
      impact: 'Keep medical wording locked.',
      body: 'Published evaluations of large language models on emergency cases have shown diagnostic accuracy around 58–65%, even with a combined super-learner near 70%. DERES never lets the model write the next medical line. The protocol does. Unknown facts stay labeled unknown.',
    },
    {
      icon: 'pulse',
      title: 'Incident intelligence',
      impact: 'Strengthen the handoff.',
      body: 'Each emergency keeps a shared picture — warnings, known facts, unknowns, and confirmed actions — so the arriving team does not reconstruct from memory.',
    },
  ],
  storyEyebrow: 'Before professionals arrive',
  storyTitle: 'The first minutes are not one procedure',
  storyBody:
    "A crash is not a stroke, and neither is choking, bleeding, a burn, or a collapse. DERES names the scene first, then speaks that scene's locked first-aid path — FAST and call for stroke, back blows then abdominal thrusts for choking, pressure then packing then tourniquet for severe bleeding, cool running water for burns, do-not-move for trauma, compressions only if they have collapsed. Something else still means call 907 without inventing a procedure.",
  stepsEyebrow: 'How it works',
  stepsTitle: 'Start. Name the scene. Follow that path.',
  steps: [
    { n: '01', title: 'Start', body: 'No account. Choose a language once. Start the emergency.' },
    { n: '02', title: 'Name the scene', body: 'Collapse, crash, stroke, choking, bleeding, burn, or something else. That choice picks the path — not a generic script.' },
    { n: '03', title: 'Hand off', body: 'Keep the phone visible. Responders see the scene type, what is known, unknown, and already done.' },
  ],
  statsEyebrow: 'On this platform',
  stats: [
    { value: '3', label: 'Languages on scene', detail: 'English, Amharic, Afaan Oromoo' },
    { value: ambulance, label: 'Ambulance short code', detail: 'Always reachable from the emergency screen' },
    { value: '6', label: 'Published protocols', detail: 'Six first-minute paths — wording is locked' },
    { value: 'Live', label: 'Responder handoff', detail: 'Incidents update as facts are confirmed' },
  ],
  ctaEyebrow: 'Ready when the first minutes start',
  ctaTitle: 'Stay with them. We will guide you.',
  ctaBody: 'If someone needs help before professionals arrive, start now. Name the scene. If you are a responder, open the live incident list.',
  footerNote: `DERES (ድረስ) is a voice-first first-aid guide for Ethiopia. It is not a doctor, not a chatbot that invents advice, and not a replacement for ambulance ${ambulance}.`,
  footerTagline: 'With you in the first minutes.',
  footerNavigate: 'Explore',
  footerEmergency: 'Emergency numbers',
  footerAmbulance: 'Ambulance',
  footerFire: 'Fire',
  footerPolice: 'Police',
  footerLanguages: 'Languages',
  footerRights: '© 2026 DERES · ድረስ',
  footerCall: 'Call',
  previewUrl: 'deres.app · live incident',
  previewEyebrow: 'Live incident intelligence',
  previewTitle: 'Unresponsive adult',
  previewLocation: 'Location',
  previewLocationValue: 'Shared with responders',
  previewBreathing: 'Breathing',
  previewBreathingValue: 'Unknown',
  previewAmbulance: 'Ambulance',
  previewAmbulanceValue: `${ambulance} — call from the screen`,
  previewGuidance: 'Guidance',
  previewKnown: 'Known',
  previewUnknown: 'Unknown',
  previewNow: 'Now',
  usualPath: 'Usual path',
};

const am: LandingCopy = {
  navPlatform: 'መድረክ',
  navHow: 'እንዴት እንደሚሰራ',
  navResponders: 'ለአዳኞች',
  heroLead:
    'በፊትዎ ላለው ሰው በድምጽ የመጀመሪያ እርዳታ ደረጃዎችን እና ለ 907 አዳኞች የቀጥታ ሁኔታን ይስጡ — በእንግሊዘኛ፣ በአማርኛ እና በአፋን ኦሮሞ።',
  secondaryCta: 'የአዳኝ መግቢያ',
  trustLabel: 'ለመጀመሪያዎቹ ደቂቃዎች የተሰራ',
  trust: [
    { label: 'ቋንቋዎች', value: 'English · አማርኛ · Afaan Oromoo' },
    { label: 'አምቡላንስ', value: `${ambulance} በእያንዳንዱ የድንገተኛ ስክሪን ላይ` },
    { label: 'መመሪያ', value: 'የታተመ ፕሮቶኮል — በፍጹም አይፈጠርም' },
    { label: 'ማስረከብ', value: 'ለሚደርሱ አዳኞች የቀጥታ እውነታዎች' },
  ],
  evidenceEyebrow: 'አዲስ አበባ፣ 2020',
  evidenceTitle: 'በቦታው የመጀመሪያው ሰው ብዙ ጊዜ ሐኪም አይደለም',
  evidenceBody:
    'በአዲስ አበባ ቃጠሎ ድንገተኛ እና የአደጋ ሆስፒታል ከተመለከቱ 238 የአደጋ ታካሚዎች መካከል፣ በቦታው የተሰጠ እንክብካቤ በአብዛኛው ከዘመዶች እና ከአጋዦች መጣ — ከሰለጠነ የአምቡላንስ ሠራተኛ አይደለም። እንክብካቤ ካልተሰጠ፣ ዋናው ምክንያት የእውቀት እጥረት ነበር። ድረስ ለዚያ ሰው የተሰራ ነው።',
  evidenceSource: 'ጂ/አናንያ እና ዘመደ። ለአደጋ ታካሚዎች ቅድመ-ሆስፒታል እንክብካቤ በአዲስ አበባ። Ethiop J Health Sci. 2021 (n=238)።',
  evidence: [
    { value: '45%', label: 'ዘመዶች እንደ የመጀመሪያ እንክብካቤ ሰጪዎች', detail: 'በቦታው እንክብካቤ ከተሰጣቸው መካከል' },
    { value: '33.9%', label: 'አጋዦች እንደ የመጀመሪያ እንክብካቤ ሰጪዎች', detail: 'ያልሰለጠኑ ሰዎች አስቀድመው እየሠሩ ነው' },
    { value: '61.2%', label: 'እንክብካቤ አልተሰጠም — የእውቀት እጥረት', detail: 'እንክብካቤ ያልተሰጠበት ዋና ምክንያት' },
    { value: '46.2%', label: 'በቦታው ማንኛውም እንክብካቤ', detail: 'ከግማሽ በታች ወደ ሆስፒታል ከመድረሳቸው በፊት እርዳታ አግኝተዋል' },
  ],
  problemEyebrow: 'ችግሩ',
  problemTitle: 'ያልሰለጠኑ ሰዎች አስቀድመው በቦታው የመጀመሪያዎች ናቸው',
  problemBody:
    'አንድ ሰው ሲወድቅ፣ ዘመዶች እና አጋዦች ብዙ ጊዜ እንክብካቤ የሚሰጡት ናቸው — ካሰጡ። ኦፕሬተሮች ያልተሟሉ፣ የጭንቀት ንግግር ይሰማሉ። አዳኞች ምን እንደተሞከረ የጋራ ምስል ሳይኖራቸው ይደርሳሉ። እነዚህ ክፍተቶች የልብ መቆም ውጤትን የሚወስኑትን ደቂቃዎች ያባክናሉ።',
  problemPoints: [
    'ብዙዎች የሚቀዘቅዙት የእውቀት እጥረት ስለሆነ ነው',
    'አደጋ፣ የደም ሥር መዘጋት፣ መታነቅ፣ ደም መፍሰስ፣ ቃጠሎ እና መውደቅ አንድ አይነት ሂደት አይደሉም',
    'አዳኞች ምን እንደተደረገ ሳያውቁ መድረስ',
  ],
  solutionEyebrow: 'መፍትሄው',
  solutionTitle: 'በቦታው ያለውን ሰው ከድንገተኛ ምላሽ ጋር ማገናኘት',
  solutionBody:
    'ድረስ ለዚያ ድንገተኛ የተመረጠው ቋንቋ በአንድ የተረጋገጠ የመጀመሪያ እርዳታ ደረጃ በአንድ ጊዜ ይናገራል። አካባቢ እና የታወቁ እውነታዎች ወደ አዳኝ እይታ ይላካሉ፤ እርዳታ ባዶ ሳይሆን በምስል ይደርሳል።',
  solutionPoints: [
    'መጀመሪያ ቦታውን ይናገሩ — ከዚያ የሚዛመደው ፕሮቶኮል ወይም 907 ጥሪ',
    'ድምጽ ወይም ትልልቅ ቁልፎች — ንግግር ሲያልቅ ሁለቱም አንድ መንገድ ይከተላሉ',
    'ማስጠንቀቂያዎች፣ እውነታዎች እና የተከናወኑ ደረጃዎች',
  ],
  solutionsEyebrow: 'መድረክ',
  solutionsTitle: 'ድረስ የህይወት ሰንሰለትን የሚያጠናክርባቸው አራት መንገዶች',
  solutions: [
    {
      icon: 'mic',
      title: 'የአጋዥ መመሪያ',
      body: 'የድንገተኛ ንግግር ብዙ ጊዜ የጭንቀት እና ያልተሟላ ነው። በአንድ ጊዜ አንድ የሚነገር ጥያቄ ወይም እርምጃ። መናገር ካልቻሉ ይንኩ። በስክሪኑ ላይ ያለው የሕክምና መስመር ፕሮቶኮሉ ነው — ድረስ አይቀይረውም።',
      outcome: 'እርዳታ እስኪደርስ ድረስ ፈጣን፣ የረጋ የመጀመሪያ እርዳታ።',
    },
    {
      icon: 'users',
      title: 'የማህበረሰብ እና የሰራተኛ ደህንነት',
      body: 'መለያ አያስፈልግም። ማንኛውም አቅራቢያ ያለ ሰው ሊጀምር ይችላል። ክሊኒኮች፣ ካምፓሶች እና የመንገድ አጋዦች አንድ ፍሰት ይጠቀማሉ — ከአጠገባቸው ይቆዩ፣ ቀጣዩን ደረጃ ይከተሉ፣ አምቡላንስ ይደውሉ።',
      outcome: 'በቦታው ያሉ የቀዘቀዙ ደቂቃዎችን ይቀንሳል።',
    },
    {
      icon: 'building',
      title: 'የተቋም ማስረከብ',
      body: 'እርዳታ ወደ ቤት፣ ክሊኒክ ወይም የስራ ቦታ ሲደርስ ስልኩን ያሳዩ። አዳኞች ንቃተ ህሊና፣ መተንፈስ፣ አካባቢ እና የተረጋገጡ ደረጃዎችን ያያሉ።',
      outcome: 'በቦታው ያሉ ቡድኖች በአውድ ይቀጥላሉ እንጂ በድጋሚ አይነገራቸውም።',
    },
    {
      icon: 'signal',
      title: 'የዲጂታል ክስተት መረጃ',
      body: 'የአዳኝ ዳሽቦርድ የቀጥታ ክስተቶችን በአስቸኳይ ይዘረዝራል፤ አካባቢ፣ ማስጠንቀቂያዎች እና የጊዜ መስመር አሉት። የማስረከቢያ ምስል ነው — የመላኪያ ስርዓት አይደለም።',
      outcome: 'ምን እንደሆነ እንደገና ለመገንባት የሚወስደው ጊዜ ይቀንሳል።',
    },
  ],
  impactEyebrow: 'ችሎታዎች',
  impactTitle: 'ከድንገተኛው ጋር የሚንቀሳቀሰው',
  impact: [
    {
      icon: 'phone',
      title: `ቀጥታ ${ambulance} ጥሪ`,
      impact: 'አምቡላንስ ሲያስፈልግ መዘግየትን ይቀንሱ።',
      body: `ቋሚ የአምቡላንስ ${ambulance} መቆጣጠሪያ በድንገተኛ ስክሪኑ ላይ ይቆያል። ድረስ ይመራል፤ የድንገተኛ አገልግሎትን አይተካም።`,
    },
    {
      icon: 'location',
      title: 'የተረጋገጠ አካባቢ',
      impact: 'በድምጽ ብቻ የሚደረግ ሪፖርት ግጭትን ይቀንሱ።',
      body: 'አጋዡ ሲፈቅድ፣ መጋጠሚያዎች ከክስተቱ ጋር ወደ አዳኞች ይሄዳሉ — በድምጽ መግለጫ ብቻ አይደለም።',
    },
    {
      icon: 'shield',
      title: 'ፕሮቶኮል እንጂ ቻትቦት አይደለም',
      impact: 'የሕክምና ቃላትን የተቆለፉ ያድርጉ።',
      body: 'በድንገተኛ ጉዳዮች ላይ ትላልቅ የቋንቋ ሞዴሎች የታተሙ ግምገማዎች የምርመራ ትክክለኛነት በ58–65% አካባቢ አሳይተዋል፤ የተዋሃደ ሱፐር-ለርነር ወደ 70% ይደርሳል። ድረስ ሞዴሉ ቀጣዩን የሕክምና መስመር እንዲጽፍ በጭራሽ አይፈቅድም። ፕሮቶኮሉ ነው የሚጽፈው። ያልታወቁ እውነታዎች ያልታወቁ ሆነው ይቆያሉ።',
    },
    {
      icon: 'pulse',
      title: 'የክስተት መረጃ',
      impact: 'ማስረከቡን ያጠናክሩ።',
      body: 'እያንዳንዱ ድንገተኛ የጋራ ምስል ይይዛል — ማስጠንቀቂያዎች፣ የታወቁ እውነታዎች፣ ያልታወቁት እና የተረጋገጡ እርምጃዎች — ስለዚህ የሚደርሰው ቡድን ከማስታወስ አይገነባም።',
    },
  ],
  storyEyebrow: 'ባለሙያዎች ከመድረሳቸው በፊት',
  storyTitle: 'የመጀመሪያዎቹ ደቂቃዎች አንድ ሂደት አይደሉም',
  storyBody:
    'አደጋ የደም ሥር መዘጋት አይደለም፤ መታነቅ፣ ደም መፍሰስ፣ ቃጠሎ ወይም መውደቅም አይደለም። ድረስ መጀመሪያ ቦታውን ይሰይማል፤ ከዚያ የዚያን ቦታ የተቆለፈ የመጀመሪያ እርዳታ መንገድ ይናገራል። ሌላ ነገር አሁንም 907 ነው — ሕክምና አይፈጥርም።',
  stepsEyebrow: 'እንዴት እንደሚሰራ',
  stepsTitle: 'ይጀምሩ። ቦታውን ይናገሩ። ያንን መንገድ ይከተሉ።',
  steps: [
    { n: '01', title: 'ጀምር', body: 'መለያ አያስፈልግም። ቋንቋ አንድ ጊዜ ይምረጡ። ድንገተኛውን ይጀምሩ።' },
    { n: '02', title: 'ቦታውን ይናገሩ', body: 'መውደቅ፣ አደጋ፣ የደም ሥር መዘጋት፣ መታነቅ፣ ደም መፍሰስ፣ ቃጠሎ፣ ወይም ሌላ። ያ ምርጫ መንገዱን ይመርጣል — አንድ አጠቃላይ ጽሑፍ አይደለም።' },
    { n: '03', title: 'ያስረክቡ', body: 'ስልኩን የሚታይ ያድርጉት። አዳኞች የቦታውን አይነት፣ የታወቀውን፣ ያልታወቀውን እና የተከናወነውን ያያሉ።' },
  ],
  statsEyebrow: 'በዚህ መድረክ ላይ',
  stats: [
    { value: '3', label: 'በቦታው ያሉ ቋንቋዎች', detail: 'እንግሊዘኛ፣ አማርኛ፣ አፋን ኦሮሞ' },
    { value: ambulance, label: 'የአምቡላንስ አጭር ኮድ', detail: 'ከድንገተኛ ስክሪኑ ሁልጊዜ ሊደረስበት ይችላል' },
    { value: '6', label: 'የታተሙ ፕሮቶኮሎች', detail: 'ስድስት የመጀመሪያ ደቂቃ መንገዶች — ቃላቱ የተቆለፉ ናቸው' },
    { value: 'ቀጥታ', label: 'የአዳኝ ማስረከብ', detail: 'እውነታዎች ሲረጋገጡ ክስተቶች ይዘምናሉ' },
  ],
  ctaEyebrow: 'የመጀመሪያዎቹ ደቂቃዎች ሲጀምሩ ዝግጁ',
  ctaTitle: 'ከአጠገባቸው ይቆዩ። እኛ እንመራዎታለን።',
  ctaBody: 'ባለሙያዎች ከመድረሳቸው በፊት እርዳታ ካስፈለገ አሁን ይጀምሩ። ቦታውን ይናገሩ። አዳኝ ከሆኑ የቀጥታ ክስተት ዝርዝሩን ይክፈቱ።',
  footerNote: `ድረስ (DERES) ለኢትዮጵያ በድምጽ የሚመራ የመጀመሪያ እርዳታ መመሪያ ነው። ሐኪም አይደለም፣ ምክር የሚፈጥር ቻትቦት አይደለም፣ የአምቡላንስ ${ambulance} ተተኪም አይደለም።`,
  footerTagline: 'በመጀመሪያዎቹ ደቂቃዎች ከእርስዎ ጋር።',
  footerNavigate: 'ይሂዱ',
  footerEmergency: 'የድንገተኛ ቁጥሮች',
  footerAmbulance: 'አምቡላንስ',
  footerFire: 'እሳት',
  footerPolice: 'ፖሊስ',
  footerLanguages: 'ቋንቋዎች',
  footerRights: '© 2026 ድረስ · DERES',
  footerCall: 'ይደውሉ',
  previewUrl: 'deres.app · የቀጥታ ክስተት',
  previewEyebrow: 'የቀጥታ ክስተት መረጃ',
  previewTitle: 'ምላሽ የማይሰጥ አዋቂ',
  previewLocation: 'አካባቢ',
  previewLocationValue: 'ለአዳኞች ተጋርቷል',
  previewBreathing: 'መተንፈስ',
  previewBreathingValue: 'አይታወቅም',
  previewAmbulance: 'አምቡላንስ',
  previewAmbulanceValue: `${ambulance} — ከስክሪኑ ይደውሉ`,
  previewGuidance: 'መመሪያ',
  previewKnown: 'ታውቋል',
  previewUnknown: 'አይታወቅም',
  previewNow: 'አሁን',
  usualPath: 'የተለመደው መንገድ',
};

const om: LandingCopy = {
  navPlatform: 'Waltajjii',
  navHow: 'Akkamitti hojjeta',
  navResponders: 'Gargaartotaaf',
  heroLead:
    'Nama fuula kee duraa jiru tarkaanfiiwwan gargaarsa jalqabaa sagaleedhaan fi haala kallattii gargaartota 907 tiif eegi — Afaan Ingilizii, Amaaraa fi Afaan Oromootiin.',
  secondaryCta: 'Seensa gargaaraa',
  trustLabel: 'Daqiiqaa jalqabaa irratti hojjetame',
  trust: [
    { label: 'Afaanota', value: 'English · አማርኛ · Afaan Oromoo' },
    { label: 'Ambulaansii', value: `${ambulance} iskiriinii balaa tasaa hunda irratti` },
    { label: 'Qajeelfama', value: 'Pirotokoolii maxxanfame — gonkumaa hin uumamu' },
    { label: 'Harkaa fuudhu', value: 'Dhugaa kallattii gargaartota dhufaniif' },
  ],
  evidenceEyebrow: 'Finfinnee, 2020',
  evidenceTitle: 'Namni jalqabaa bakka jiru yeroo baay\'ee ogeessa miti',
  evidenceBody:
    'Dhukkubsatoota balaa 238 hospitalii gubaa, balaa tasaa fi miidhaa Finfinnee (AaBET) keessatti, kunuunsi bakka irratti kenname irra caalaa firoottotaa fi namoota bira jiran irraa dhufe — hojjettoota ambulaansii leenjifaman irraa miti. Yeroo kunuunsi hin kennamne, sababni ijoon hanqina beekumsaa ture. DERES namicha sanaaf ijaarame.',
  evidenceSource: 'G/Ananya fi Zemede. Kunuunsa duraa hospitaalaa dhukkubsatoota miidhaa Finfinnee. Ethiop J Health Sci. 2021 (n=238).',
  evidence: [
    { value: '45%', label: 'Firoottanni kunuunsa jalqabaa kennu', detail: 'Kunuunsa bakka irratti argatan keessaa' },
    { value: '33.9%', label: 'Namoonni bira jiran kunuunsa jalqabaa kennu', detail: 'Namoonni hin leenjifamne duraanuu hojjechaa jiru' },
    { value: '61.2%', label: 'Kunuunsi hin kennamne — hanqina beekumsaa', detail: 'Sababni ijoon kunuunsi hin kennamneef' },
    { value: '46.2%', label: 'Kunuunsa kamiyyuu bakka irratti', detail: 'Walakkaa gaditti hospitaalaa duratti gargaarsa argatan' },
  ],
  problemEyebrow: 'Rakkoo',
  problemTitle: 'Namoonni hin leenjifamne duraanuu bakka irratti jalqabaa dha',
  problemBody:
    'Namni yeroo kufu, firoottanni fi namoonni bira jiran yeroo baay\'ee kunuunsa kennu — yoo kennan. Operatoronni dubbii hin guutamne, dhiphina qabu dhagahu. Gargaartonni suuraa waliinii waan yaalame malee dhufu. Qoodamni kun daqiiqaa bu\'aa dhaabbii onnee murteessu balleessa.',
  problemPoints: [
    'Namoonni hedduun kan qorraawu hanqina beekumsaa irraati',
    'Balaan konkolaataa, shubbisa, qoonqoo, dhiiga, gubaa fi kufaatii tarkaanfii tokko miti',
    'Gargaartonni waan hojjetame hin beekneen dhufu',
  ],
  solutionEyebrow: 'Furmaata',
  solutionTitle: 'Nama bakka jiru deebii balaa tasaatti hidhuu',
  solutionBody:
    'DERES afaan balaa tasaa sanaaf filatame keessatti tarkaanfii gargaarsa jalqabaa mirkanaa\'e tokko tokkoon dubbata. Bakka fi dhugaa beekaman gara ilaalcha gargaaraatti ergamu, gargaarsi suuraa wajjin dhaqu malee duwwaa miti.',
  solutionPoints: [
    'Jalqaba bakka himi — sana booda pirotokoolii walsimatu, ykn bilbila 907',
    'Sagalee ykn tuqaawwan guddaa — dubbiin yeroo kuffu lamaan karaa tokko hojjetu',
    'Akeekkachiisa, dhugaa fi tarkaanfiiwwan xumuraman',
  ],
  solutionsEyebrow: 'Waltajjii',
  solutionsTitle: 'Karaan afur DERES calaqqee lubbuu cimsu',
  solutions: [
    {
      icon: 'mic',
      title: 'Qajeelfama namni bira jiru',
      body: 'Dubbiin balaa tasaa yeroo baay\'ee dhiphinaa fi hin guutamne dha. Yeroo tokkotti gaaffii ykn tarkaanfii sagalee tokko. Dubbachuu yoo hin dandeenye tuqi. Sararri yaalaa iskiriinii irra jiru pirotokooliidha — DERES hin jijjiiru.',
      outcome: 'Hanga gargaarsi dhufutti gargaarsa jalqabaa saffisaa, tasgabbii qabu.',
    },
    {
      icon: 'users',
      title: 'Nageenya hawaasaa fi hojjetootaa',
      body: 'Akkaawuntii hin barbaachisu. Namni dhihoo jiru kamiyyuu jalqabuu danda\'a. Kilinika, kaampasii fi namoonni karaa irratti jiran adeemsa tokko fayyadamu.',
      outcome: 'Daqiiqaa qabbanaa\'e bakka irratti hir\'isa.',
    },
    {
      icon: 'building',
      title: 'Harkaa fuudhu dhaabbataa',
      body: 'Gargaarsi mana, kilinika ykn bakka hojii yeroo ga\'u bilbila agarsiisi. Gargaartonni hubannoo, hargansuu, bakka fi tarkaanfii mirkanaa\'e argu.',
      outcome: 'Gareen bakka jiru haala beekuun fudhatu malee irra deebi\'anii hin himamu.',
    },
    {
      icon: 'signal',
      title: 'Odeeffannoo balaa dijitaalaa',
      body: 'Daashboordiin gargaaraa balaawwan kallattii hatattamaadhaan tarreessa; bakka, akeekkachiisa fi yeroo qaba. Suuraa harkaa fuudhuudha — sirna ergaa miti.',
      outcome: 'Waan ta\'e irra deebi\'anii ijaaruuf yeroo hir\'isa.',
    },
  ],
  impactEyebrow: 'Dandeettiiwwan',
  impactTitle: 'Kan balaa tasaa wajjin socho\'u',
  impact: [
    {
      icon: 'phone',
      title: `Bilbila ${ambulance} kallattii`,
      impact: 'Ambulaansiin yeroo barbaachisu tuffii hir\'isi.',
      body: `Tooftaan ambulaansii ${ambulance} iskiriinii balaa tasaa irratti tura. DERES qajeelcha; tajaajila balaa tasaa hin bakka bu\'u.`,
    },
    {
      icon: 'location',
      title: 'Bakka mirkanaa\'e',
      impact: 'Gabaasa sagalee qofa ta\'e hir\'isi.',
      body: 'Yoo namni bira jiru hayyame, qaxxaamura balaa wajjin gargaartotaaf ergame — ibsa sagalee qofa miti.',
    },
    {
      icon: 'shield',
      title: 'Pirotokoolii, chaatbootii miti',
      impact: 'Jecha yaalaa cufame eegi.',
      body: 'Madaalliin maxxanfame moodeloota afaanii gurguddoo dhimmoota balaa tasaa irratti sirrii ta\'uu qorannoo 58–65% agarsiise; super-learner walitti makame 70% dhihaata. DERES moodeliin sarara yaalaa itti aanu akka hin barreessine gonkumaa hin hayyamu. Pirotokoolii tu barreessa. Dhugaan hin beekamne hin beekamne jedhame tura.',
    },
    {
      icon: 'pulse',
      title: 'Odeeffannoo balaa',
      impact: 'Harkaa fuudhu cimsi.',
      body: 'Balaan tasaa hundi suuraa waliinii qaba — akeekkachiisa, dhugaa beekaman, hin beekamne, fi tarkaanfii mirkanaa\'e — akka gareen dhufu yaadannoo irraa hin ijaarre.',
    },
  ],
  storyEyebrow: 'Ogeessota dura',
  storyTitle: 'Daqiiqaan jalqabaa tarkaanfii tokko miti',
  storyBody:
    'Balaan konkolaataa shubbisa miti; qoonqoo, dhiiga, gubaa ykn kufaatii miti. DERES jalqaba bakka moggaasa, sana booda karaa gargaarsa jalqabaa cufame dubbata. Waan biraa ammallee 907 dha — yaala hin uumu.',
  stepsEyebrow: 'Akkamitti hojjeta',
  stepsTitle: 'Jalqabi. Bakka himi. Karaa sana hordofi.',
  steps: [
    { n: '01', title: 'Jalqabi', body: 'Akkaawuntii hin barbaachisu. Afaan al tokko filadhu. Balaa tasaa jalqabi.' },
    { n: '02', title: 'Bakka himi', body: 'Kufaatii, balaa konkolaataa, shubbisa, qoonqoo, dhiiga, gubaa, ykn waan biraa. Filannoon kun karaa filata — barreeffama waliigalaa miti.' },
    { n: '03', title: 'Harkaa fuudhi', body: 'Bilbila mul\'achaa jiraachisi. Gargaartonni gosa bakkaa, beekame, hin beekamne fi xumurame argu.' },
  ],
  statsEyebrow: 'Waltajjii kana irratti',
  stats: [
    { value: '3', label: 'Afaanota bakka irratti', detail: 'Afaan Ingilizii, Amaaraa, Afaan Oromoo' },
    { value: ambulance, label: 'Koodii gabaabaa ambulaansii', detail: 'Iskiriinii balaa tasaa irraa yeroo hunda argama' },
    { value: '6', label: 'Pirotokoolota maxxanfamani', detail: 'Karaa daqiiqaa jalqabaa ja\'a — jechi cufameera' },
    { value: 'Kallattii', label: 'Harkaa fuudhu gargaaraa', detail: 'Dhugaan yeroo mirkanaa\'u balaan haaromsa' },
  ],
  ctaEyebrow: 'Daqiiqaan jalqabaa yeroo eegalu qophaa\'eera',
  ctaTitle: 'Isaan bira turi. Si qajeelchanna.',
  ctaBody: 'Ogeessota dura gargaarsi yoo barbaachise, amma jalqabi. Bakka himi. Gargaaraa yoo taate, tarree balaa kallattii bani.',
  footerNote: `DERES (ድረስ) qajeelfama gargaarsa jalqabaa sagaleedhaan Itoophiyaaf. Doktora miti, chaatbootii gorsaa uumu miti, bakka bu'aa ambulaansii ${ambulance} miti.`,
  footerTagline: 'Daqiiqaa jalqabaa keessatti si wajjin.',
  footerNavigate: 'Deemsa',
  footerEmergency: 'Lakkoofsa balaa tasaa',
  footerAmbulance: 'Ambulaansii',
  footerFire: 'Ibida',
  footerPolice: 'Poolisii',
  footerLanguages: 'Afaanota',
  footerRights: '© 2026 DERES · ድረስ',
  footerCall: 'Bilbili',
  previewUrl: 'deres.app · balaa kallattii',
  previewEyebrow: 'Odeeffannoo balaa kallattii',
  previewTitle: 'Ga\'eessa deebii hin kennine',
  previewLocation: 'Bakka',
  previewLocationValue: 'Gargaartotaaf qoodame',
  previewBreathing: 'Hargansuu',
  previewBreathingValue: 'Hin beekamu',
  previewAmbulance: 'Ambulaansii',
  previewAmbulanceValue: `${ambulance} — iskiriinii irraa bilbili`,
  previewGuidance: 'Qajeelfama',
  previewKnown: 'Beekama',
  previewUnknown: 'Hin beekamu',
  previewNow: 'Amma',
  usualPath: 'Karaa idilee',
};

const COPY: Record<Language, LandingCopy> = {
  [Language.ENGLISH]: en,
  [Language.AMHARIC]: am,
  [Language.AFAAN_OROMO]: om,
};

export function landingCopy(language: Language): LandingCopy {
  return COPY[language] ?? en;
}
