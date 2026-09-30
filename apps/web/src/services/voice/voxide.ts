import { VoxideClient, type VoxideStatus } from '@voxide/react/core';
import {
  Language,
  VoiceSessionPhase,
  type Id,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { emergencyCallHref } from '@/config/emergency';
import { incidentsApi } from '@/services/api';

/** BCP-47 tags Voxide (Gemini Live) uses for speech in each DERES language. */
export const VOXIDE_LANGUAGE: Record<Language, string> = {
  [Language.ENGLISH]: 'en-US',
  [Language.AMHARIC]: 'am-ET',
  [Language.AFAAN_OROMO]: 'om-ET',
};

let client: VoxideClient | null | undefined;

/** One client per page load; null when no publishable key is configured. */
export function getVoxideClient(): VoxideClient | null {
  if (client !== undefined) return client;
  const publicKey = import.meta.env.VITE_VOXIDE_PUBLIC_KEY?.trim();
  client = publicKey ? new VoxideClient({ publicKey }) : null;
  return client;
}

export interface DeresVoiceBinding {
  incidentId: Id;
  language: Language;
  onTurn: (turn: VoiceTurnResponse) => void;
  getCurrentInstruction: () => string | null;
}

/**
 * Connects the Voxide agent to the DERES protocol engine.
 *
 * Voxide hears and speaks; it never decides what to say. Every utterance goes
 * to the server, and the agent is told to read back `sayExactly` word for
 * word. The dashboard agent prompt (docs/voice/voxide-setup.md) repeats this.
 */
export function bindDeresSession(voxide: VoxideClient, binding: DeresVoiceBinding): void {
  const speechLanguage = VOXIDE_LANGUAGE[binding.language];
  voxide.setLanguage(speechLanguage);
  voxide.enableMultilingual({ mode: 'strict', supported: [speechLanguage] });

  voxide.register({
    reportToDeres: {
      description:
        'Call this for EVERYTHING the user says during the emergency: answers, observations, "done", "I can\'t", "repeat", or questions. Pass their exact words. Then speak the returned sayExactly text word for word and nothing else.',
      params: {
        utterance: {
          type: 'string',
          required: true,
          description: "The user's exact words, in the language they spoke.",
        },
      },
      handler: async ({ utterance }: Record<string, unknown>) => {
        const turn = await incidentsApi.voiceTurn(binding.incidentId, {
          transcript: typeof utterance === 'string' ? utterance : '',
          language: binding.language,
        });
        binding.onTurn(turn);
        return { sayExactly: turn.reply, language: speechLanguage };
      },
    },
    callEmergencyServices: {
      description: 'Open the phone dialer to call the ambulance when the user asks to call for help.',
      requireConfirmation: true,
      handler: () => {
        window.location.href = emergencyCallHref;
        return { status: 'dialer_opened' };
      },
    },
  });

  voxide.bindState(() => ({
    app: 'DERES emergency first-aid guidance',
    language: speechLanguage,
    currentInstruction: binding.getCurrentInstruction(),
    rule: 'Never give medical advice of your own. Only speak text returned by reportToDeres.',
  }));
}

export function voxidePhase(status: VoxideStatus): VoiceSessionPhase {
  switch (status) {
    case 'listening':
      return VoiceSessionPhase.LISTENING;
    case 'thinking':
    case 'executing':
    case 'connecting':
      return VoiceSessionPhase.PROCESSING;
    case 'speaking':
      return VoiceSessionPhase.SPEAKING;
    case 'error':
      return VoiceSessionPhase.ERROR;
    case 'idle':
    case 'armed':
    default:
      return VoiceSessionPhase.IDLE;
  }
}
