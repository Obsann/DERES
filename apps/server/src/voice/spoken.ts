/**
 * A voice will read bracketed spellings letter by letter in the middle of a
 * sentence. Strip them before anything is spoken. The protocol text has none;
 * this catches a line that picked one up.
 */
export function prepareSpokenLine(text: string): string {
  return text
    .replace(/\s*\[[^\]\n]{0,80}\]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
