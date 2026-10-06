import { MessageRole, type ConversationMessage } from '@voicesos/shared';

const MAX_TURNS = 8;
const MAX_CHARS = 1200;

/**
 * Successful turns only, as plain text inside the prompt.
 *
 * A provider history field can be accepted and then ignored. Capping keeps a
 * long incident from crowding out the current utterance.
 */
export function formatHistory(messages: Pick<ConversationMessage, 'role' | 'transcript'>[]): string {
  const lines = messages
    .filter((message) => message.transcript.trim() !== '' && !message.transcript.startsWith('[button]'))
    .slice(-MAX_TURNS)
    .map((message) => {
      const who = message.role === MessageRole.USER ? 'Person' : 'DERES';
      return `${who}: ${message.transcript.replace(/\s+/g, ' ').trim()}`;
    });

  while (lines.join('\n').length > MAX_CHARS && lines.length > 1) {
    lines.shift();
  }
  return lines.join('\n');
}
