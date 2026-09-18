import type { Language, MessageRole } from '../enums/index.js';
import type { Id, IsoDateTime } from './common.js';

/**
 * One turn of the voice conversation, stored as text.
 *
 * Only the transcript is persisted, never the audio (specification section 18,
 * data minimisation).
 */
export interface ConversationMessage {
  id: Id;
  incidentId: Id;
  role: MessageRole;
  transcript: string;
  language: Language;
  /**
   * Speech-recognition confidence from 0 to 1, or null when the message did
   * not come from speech. Low confidence should trigger a clarification
   * question rather than a state change.
   */
  recognitionConfidence: number | null;
  createdAt: IsoDateTime;
}
