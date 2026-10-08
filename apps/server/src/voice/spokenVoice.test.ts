import { describe, expect, it } from 'vitest';
import { Language } from '@voicesos/shared';
import { UpstreamUnavailableError } from '../common/errors.js';
import { spokenVoiceFor, synthesizeSpokenLine } from './spokenVoice.js';

describe('spoken voice', () => {
  it('keeps a separate voice for English and Amharic and refuses to fake Afaan Oromoo', () => {
    expect(spokenVoiceFor(Language.ENGLISH)).toBe('en-US-AriaNeural');
    expect(spokenVoiceFor(Language.AMHARIC)).toBe('am-ET-MekdesNeural');
    expect(spokenVoiceFor(Language.AFAAN_OROMO)).toBeNull();
  });

  it('does not call out for Afaan Oromoo', async () => {
    await expect(synthesizeSpokenLine("Waan argitu natti himi.", Language.AFAAN_OROMO)).rejects.toBeInstanceOf(
      UpstreamUnavailableError,
    );
  });
});
