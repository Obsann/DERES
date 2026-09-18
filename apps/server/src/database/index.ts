export { connectDatabase, disconnectDatabase, getDatabaseHealth, isDatabaseConnected } from './connection.js';
export { createId, nowIso } from './ids.js';
export { initialEmergencyState, initialIncident } from './initialState.js';
export {
  appendIncidentEvent,
  createIncident,
  getIncidentById,
  getLatestHandoff,
  getProtocolById,
  getSessionById,
  getUserById,
  insertConversationMessage,
  insertHandoff,
  insertProtocol,
  insertSession,
  insertUser,
  listConversationMessages,
  listIncidentEvents,
} from './persist.js';
