import { EmergencyType, EscalationState, Language, ProtocolStepKind, type Protocol } from '@voicesos/shared';
import { PROTOCOL_CREATED_AT, PROTOCOL_RETRIEVED_AT, eq } from './conditions.js';

/**
 * Road-traffic / trauma — do not make it worse.
 *
 * Call ambulance. Do not move a person who may have a spine injury. Do not
 * pull out impaled objects. Not the collapse CPR path unless they later
 * become unresponsive (operator / collapse protocol).
 *
 * Source: WHO CFAR ABCDE / spine immobilisation; WHO Prehospital injured patient.
 */
export const traumaticInjuryProtocol: Protocol = {
  id: 'protocol-traumatic-injury',
  name: 'Crash or injury',
  version: '1.0.0',
  emergencyType: EmergencyType.TRAUMATIC_INJURY,
  source: {
    organisation: 'WHO',
    title: 'Injured patient: do not move, do not remove impaled objects',
    url: 'https://cdn.who.int/media/docs/default-source/integrated-health-services-%28ihs%29/csy/cfar-pocketguide.pdf',
    edition: 'WHO CFAR; WHO Prehospital injured-patient protocol',
    retrievedAt: PROTOCOL_RETRIEVED_AT,
    notes:
      'Bystander first minute is assessment and not making it worse — not a full ABCDE course. If they collapse and stop breathing, that is a different protocol.',
  },
  entryConditions: [
    eq('entry-type', 'emergencyType', EmergencyType.TRAUMATIC_INJURY, 'Emergency is a crash or injury'),
  ],
  initialStepId: 'step-trauma-call-ems',
  steps: [
    {
      id: 'step-trauma-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them this is a crash or injury. Put the phone on speaker if you can.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ይህ አደጋ ወይም ጉዳት መሆኑን ይንገሩ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።',
        [Language.AFAAN_OROMO]:
          "Amma tajaajila balaa tasaatiif bilbili. Kun balaa konkolaataa ykn miidhaa ta'uu himi. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-dont-move', conditions: [], description: 'Spine precaution' }],
      requiresConfirmation: true,
      onUncertain: 'step-dont-move',
    },
    {
      id: 'step-dont-move',
      kind: ProtocolStepKind.ACTION,
      label: 'Do not move them',
      prompt: {
        [Language.ENGLISH]:
          'Do not move them unless they are in immediate danger — fire or traffic. Keep their head and neck still.',
        [Language.AMHARIC]:
          'በእሳት ወይም በትራፊክ አስቸኳይ አደጋ ካልሆነ በስተቀር አያንቀሳቅሷቸው። ጭንቅላታቸውን እና አንገታቸውን እንዲረጋ ይጠብቁ።',
        [Language.AFAAN_OROMO]:
          'Yoo ibida ykn tiraafika irraa balaa hatattamaa keessa hin jirre malee hin sochosiin. Mataa fi morma isaanii tasgabbii qabaachisi.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-dont-remove', conditions: [], description: 'Leave impaled objects' }],
      requiresConfirmation: true,
      onUncertain: 'step-dont-remove',
    },
    {
      id: 'step-dont-remove',
      kind: ProtocolStepKind.ACTION,
      label: 'Do not pull objects out',
      prompt: {
        [Language.ENGLISH]: 'Do not pull out objects that are stuck in the body. Keep them still. Stay with them.',
        [Language.AMHARIC]: 'በሰውነት ውስጥ የተሰካ ነገር አይጎትቱ። እንዲረጉ ይጠብቋቸው። ከአጠገባቸው ይቆዩ።',
        [Language.AFAAN_OROMO]: "Waan qaama keessatti cichaa jiru hin harkisin. Tasgabbii isaanii eegi. Isaan bira turi.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-trauma-stay', conditions: [], description: 'Stay' }],
      requiresConfirmation: true,
      onUncertain: 'step-trauma-stay',
    },
    {
      id: 'step-trauma-stay',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay with them',
      prompt: {
        [Language.ENGLISH]:
          'Stay with them. Follow the operator. If they stop responding, tell the operator immediately.',
        [Language.AMHARIC]: 'ከአጠገባቸው ይቆዩ። የኦፕሬተሩን ይከተሉ። ምላሽ መስጠት ካቆሙ ወዲያውኑ ለኦፕሬተሩ ይንገሩ።',
        [Language.AFAAN_OROMO]:
          'Isaan bira turi. Operaatara hordofi. Yoo deebii kennuu dhaaban, hatattamaan operaatarichatti himi.',
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
      id: 'no-move-spine',
      prohibitedAction: 'move a person with a possible spine injury',
      conditions: [],
      reason: 'Moving a suspected spine injury can make the injury worse',
    },
    {
      id: 'no-remove-impaled',
      prohibitedAction: 'remove an impaled object',
      conditions: [],
      reason: 'Impaled objects should stay in place until professionals take over',
    },
    {
      id: 'no-cpr-trauma-default',
      prohibitedAction: 'chest compressions',
      conditions: [],
      reason: 'A crash is not the collapse protocol unless they later become unresponsive',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-trauma',
      conditions: [eq('esc-trauma', 'emergencyType', EmergencyType.TRAUMATIC_INJURY, 'Crash or injury')],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them this is a crash or injury.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ይህ አደጋ ወይም ጉዳት መሆኑን ይንገሩ።',
        [Language.AFAAN_OROMO]: "Amma tajaajila balaa tasaatiif bilbili. Kun balaa konkolaataa ykn miidhaa ta'uu himi.",
      },
      reason: 'Trauma needs ambulance transport; the bystander must not make the injury worse',
    },
  ],
  exitConditions: [],
  languages: [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO],
  published: true,
  createdAt: PROTOCOL_CREATED_AT,
  updatedAt: PROTOCOL_CREATED_AT,
};
