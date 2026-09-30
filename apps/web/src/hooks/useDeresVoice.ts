import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  VoiceSessionPhase,
  type Id,
  type Language,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { bindDeresSession, getVoxideClient, voxidePhase } from '@/services/voice/voxide';

const noop = () => () => undefined;

/**
 * Voice session for the active emergency screen (Task 21).
 *
 * `available` is false when no Voxide key is configured or the browser has no
 * mic; the session screen must then run on its buttons alone.
 */
export function useDeresVoice(incidentId: Id | null, language: Language) {
  const voxide = getVoxideClient();
  const [lastTurn, setLastTurn] = useState<VoiceTurnResponse | null>(null);
  const instructionRef = useRef<string | null>(null);

  useEffect(() => {
    instructionRef.current = lastTurn?.reply ?? null;
  }, [lastTurn]);

  const snapshot = useSyncExternalStore(
    voxide ? voxide.subscribe.bind(voxide) : noop,
    () => (voxide ? voxide.getSnapshot() : null),
  );

  useEffect(() => {
    if (!voxide || !incidentId) return;
    bindDeresSession(voxide, {
      incidentId,
      language,
      onTurn: setLastTurn,
      getCurrentInstruction: () => instructionRef.current,
    });
    return () => voxide.disconnect();
  }, [voxide, incidentId, language]);

  const connect = useCallback(async () => {
    if (!voxide) return;
    await voxide.init();
    await voxide.connect();
  }, [voxide]);

  const disconnect = useCallback(() => voxide?.disconnect(), [voxide]);

  const phase =
    lastTurn?.failure != null
      ? VoiceSessionPhase.ERROR
      : snapshot
        ? snapshot.status === 'listening' && lastTurn?.phase === VoiceSessionPhase.AWAITING_CONFIRMATION
          ? VoiceSessionPhase.AWAITING_CONFIRMATION
          : voxidePhase(snapshot.status)
        : VoiceSessionPhase.IDLE;

  return {
    available: voxide !== null && typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices),
    phase,
    lastTurn,
    messages: snapshot?.messages ?? [],
    errorCode: snapshot?.errorCode ?? null,
    connect,
    disconnect,
  };
}
