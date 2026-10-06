import { describe, expect, it } from 'vitest';
import { MessageRole } from '@voicesos/shared';
import { formatHistory } from './history.js';
import { prepareSpokenLine } from './spoken.js';

describe('spoken line', () => {
  it('strips a bracketed spelling and leaves the sentence', () => {
    expect(prepareSpokenLine('Call [nine oh seven] now.')).toBe('Call now.');
  });
});

describe('history', () => {
  it('keeps the person and DERES lines and drops button presses', () => {
    expect(
      formatHistory([
        { role: MessageRole.USER, transcript: '[button] Yes' },
        { role: MessageRole.USER, transcript: 'He collapsed' },
        { role: MessageRole.ASSISTANT, transcript: 'Call emergency services now.' },
      ]),
    ).toBe('Person: He collapsed\nDERES: Call emergency services now.');
  });
});
