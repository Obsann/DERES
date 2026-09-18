import { ConversationMessageModel } from './conversationMessage.js';
import { HandoffModel } from './handoff.js';
import { IncidentModel } from './incident.js';
import { IncidentEventModel } from './incidentEvent.js';
import { ProtocolModel } from './protocol.js';
import { SessionModel } from './session.js';
import { UserModel } from './user.js';

const models = [
  IncidentModel,
  IncidentEventModel,
  ConversationMessageModel,
  ProtocolModel,
  SessionModel,
  HandoffModel,
  UserModel,
];

/** Creates or updates indexes declared on the schemas. Safe to run on every boot. */
export async function syncIndexes(): Promise<void> {
  await Promise.all(models.map((model) => model.syncIndexes()));
}

export { ConversationMessageModel } from './conversationMessage.js';
export { HandoffModel } from './handoff.js';
export { IncidentModel, toIncident } from './incident.js';
export { IncidentEventModel, toIncidentEvent } from './incidentEvent.js';
export { ProtocolModel, toProtocol } from './protocol.js';
export { SessionModel, toSession } from './session.js';
export { UserModel, toAuthUser } from './user.js';
export { toConversationMessage } from './conversationMessage.js';
export { toHandoff } from './handoff.js';
