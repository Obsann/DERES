import { describe, expect, it } from 'vitest';
import { ValidationError } from '../common/errors.js';
import { parseAddMessage, parseCreateIncident, parseRecordAction, parseUpdateIncident } from './parseRequest.js';

describe('incident request parsing', () => {
  it('accepts a valid create body and rejects a bad language', () => {
    expect(parseCreateIncident({ language: 'en' }).language).toBe('en');
    expect(() => parseCreateIncident({ language: 'xx' })).toThrow(ValidationError);
  });

  it('requires at least one PATCH field', () => {
    expect(() => parseUpdateIncident({})).toThrow(ValidationError);
    expect(parseUpdateIncident({ status: 'closed' }).status).toBe('closed');
  });

  it('rejects marking an action as given from the client', () => {
    expect(() => parseRecordAction({ actionId: 'a1', status: 'given' })).toThrow(ValidationError);
    expect(parseRecordAction({ actionId: 'a1', status: 'confirmed' }).status).toBe('confirmed');
  });

  it('requires a transcript on messages', () => {
    expect(() => parseAddMessage({ role: 'user', language: 'en', transcript: '   ' })).toThrow(ValidationError);
  });
});
