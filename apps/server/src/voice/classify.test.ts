import { describe, expect, it } from 'vitest';
import { classifyVoiceTurn, VoiceFailure, VOICE_PHRASES } from './classify.js';

describe('voice turn classification', () => {
  it('processes a natural utterance', () => {
    const result = classifyVoiceTurn({
      transcript: 'My friend collapsed and he is not responding',
      recognitionConfidence: 0.91,
    });
    expect(result).toEqual({
      action: 'process',
      transcript: 'My friend collapsed and he is not responding',
      confidence: 0.91,
    });
  });

  it('rejects silence, timeouts and failed recognition without changing meaning', () => {
    expect(classifyVoiceTurn({ silence: true, transcript: '' }).action).toBe('reject');
    expect(classifyVoiceTurn({ timeout: true }).action).toBe('reject');
    expect(classifyVoiceTurn({ recognitionFailed: true, transcript: '???' }).action).toBe('reject');
    const silence = classifyVoiceTurn({ transcript: '   ' });
    expect(silence).toMatchObject({ action: 'reject', failure: VoiceFailure.SILENCE, reply: VOICE_PHRASES.silence });
  });

  it('asks again when recognition confidence is too low', () => {
    const result = classifyVoiceTurn({ transcript: 'not sure what this was', recognitionConfidence: 0.2 });
    expect(result).toMatchObject({ action: 'reject', failure: VoiceFailure.RECOGNITION });
  });

  it('treats a repeat request as a replay, not a new fact', () => {
    expect(classifyVoiceTurn({ transcript: 'say that again' }).action).toBe('repeat');
    expect(classifyVoiceTurn({ transcript: 'Repeat' }).action).toBe('repeat');
  });
});
