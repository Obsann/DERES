import { EmergencyType, EscalationState, Language, ProtocolStepKind, type Protocol } from '@voicesos/shared';
import { PROTOCOL_CREATED_AT, PROTOCOL_RETRIEVED_AT, eq } from './conditions.js';

/**
 * Severe limb bleeding — skill sequence, not CPR.
 *
 * Direct pressure → pack → tourniquet high and tight. Do not release a
 * tourniquet. Sources: WHO CFAR; TECC active bystander; IFRC 2020 bleeding.
 */
export const severeBleedingProtocol: Protocol = {
  id: 'protocol-severe-bleeding',
  name: 'Severe bleeding',
  version: '1.0.0',
  emergencyType: EmergencyType.SEVERE_BLEEDING,
  source: {
    organisation: 'WHO / TECC / IFRC',
    title: 'Severe bleeding: pressure, packing, tourniquet',
    url: 'https://cdn.who.int/media/docs/default-source/integrated-health-services-%28ihs%29/csy/cfar-pocketguide.pdf',
    edition: 'WHO CFAR; TECC Active Bystanders 2020; IFRC 2020',
    retrievedAt: PROTOCOL_RETRIEVED_AT,
    notes:
      'Tourniquet only for life-threatening limb bleeding after pressure and packing. Place high on the limb, tight enough, over clothes if needed. Never release it. Verbal-only tourniquet teaching is weak — confirm each step.',
  },
  entryConditions: [eq('entry-type', 'emergencyType', EmergencyType.SEVERE_BLEEDING, 'Emergency is severe bleeding')],
  initialStepId: 'step-bleed-call-ems',
  steps: [
    {
      id: 'step-bleed-call-ems',
      kind: ProtocolStepKind.ACTION,
      label: 'Call emergency services',
      prompt: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them there is severe bleeding. Put the phone on speaker if you can.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ከባድ ደም መፍሰስ እንዳለ ይንገሩ። ከቻሉ ስልኩን በድምጽ ማጉያ ላይ ያድርጉት።',
        [Language.AFAAN_OROMO]:
          "Amma tajaajila balaa tasaatiif bilbili. Dhiigni baay'ee dhangala'aa jira himi. Yoo dandeesse, bilbilaa sagalee guddaa irra kaa'i.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-direct-pressure', conditions: [], description: 'Start pressure' }],
      requiresConfirmation: true,
      onUncertain: 'step-direct-pressure',
    },
    {
      id: 'step-direct-pressure',
      kind: ProtocolStepKind.ACTION,
      label: 'Direct pressure',
      prompt: {
        [Language.ENGLISH]: 'Press firmly on the wound with a clean cloth. Keep pressing. Do not lift to look.',
        [Language.AMHARIC]: 'በንጹህ ጨርቅ ቁስሉን በጥብቅ ይጫኑ። መጫንዎን ይቀጥሉ። ለመመልከት አያንሱ።',
        [Language.AFAAN_OROMO]: "Madaa irratti uffata qulqulluu dhiibaa jabaa godhi. Dhiibuu itti fufi. Ilaaluuf hin kaasin.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-pack-wound', conditions: [], description: 'Pack if still bleeding' }],
      requiresConfirmation: true,
      onUncertain: 'step-pack-wound',
    },
    {
      id: 'step-pack-wound',
      kind: ProtocolStepKind.ACTION,
      label: 'Pack the wound',
      prompt: {
        [Language.ENGLISH]:
          'If it is still bleeding heavily, pack cloth firmly into the wound and keep pressing on top.',
        [Language.AMHARIC]: 'አሁንም በብዛት እየፈሰሰ ከሆነ፣ ጨርቁን በቁስሉ ውስጥ በጥብቅ ይሙሉ እና ከላይ መጫንዎን ይቀጥሉ።',
        [Language.AFAAN_OROMO]:
          "Ammallee yoo dhiigni baay'ee dhangala'aa jiraate, uffata madaa keessatti jabeessii guuti, irratti dhiibuu itti fufi.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-tourniquet', conditions: [], description: 'Tourniquet if limb still bleeds' }],
      requiresConfirmation: true,
      onUncertain: 'step-tourniquet',
    },
    {
      id: 'step-tourniquet',
      kind: ProtocolStepKind.ACTION,
      label: 'Tourniquet if needed',
      prompt: {
        [Language.ENGLISH]:
          'If a limb is still bleeding life-threateningly and you have a tourniquet, place it high and tight — close to the body, over clothes if needed. Tighten until bleeding slows. Do not take it off.',
        [Language.AMHARIC]:
          'እጅ ወይም እግር አሁንም ሕይወትን በሚያሰጋ መልኩ እየፈሰሰ ከሆነ እና ቱርኒኬት ካለዎት፣ ከሰውነቱ ቅርብ ከፍ ብሎ በጥብቅ ያድርጉት — አስፈላጊ ከሆነ በልብስ ላይ። ደም መፍሰሱ እስኪቀንስ ድረስ ይጣበቁ። አያውልዱት።',
        [Language.AFAAN_OROMO]:
          "Miilla ykn harka ammallee dhiigni lubbuu balleessu dhangala'aa jiraatee tourniquet yoo qabaatte, olitti fi jabaatti kaa'i — qaamaatti dhihoo, yoo barbaachise uffata irratti. Hanga dhiigni hir'atutti cimsii. Hin fuudhin.",
      },
      entryConditions: [],
      acceptedAnswers: [],
      updatesField: null,
      transitions: [{ toStepId: 'step-bleed-stay', conditions: [], description: 'Stay' }],
      requiresConfirmation: true,
      onUncertain: 'step-bleed-stay',
    },
    {
      id: 'step-bleed-stay',
      kind: ProtocolStepKind.EXIT,
      label: 'Stay with them',
      prompt: {
        [Language.ENGLISH]: 'Keep pressure on. Stay with them. Follow the operator until help takes over.',
        [Language.AMHARIC]: 'መጫንዎን ይቀጥሉ። ከአጠገባቸው ይቆዩ። እርዳታ እስኪረከብ የኦፕሬተሩን ይከተሉ።',
        [Language.AFAAN_OROMO]: 'Dhiibbaa itti fufi. Isaan bira turi. Hanga gargaarsi fudhatutti operaatara hordofi.',
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
      id: 'no-release-tourniquet',
      prohibitedAction: 'release or loosen the tourniquet',
      conditions: [],
      reason: 'A bystander tourniquet must not be released once applied',
    },
    {
      id: 'no-cpr-bleeding',
      prohibitedAction: 'chest compressions',
      conditions: [],
      reason: 'Severe bleeding is pressure, packing, and tourniquet — not the collapse CPR path',
    },
  ],
  escalationRules: [
    {
      id: 'escalate-bleed',
      conditions: [eq('esc-bleed', 'emergencyType', EmergencyType.SEVERE_BLEEDING, 'Severe bleeding')],
      escalateTo: EscalationState.ESCALATED,
      instruction: {
        [Language.ENGLISH]: 'Call emergency services now. Tell them there is severe bleeding.',
        [Language.AMHARIC]: 'አሁኑኑ ወደ ድንገተኛ አገልግሎት ይደውሉ። ከባድ ደም መፍሰስ እንዳለ ይንገሩ።',
        [Language.AFAAN_OROMO]: "Amma tajaajila balaa tasaatiif bilbili. Dhiigni baay'ee dhangala'aa jira himi.",
      },
      reason: 'Life-threatening bleeding needs an ambulance while pressure continues',
    },
  ],
  exitConditions: [],
  languages: [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO],
  published: true,
  createdAt: PROTOCOL_CREATED_AT,
  updatedAt: PROTOCOL_CREATED_AT,
};
