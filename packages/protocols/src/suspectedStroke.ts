import {
  ConditionOperator,
  EmergencyType,
  EscalationState,
  Language,
  ProtocolStepKind,
  type Protocol,
  type ProtocolCondition,
} from '@voicesos/shared';

const RETRIEVED_AT = '2026-10-07T00:00:00.000Z';
const CREATED_AT = '2026-10-07T00:00:00.000Z';

function eq(id: string, field: string, value: string, description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.EQUALS, value };
}

/**
 * Suspected stroke — recognition and rapid transport, not CPR.
 *
 * Observational FAST questions (face, arm, speech) plus an immediate ambulance
 * call. Delay is the failure mode. Nothing by mouth. No aspirin, food, or drink.
 *
 * Sources: ILCOR/IFRC first-aid stroke recognition (FAST); WHO CFAR / WHO
 * Prehospital “weakness / suspected stroke” bystander actions as mapped by the
 * team. Prompts are observational only — no physical maneuvers.
 */
export const suspectedStrokeProtocol: Protocol = {
  id: 'protocol-suspected-stroke',
  name: 'Suspected stroke',
  version: '1.0.0',
  emergencyType: EmergencyType.SUSPECTED_STROKE,
  source: {
    organisation: 'ILCOR / IFRC / WHO',
    title: 'FAST stroke recognition and immediate ambulance call (first-aid / CFAR)',
    url: 'https://cdn.who.int/media/docs/default-source/integrated-health-services-%28ihs%29/csy/cfar-pocketguide.pdf',
    edition: 'IFRC 2020; WHO CFAR; ILCOR CoSTR first aid',
    retrievedAt: RETRIEVED_AT,
    notes:
      'Call first so transport is not delayed, then FAST items for the handoff picture. Do not give food, drink, or aspirin. Amharic and Afaan Oromoo prompts are drafts pending native-speaker review (docs/ux/translation-review.md). FAST accuracy numbers stay in docs/research until the systematic review PDF is opened locally.',
  },
  entryConditions: [
    eq('entry-type', 'emergencyType', EmergencyType.SUSPECTED_STROKE, 'Emergency is a possible stroke'),
  ],
  initialStepId: 'step-stroke-call-ems',
  steps: [
    {
      id: 'step-stroke-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them this may be a stroke. Put the phone on speaker if you can.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ይህ የደም ሥር መዘጋት ሊሆን እንደሚችል ይንገሩ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።',
        [Language.AFAAN_OROMO]:
          "Amma tajaajila balaa tasaatiif bilbili. Kun shubbisa ta'uu danda'a himi. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-fast-face',
          conditions: [],
          description: 'After help is called, check the face',
        },
      ],
      requiresConfirmation: true,
      onUncertain: 'step-fast-face',
    },
    {
      id: 'step-fast-face',
      kind: ProtocolStepKind.QUESTION,
      label: 'FAST face',
      prompt: {
        [Language.ENGLISH]: 'Look at their face. Can they smile with both sides of the face?',
        [Language.AMHARIC]: 'ፊታቸውን ይመልከቱ። በሁለቱም የፊት ጎኖች ሊያፈገግጉ ይችላሉ?',
        [Language.AFAAN_OROMO]: "Fuula isaanii ilaali. Gama lamaan fuulaa kolfuu danda'u?",
      },
      entryConditions: [],
      acceptedAnswers: ['yes', 'no'],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-fast-arms',
          conditions: [],
          description: 'Next FAST item: arms',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-fast-arms',
    },
    {
      id: 'step-fast-arms',
      kind: ProtocolStepKind.QUESTION,
      label: 'FAST arms',
      prompt: {
        [Language.ENGLISH]: 'Can they raise both arms and keep them up?',
        [Language.AMHARIC]: 'ሁለቱንም ክንዶች ከፍ አድርገው ማቆየት ይችላሉ?',
        [Language.AFAAN_OROMO]: "Harka lamaan ol kaasaniin ol qabuu danda'u?",
      },
      entryConditions: [],
      acceptedAnswers: ['yes', 'no'],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-fast-speech',
          conditions: [],
          description: 'Next FAST item: speech',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-fast-speech',
    },
    {
      id: 'step-fast-speech',
      kind: ProtocolStepKind.QUESTION,
      label: 'FAST speech',
      prompt: {
        [Language.ENGLISH]: 'Can they say a simple sentence clearly?',
        [Language.AMHARIC]: 'ቀላል ዓረፍተ ነገር በግልጽ መናገር ይችላሉ?',
        [Language.AFAAN_OROMO]: "Himannaa salphaa ifatti dubbachuu danda'u?",
      },
      entryConditions: [],
      acceptedAnswers: ['yes', 'no'],
      updatesField: null,
      transitions: [
        {
          toStepId: 'step-stroke-stay',
          conditions: [],
          description: 'Stay until help takes over',
        },
      ],
      requiresConfirmation: false,
      onUncertain: 'step-stroke-stay',
    },
    {
      id: 'step-stroke-stay',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay with them',
      prompt: {
        [Language.ENGLISH]:
          'Stay with them. Give nothing by mouth — no food, drink, or aspirin. Follow the operator until help takes over.',
        [Language.AMHARIC]:
          'ከአጠገባቸው ይቆዩ። በአፍ ምንም አይስጡ — ምግብ፣ መጠጥ ወይም አስፕሪን አይደለም። እርዳታ እስኪረከብ የኦፕሬተሩን ይከተሉ።',
        [Language.AFAAN_OROMO]:
          "Isaan bira turi. Afaan keessaa waan tokkollee hin kennin — nyaata, dhugaatii ykn aspiiriin hin kennin. Hanga gargaarsi fudhatutti operaatara hordofi.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: null, conditions: [], description: 'Handoff' }],
      requiresConfirmation: false,
      onUncertain: null,
    },
  ],
  contraindications: [
    {
      id: 'no-oral-stroke',
      prohibitedAction: 'food, drink, or aspirin by mouth',
      conditions: [],
      reason: 'Nothing by mouth if stroke is possible',
    },
    {
      id: 'no-delay-stroke',
      prohibitedAction: 'wait and see, or delay the ambulance',
      conditions: [],
      reason: 'Delay of transport is the failure mode in stroke',
    },
    {
      id: 'no-cpr-stroke',
      prohibitedAction: 'chest compressions',
      conditions: [],
      reason: 'A possible stroke is not the unresponsive-adult CPR path',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-stroke',
      conditions: [
        eq('esc-stroke', 'emergencyType', EmergencyType.SUSPECTED_STROKE, 'Possible stroke'),
      ],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them this may be a stroke.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ይህ የደም ሥር መዘጋት ሊሆን እንደሚችል ይንገሩ።',
        [Language.AFAAN_OROMO]: "Amma tajaajila balaa tasaatiif bilbili. Kun shubbisa ta'uu danda'a himi.",
      },
      reason: 'Suspected stroke needs immediate ambulance transport',
    },
  ],
  exitConditions: [],
  languages: [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO],
  published: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};
