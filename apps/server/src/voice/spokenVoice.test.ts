import { describe, expect, it } from 'vitest';
import { Language } from '@voicesos/shared';
import { UpstreamUnavailableError } from '../common/errors.js';
import { spokenVoiceFor, synthesizeSpokenLine } from './spokenVoice.js';

describe('spoken voice', () => {
  it('has a real Amharic voice and refuses to fake Afaan Oromoo or English', () => {
    expect(spokenVoiceFor(Language.AMHARIC)).toBe('am-ET-MekdesNeural');
    expect(spokenVoiceFor(Language.AFAAN_OROMO)).toBeNull();
    expect(spokenVoiceFor(Language.ENGLISH)).toBeNull();
  });

  it('does not call out for English or Afaan Oromoo', async () => {
    await expect(synthesizeSpokenLine('hello', Language.ENGLISH)).rejects.toBeInstanceOf(UpstreamUnavailableError);
    await expect(synthesizeSpokenLine("Waan argitu natti himi.", Language.AFAAN_OROMO)).rejects.toBeInstanceOf(
      UpstreamUnavailableError,
    );
  });
});
