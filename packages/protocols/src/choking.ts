import {
  AgeGroup,
  EmergencyType,
  EscalationState,
  Language,
  ProtocolStepKind,
  type Protocol,
} from '@voicesos/shared';
import { PROTOCOL_CREATED_AT, PROTOCOL_RETRIEVED_AT, adultOrUnknownAge, eq, inValues } from './conditions.js';

/**
 * Severe choking — physical sequence, not CPR and not FAST.
 *
 * 5 back blows, then 5 abdominal thrusts, then repeat. No blind finger sweeps.
 * Source: WHO Prehospital choking algorithm / IFRC 2020 first aid as mapped
 * for DERES. Infants/children are out of this adult sequence.
 */
export const chokingProtocol: Protocol = {
  id: 'protocol-choking',
  name: 'Choking',
  version: '1.0.0',
  emergencyType: EmergencyType.CHOKING,
  source: {
    organisation: 'WHO / IFRC',
    title: 'Choking: back blows then abdominal thrusts (first aid)',
    url: 'https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/prehospital-rotocols.pdf',
    edition: 'WHO Prehospital protocols; IFRC Guidelines 2020',
    retrievedAt: PROTOCOL_RETRIEVED_AT,
    notes:
      'Adult sequence only. Do not reverse the order. Do not sweep fingers blindly in the mouth. If they become unresponsive, that is a different protocol (collapse).',
  },
  entryConditions: [
    eq('entry-type', 'emergencyType', EmergencyType.CHOKING, 'Emergency is choking'),
    adultOrUnknownAge('entry-age'),
  ],
  initialStepId: 'step-choke-call-ems',
  steps: [
    {
      id: 'step-choke-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them the person is choking. Put the phone on speaker if you can.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ሰውዬው እየታነቀ መሆኑን ይንገሩ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።',
        [Language.AFAAN_OROMO]:
          "Amma tajaajila balaa tasaatiif bilbili. Namni qoonqoo keessa qabeera himi. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-back-blows', conditions: [], description: 'Start back blows' }],
      requiresConfirmation: true,
      onUncertain: 'step-back-blows',
    },
    {
      id: 'step-back-blows',
      kind: ProtocolStepKind.ACTION,
      label: 'Five back blows',
      prompt: {
        [Language.ENGLISH]:
          'Bend them forward. Give 5 firm blows between the shoulder blades with the heel of your hand.',
        [Language.AMHARIC]: 'ወደ ፊት አዘንብሏቸው። በትከሻ ምላሾቻቸው መካከል በእጅዎ ጫፍ 5 ጠንካራ ግርፋት ይስጡ።',
        [Language.AFAAN_OROMO]:
          'Gara fuulduraatti gad qabi. Gateettii isaanii gidduutti harka kee duuba 5 dhiibbaa jabaa kenni.',
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-abdominal-thrusts', conditions: [], description: 'Then abdominal thrusts' }],
      requiresConfirmation: true,
      onUncertain: 'step-abdominal-thrusts',
    },
    {
      id: 'step-abdominal-thrusts',
      kind: ProtocolStepKind.ACTION,
      label: 'Five abdominal thrusts',
      prompt: {
        [Language.ENGLISH]:
          'If it has not come out, stand behind them. Give 5 inward and upward thrusts just above the navel.',
        [Language.AMHARIC]: 'ካልወጣ፣ ከኋላቸው ይቁሙ። ከእምብርት በላይ ወደ ውስጥ እና ወደ ላይ 5 ግፊት ይስጡ።',
        [Language.AFAAN_OROMO]:
          "Yoo hin baane, duuba isaanii dhaabadhu. Garaa irraa olitti gara keessaa fi ol 5 dhiibbi.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-choke-repeat', conditions: [], description: 'Repeat until clear' }],
      requiresConfirmation: true,
      onUncertain: 'step-choke-repeat',
    },
    {
      id: 'step-choke-repeat',
      kind: ProtocolStepKind.ACTION,
      label: 'Repeat until it comes out',
      prompt: {
        [Language.ENGLISH]:
          'If it still has not come out, repeat 5 back blows then 5 abdominal thrusts until it comes out or help takes over. Do not put your fingers blindly in their mouth.',
        [Language.AMHARIC]:
          'አሁንም ካልወጣ፣ 5 የጀርባ ግርፋት ከዚያ 5 የሆድ ግፊት እስኪወጣ ወይም እርዳታ እስኪረከብ ይድገሙ። ጣቶችዎን በዓይነ ስውር በአፋቸው ውስጥ አያስገቡ።',
        [Language.AFAAN_OROMO]:
          "Ammallee yoo hin baane, dhiibbaa dugdaa 5 sana booda dhiibbaa garaa 5 irra deebi'i hanga bahu ykn gargaarsi fudhatutti. Quba kee afaan isaanii keessatti hin seensisin.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-choke-stay', conditions: [], description: 'Stay' }],
      requiresConfirmation: true,
      onUncertain: 'step-choke-stay',
    },
    {
      id: 'step-choke-stay',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay with them',
      prompt: {
        [Language.ENGLISH]: 'Stay with them. If they become unresponsive, tell the operator. Follow their instructions.',
        [Language.AMHARIC]: 'ከአጠገባቸው ይቆዩ። ምላሽ ማጣት ከጀመሩ ለኦፕሬተሩ ይንገሩ። መመሪያቸውን ይከተሉ።',
        [Language.AFAAN_OROMO]:
          "Isaan bira turi. Yoo deebii kennuu dhaaban, operaatarichatti himi. Qajeelfama isaanii hordofi.",
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
      id: 'no-finger-sweep',
      prohibitedAction: 'blind finger sweep in the mouth',
      conditions: [],
      reason: 'Blind finger sweeps can push the blockage deeper',
    },
    {
      id: 'no-cpr-while-choking-responsive',
      prohibitedAction: 'chest compressions',
      conditions: [],
      reason: 'Responsive choking is back blows and abdominal thrusts, not the collapse CPR path',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-choke',
      conditions: [eq('esc-choke', 'emergencyType', EmergencyType.CHOKING, 'Choking')],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them the person is choking.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ሰውዬው እየታነቀ መሆኑን ይንገሩ።',
        [Language.AFAAN_OROMO]: 'Amma tajaajila balaa tasaatiif bilbili. Namni qoonqoo keessa qabeera himi.',
      },
      reason: 'Severe choking needs an ambulance while maneuvers continue',
    },
    {
      id: 'escalate-choke-child',
      conditions: [
        inValues('esc-choke-child', 'patient.ageGroup', [AgeGroup.INFANT, AgeGroup.CHILD], 'Not an adult'),
      ],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'This choking sequence is for adults. Call emergency services and follow their instructions.',
        [Language.AMHARIC]: 'ይህ የመታነቅ ቅደም ተከተል ለአዋቂዎች ነው። ወደ ድንገተኛ አገልግሎት ደውለው መመሪያቸውን ይከተሉ።',
        [Language.AFAAN_OROMO]:
          "Tartiibni qoonqoo kun kan ga'eessotaati. Tajaajila balaa tasaatiif bilbiliitii qajeelfama isaanii hordofi.",
      },
      reason: 'Infant and child choking maneuvers differ from this adult sequence',
    },
  ],
  exitConditions: [],
  languages: [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO],
  published: true,
  createdAt: PROTOCOL_CREATED_AT,
  updatedAt: PROTOCOL_CREATED_AT,
};
