import { EmergencyType, EscalationState, Language, ProtocolStepKind, type Protocol } from '@voicesos/shared';
import { PROTOCOL_CREATED_AT, PROTOCOL_RETRIEVED_AT, eq } from './conditions.js';

/**
 * Burns — timed cooling, not CPR and not folklore dressings.
 *
 * Cool with running water 10–20 minutes. No ice, butter, oil, or toothpaste.
 * Source: IFRC 2020 burns; WHO Prehospital burns protocol.
 */
export const burnsProtocol: Protocol = {
  id: 'protocol-burns',
  name: 'Burns',
  version: '1.0.0',
  emergencyType: EmergencyType.BURN,
  source: {
    organisation: 'IFRC / WHO',
    title: 'Burns: cool with running water 10–20 minutes',
    url: 'https://www.ifrc.org/sites/default/files/2022-02/EN_GFARC_GUIDELINES_2020.pdf',
    edition: 'IFRC Guidelines 2020; WHO Prehospital burns',
    retrievedAt: PROTOCOL_RETRIEVED_AT,
    notes: 'Stopping cooling too early and applying butter or ice are guideline violations.',
  },
  entryConditions: [eq('entry-type', 'emergencyType', EmergencyType.BURN, 'Emergency is a burn')],
  initialStepId: 'step-burn-call-ems',
  steps: [
    {
      id: 'step-burn-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them there is a burn. Put the phone on speaker if you can.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ቃጠሎ እንዳለ ይንገሩ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።',
        [Language.AFAAN_OROMO]:
          "Amma tajaajila balaa tasaatiif bilbili. Gubaan jira himi. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-cool-burn', conditions: [], description: 'Start cooling' }],
      requiresConfirmation: true,
      onUncertain: 'step-cool-burn',
    },
    {
      id: 'step-cool-burn',
      kind: ProtocolStepKind.ACTION,
      label: 'Cool with running water',
      prompt: {
        [Language.ENGLISH]:
          'Cool the burn under cool running water for 10 to 20 minutes. Do not use ice, butter, oil, or toothpaste.',
        [Language.AMHARIC]:
          'ቃጠሎውን ከ10 እስከ 20 ደቂቃ በቀዝቃዛ የሚፈስ ውሃ ያቀዘቅዙ። በረዶ፣ ቅቤ፣ ዘይት ወይም የጥርስ ሳሙና አይጠቀሙ።',
        [Language.AFAAN_OROMO]:
          "Gubaa bishaan qabbanaa'aa yaa'uun daqiiqaa 10 hanga 20tti qabbaneessi. Cabbii, dhadhaa, zayitaa ykn saamunaa ilkaan hin fayyadamin.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-burn-stay', conditions: [], description: 'Keep cooling' }],
      requiresConfirmation: true,
      onUncertain: 'step-burn-stay',
    },
    {
      id: 'step-burn-stay',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay with them',
      prompt: {
        [Language.ENGLISH]:
          'Keep cooling until 10 to 20 minutes are done or help takes over. Stay with them. Follow the operator.',
        [Language.AMHARIC]:
          '10 እስከ 20 ደቂቃ እስኪያልቅ ወይም እርዳታ እስኪረከብ ማቀዝቀዝዎን ይቀጥሉ። ከአጠገባቸው ይቆዩ። የኦፕሬተሩን ይከተሉ።',
        [Language.AFAAN_OROMO]:
          "Hanga daqiiqaan 10–20 xumuramu ykn gargaarsi fudhatutti qabbaneessuu itti fufi. Isaan bira turi. Operaatara hordofi.",
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
      id: 'no-ice-butter',
      prohibitedAction: 'ice, butter, oil, or toothpaste on the burn',
      conditions: [],
      reason: 'Folklore dressings violate burn first-aid guidelines',
    },
    {
      id: 'no-cpr-burn',
      prohibitedAction: 'chest compressions',
      conditions: [],
      reason: 'A burn is cooling with water, not the collapse CPR path',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-burn',
      conditions: [eq('esc-burn', 'emergencyType', EmergencyType.BURN, 'Burn')],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them there is a burn.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ቃጠሎ እንዳለ ይንገሩ።',
        [Language.AFAAN_OROMO]: 'Amma tajaajila balaa tasaatiif bilbili. Gubaan jira himi.',
      },
      reason: 'Burns need ambulance assessment while cooling continues',
    },
  ],
  exitConditions: [],
  languages: [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO],
  published: true,
  createdAt: PROTOCOL_CREATED_AT,
  updatedAt: PROTOCOL_CREATED_AT,
};
