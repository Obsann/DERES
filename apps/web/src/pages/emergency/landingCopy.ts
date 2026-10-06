import { EMERGENCY_NUMBERS } from '@/config/emergency';

const ambulance = EMERGENCY_NUMBERS.ambulance;

/** English platform copy for the public landing page. Emergency CTAs stay in emergencyCopy. */
export const landing = {
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
  problemEyebrow: 'The problem',
  problemTitle: 'The crisis of disconnected first minutes',
  problemBody:
    'When someone collapses, untrained bystanders freeze. Operators hear incomplete voice reports. Responders arrive without knowing what was already tried. Those gaps waste the minutes that decide cardiac-arrest outcomes.',
  problemPoints: [
    'Guessing instead of one clear action',
    'Language switching mid-emergency',
    'Responders walking in blind',
  ],
  solutionEyebrow: 'The solution',
  solutionTitle: 'Linking the person on scene to emergency response',
  solutionBody:
    'DERES speaks one verified first-aid step at a time, in the language chosen for that emergency. Location and known facts stream to the responder view so help arrives with a picture, not a blank slate.',
  solutionPoints: [
    'Voice or large buttons — both run the same protocol',
    'Language locked for the whole emergency',
    'Warnings, facts, and steps already taken',
  ],
  solutionsEyebrow: 'Platform',
  solutionsTitle: 'Four ways DERES tightens the chain of survival',
  solutions: [
    {
      icon: 'mic' as const,
      title: 'Bystander guidance',
      body: 'One spoken question or action at a time. Tap if you cannot speak. The medical line on screen is the protocol — DERES does not paraphrase it.',
      outcome: 'Faster, calmer first aid until help arrives.',
    },
    {
      icon: 'users' as const,
      title: 'Community & worker safety',
      body: 'No account. Anyone nearby can start. Clinics, campuses, and street bystanders use the same flow — stay with them, follow the next step, call ambulance.',
      outcome: 'Fewer frozen minutes at the scene.',
    },
    {
      icon: 'building' as const,
      title: 'Facility handoff',
      body: 'When help reaches a home, clinic, or workplace, show the phone. Responders see consciousness, breathing, location, and which steps were confirmed.',
      outcome: 'On-site teams pick up with context, not a recap.',
    },
    {
      icon: 'signal' as const,
      title: 'Digital incident intelligence',
      body: 'The responder dashboard lists live incidents by urgency, with location, warnings, and a timeline. It is a handoff picture — not a fleet or dispatch system.',
      outcome: 'Less time reconstructing what already happened.',
    },
  ],
  impactEyebrow: 'Capabilities',
  impactTitle: 'What moves with the emergency',
  impact: [
    {
      icon: 'phone' as const,
      title: `Direct ${ambulance} call`,
      impact: 'Cut delay when an ambulance is needed.',
      body: `A persistent ambulance ${ambulance} control stays on the emergency screen. DERES guides; it does not replace emergency services.`,
    },
    {
      icon: 'location' as const,
      title: 'Verified location',
      impact: 'Reduce the friction of voice-only reports.',
      body: 'When the bystander allows it, coordinates go to responders with the incident — not only a spoken description.',
    },
    {
      icon: 'shield' as const,
      title: 'Protocol, not a chatbot',
      impact: 'Keep medical wording locked.',
      body: 'An LLM may understand speech. It never writes the instruction. Unknown facts stay labeled unknown.',
    },
    {
      icon: 'pulse' as const,
      title: 'Incident intelligence',
      impact: 'Strengthen the handoff.',
      body: 'Each emergency keeps a digital log of warnings, facts, and confirmed actions for the arriving team.',
    },
  ],
  storyEyebrow: 'Cardiac arrest',
  storyTitle: 'Every second on scene still counts',
  storyBody:
    'Most of the first-aid DERES can give today is for an unresponsive adult. The app asks whether they respond, tells you to call ambulance, then guides airway, breathing, and compressions — one line at a time — until responders take over.',
  stepsEyebrow: 'How it works',
  stepsTitle: 'Start. Follow one step. Hand off.',
  steps: [
    {
      n: '01',
      title: 'Start',
      body: 'No account. Choose a language once. Start the emergency.',
    },
    {
      n: '02',
      title: 'Follow one step',
      body: 'DERES asks or instructs. You confirm with voice or buttons. Repeat.',
    },
    {
      n: '03',
      title: 'Hand off',
      body: 'Keep the phone visible. Responders see what is known, unknown, and already done.',
    },
  ],
  statsEyebrow: 'On this platform',
  stats: [
    { value: '3', label: 'Languages on scene', detail: 'English, Amharic, Afaan Oromoo' },
    { value: ambulance, label: 'Ambulance short code', detail: 'Always reachable from the emergency screen' },
    { value: '1', label: 'Published protocol', detail: 'Unresponsive adult — wording is locked' },
    { value: 'Live', label: 'Responder handoff', detail: 'Incidents update as facts are confirmed' },
  ],
  ctaEyebrow: 'Ready when the first minutes start',
  ctaTitle: 'Stay with them. We will guide you.',
  ctaBody:
    'If someone has collapsed, start now. If you are a responder, open the live incident list.',
  footerNote: `DERES (ድረስ) is a voice-first first-aid guide for Ethiopia. It is not a doctor, not a chatbot that invents advice, and not a replacement for ambulance ${ambulance}.`,
} as const;
