/** Spoken scene code: no 0/O/1/I/L so a bystander can read it aloud to 907. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const ACCESS_CODE_LENGTH = 4;

export function generateAccessCode(length = ACCESS_CODE_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

export function normalizeAccessCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
