/**
 * Task 3 export inventory.
 *
 * If a required symbol is missing from the type graph, `tsc` fails when this
 * file is compiled — Melkamu and Obsan share one checklist instead of
 * discovering drift inside UI or API code.
 */
import type {
  ActionRecord,
  ApiError,
  ApiResponse,
  AuthUser,
  ConversationMessage,
  CreateIncidentRequest,
  EmergencyState,
  GetProtocolResponse,
  Handoff,
  Incident,
  IncidentEvent,
  ListIncidentsResponse,
  Protocol,
  ProtocolStep,
  ProtocolState,
  Session,
  VoiceTurnRequest,
  VoiceTurnResponse,
} from './types/index.js';
import type {
  AsyncStatus,
  ConnectionStatus,
  EmergencyType,
  VoiceSessionPhase,
} from './enums/index.js';
import type { Id, IsoDateTime } from './types/common.js';
import type { Language } from './enums/index.js';

type _Task3Required = {
  Incident: Incident;
  IncidentEvent: IncidentEvent;
  EmergencyState: EmergencyState;
  Protocol: Protocol;
  ProtocolStep: ProtocolStep;
  ProtocolState: ProtocolState;
  ConversationMessage: ConversationMessage;
  ActionRecord: ActionRecord;
  Handoff: Handoff;
  AuthUser: AuthUser;
  Session: Session;
  ApiResponse: ApiResponse<unknown>;
  ApiError: ApiError;
  CreateIncidentRequest: CreateIncidentRequest;
  ListIncidentsResponse: ListIncidentsResponse;
  GetProtocolResponse: GetProtocolResponse;
  VoiceTurnRequest: VoiceTurnRequest;
  VoiceTurnResponse: VoiceTurnResponse;
  EmergencyType: EmergencyType;
  ConnectionStatus: ConnectionStatus;
  AsyncStatus: AsyncStatus;
  VoiceSessionPhase: VoiceSessionPhase;
  /** Factories must keep this signature — see `factories/initialState.ts`. */
  initialEmergencyState: (at: IsoDateTime) => EmergencyState;
  initialIncident: (input: {
    id: Id;
    sessionId: Id;
    language: Language;
    userId?: Id | null;
    at: IsoDateTime;
  }) => Incident;
};

export type Task3ContractInventory = _Task3Required;
