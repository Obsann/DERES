import { Language } from '@voicesos/shared';
import { EdgeTTS } from 'edge-tts-universal';
import { UpstreamUnavailableError } from '../common/errors.js';
import type { VoxideSynthesizeResult } from './provider.js';

/**
 * Voices that can say a DERES line out loud on the server.
 *
 * Amharic has a neural Geʽez voice. Afaan Oromoo has none here — do not fake
 * it with an English multilingual voice (it misreads the words). English and
 * Afaan Oromoo are spoken by Voxide in the browser instead.
 */
const VOICE: Partial<Record<Language, string>> = {
  [Language.AMHARIC]: 'am-ET-MekdesNeural',
};

export function spokenVoiceFor(language: Language): string | null {
  return VOICE[language] ?? null;
}

/** Audio for one protocol or prompt line. Throws when this language has no voice. */
export async function synthesizeSpokenLine(text: string, language: Language): Promise<VoxideSynthesizeResult> {
  const voice = spokenVoiceFor(language);
  if (!voice || text.trim() === '') throw new UpstreamUnavailableError('Speech synthesis');

  try {
    const spoken = new EdgeTTS(text, voice);
    const result = await spoken.synthesize();
    const bytes = Buffer.from(await result.audio.arrayBuffer());
    if (bytes.length < 64) throw new UpstreamUnavailableError('Speech synthesis');
    return { audioBase64: bytes.toString('base64'), contentType: 'audio/mpeg' };
  } catch (error) {
    if (error instanceof UpstreamUnavailableError) throw error;
    throw new UpstreamUnavailableError('Speech synthesis', { cause: error });
  }
}
