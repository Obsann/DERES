import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Language,
  VoiceSessionPhase,
  type Id,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { emergencyCallHref } from '@/config/emergency';
import { incidentsApi } from '@/services/api';
import { voiceLoopCopy } from '@/services/voice/loopCopy';
import { canRecord, record, RecorderError } from '@/services/voice/recorder';
import { getSpeechStatus, prefetchSpokenLines, speak, stopSpeaking, type SpeechStatus } from '@/services/voice/speech';
import { bindDeresSession, getVoxideClient, voxidePhase } from '@/services/voice/voxide';
import { isLocalIncidentId } from '@/services/protocol/localIncident';
import { listenCapability, CapabilityStatus } from '@/services/capability';

const noop = () => () => undefined;

/** Two unanswered listens in a row and the mic is closed rather than left open. */
const MAX_QUIET_TURNS = 2;

export type VoiceEngine = 'voxide' | 'server';

/**
 * Voxide in the browser is the voice. `server` is push-to-talk: the browser
 * records and the server transcribes through `VOXIDE_API_KEY`. With
 * `VITE_VOICE_ENGINE=auto` (default) it only stands in when Voxide cannot run.
 */
function chooseEngine(voxideReady: boolean, serverReady: boolean): VoiceEngine | null {
  const preference = import.meta.env.VITE_VOICE_ENGINE ?? 'auto';
  if (preference === 'voxide') return voxideReady ? 'voxide' : null;
  if (preference === 'server') return serverReady ? 'server' : null;
  if (voxideReady) return 'voxide';
  return serverReady ? 'server' : null;
}

/**
 * Voice session for the active emergency screen (Task 21).
 *
 * `available` is false when neither engine can run (no Voxide key, no server
 * speech, or no mic); the session screen must then run on its buttons alone.
 */
export function useDeresVoice(incidentId: Id | null, language: Language) {
  const voxide = getVoxideClient();
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus | null>(null);
  const [lastTurn, setLastTurn] = useState<VoiceTurnResponse | null>(null);
  const [shownText, setShownText] = useState<string | null>(null);
  const [serverPhase, setServerPhase] = useState<VoiceSessionPhase>(VoiceSessionPhase.IDLE);
  const [serverError, setServerError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const instructionRef = useRef<string | null>(null);
  const dialedRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const greetedRef = useRef(false);
  const sessionRef = useRef<AbortController | null>(null);
  const recordingRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let live = true;
    void getSpeechStatus().then((value) => {
      if (live) setSpeechStatus(value);
    });
    return () => {
      live = false;
    };
  }, []);

  const voiceIncidentId = isLocalIncidentId(incidentId) ? null : incidentId;
  const hasMic = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices);
  const listen = listenCapability({
    hasMediaDevices: hasMic,
    engineReady: Boolean(
      voiceIncidentId &&
        speechStatus &&
        chooseEngine(voxide !== null && hasMic, speechStatus.transcribe && canRecord()),
    ),
    denied: serverError === 'permission',
  });
  const engine =
    voiceIncidentId && listen.status === CapabilityStatus.AVAILABLE && speechStatus
      ? chooseEngine(voxide !== null && hasMic, speechStatus.transcribe && canRecord())
      : null;

  useEffect(() => {
    instructionRef.current = lastTurn?.reply ?? null;
  }, [lastTurn]);

  useEffect(() => {
    if (engine) void prefetchSpokenLines(language);
  }, [engine, language]);

  const snapshot = useSyncExternalStore(
    voxide && engine === 'voxide' ? voxide.subscribe.bind(voxide) : noop,
    () => (voxide && engine === 'voxide' ? voxide.getSnapshot() : null),
  );

  useEffect(() => {
    if (engine !== 'voxide' || !voxide || !voiceIncidentId) return;
    bindDeresSession(voxide, {
      incidentId: voiceIncidentId,
      language,
      onTurn: setLastTurn,
      getCurrentInstruction: () => instructionRef.current,
    });
    return () => voxide.disconnect();
  }, [engine, voxide, voiceIncidentId, language]);

  const stopServerSession = useCallback(() => {
    sessionRef.current?.abort();
    sessionRef.current = null;
    recordingRef.current?.abort();
    stopSpeaking();
    setServerPhase(VoiceSessionPhase.IDLE);
  }, [setServerPhase]);

  useEffect(() => stopServerSession, [stopServerSession, voiceIncidentId, language]);

  const greet = useCallback(async () => {
    const lines = voiceLoopCopy(language);
    const greeted = await speak(lines.greeting, language);
    if (!greeted) setShownText(lines.greeting);
    await speak(lines.permission, language);
  }, [language, setShownText]);

  /** Listen → server STT and protocol → speak, until the person goes quiet or taps off. */
  const runServerSession = useCallback(async () => {
    if (!voiceIncidentId) return;
    sessionRef.current?.abort();
    const session = new AbortController();
    sessionRef.current = session;
    const live = () => !session.signal.aborted;
    const lines = voiceLoopCopy(language);
    setServerError(null);

    if (!greetedRef.current) {
      greetedRef.current = true;
      await greet();
    }

    let quietTurns = 0;
    while (live()) {
      const tap = new AbortController();
      recordingRef.current = tap;
      setServerPhase(VoiceSessionPhase.LISTENING);

      let clip;
      try {
        clip = await record({ stopSignal: tap.signal, onLevel: setMicLevel });
      } catch (error) {
        if (!live()) return;
        const said = await speak(lines.micDenied, language);
        if (!said) setShownText(lines.micDenied);
        setServerError(error instanceof RecorderError ? error.reason : 'device');
        setServerPhase(VoiceSessionPhase.ERROR);
        sessionRef.current = null;
        return;
      } finally {
        if (recordingRef.current === tap) recordingRef.current = null;
      }
      if (!live()) return;

      // A tap before any speech means "stop listening", not "send nothing".
      if (tap.signal.aborted && !clip.heardSpeech) break;

      setShownText(null);
      setServerPhase(VoiceSessionPhase.PROCESSING);
      const thinking = speak(lines.thinking, language);
      let turn: VoiceTurnResponse;
      try {
        // Not retried: a retry would bill a second transcription and could apply the turn twice.
        turn = await incidentsApi.voiceTurn(
          voiceIncidentId,
          clip.heardSpeech
            ? { language, audioBase64: clip.audioBase64, mimeType: clip.mimeType }
            : { language, silence: true },
          { skipRetry: true },
        );
      } catch {
        await thinking;
        if (!live()) return;
        setServerError('network');
        setServerPhase(VoiceSessionPhase.ERROR);
        sessionRef.current = null;
        return;
      }
      await thinking;
      if (!live()) return;

      setLastTurn(turn);
      setServerPhase(VoiceSessionPhase.SPEAKING);
      const said = await speak(turn.reply, language);
      if (!live()) return;
      if (!said) setShownText(turn.reply);

      if (turn.capability === 'place_call' && !dialedRef.current) {
        dialedRef.current = true;
        window.location.href = emergencyCallHref;
        break;
      }

      quietTurns = clip.heardSpeech ? 0 : quietTurns + 1;
      if (quietTurns >= MAX_QUIET_TURNS) break;
    }

    if (sessionRef.current === session) sessionRef.current = null;
    setServerPhase(VoiceSessionPhase.IDLE);
  }, [voiceIncidentId, language, greet, setServerError, setServerPhase, setMicLevel, setShownText, setLastTurn]);

  const connect = useCallback(async () => {
    if (engine === 'server') {
      void runServerSession();
      return;
    }
    if (!voxide) return;
    const lines = voiceLoopCopy(language);
    await greet();
    try {
      await voxide.init();
      await voxide.connect();
    } catch {
      const said = await speak(lines.micDenied, language);
      if (!said) setShownText(lines.micDenied);
      return;
    }
    // Shown, not spoken. The microphone is already open, and speaking this
    // aloud would be heard as the person's first answer.
    setShownText(lines.hearingYou);
  }, [engine, voxide, language, greet, runServerSession, setShownText]);

  const disconnect = useCallback(() => {
    if (engine === 'server') stopServerSession();
    else voxide?.disconnect();
  }, [engine, voxide, stopServerSession]);

  const [voxideLevel, setVoxideLevel] = useState(0);
  const voxideListening = engine === 'voxide' && snapshot?.status === 'listening';

  // The SDK's input level is not reactive; it has to be polled to draw a meter.
  useEffect(() => {
    if (!voxideListening || !voxide) return;
    let frame = 0;
    const tick = () => {
      setVoxideLevel(voxide.getInputLevel());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setVoxideLevel(0);
    };
  }, [voxideListening, voxide, setVoxideLevel]);

  useEffect(() => {
    if (engine !== 'voxide') return;
    if (lastTurn?.capability !== 'place_call' || dialedRef.current) return;
    if (snapshot?.status === 'speaking') heardSpeechRef.current = true;
    if (heardSpeechRef.current && snapshot?.status === 'listening') {
      dialedRef.current = true;
      window.location.href = emergencyCallHref;
    }
  }, [engine, lastTurn, snapshot?.status]);

  const phase =
    engine === 'server'
      ? serverPhase === VoiceSessionPhase.IDLE && lastTurn?.failure != null
        ? VoiceSessionPhase.ERROR
        : serverPhase === VoiceSessionPhase.LISTENING && lastTurn?.phase === VoiceSessionPhase.AWAITING_CONFIRMATION
          ? VoiceSessionPhase.AWAITING_CONFIRMATION
          : serverPhase
      : lastTurn?.failure != null
        ? VoiceSessionPhase.ERROR
        : snapshot
          ? snapshot.status === 'listening' && lastTurn?.phase === VoiceSessionPhase.AWAITING_CONFIRMATION
            ? VoiceSessionPhase.AWAITING_CONFIRMATION
            : voxidePhase(snapshot.status)
          : VoiceSessionPhase.IDLE;

  /**
   * The mic button. Tap while it speaks to interrupt and answer. Server
   * engine: tap again to send early, or to stop if nothing was said yet.
   */
  const press = useCallback(() => {
    if (engine === 'server') {
      if (serverPhase === VoiceSessionPhase.LISTENING) recordingRef.current?.abort();
      else if (serverPhase === VoiceSessionPhase.SPEAKING) stopSpeaking();
      else if (serverPhase === VoiceSessionPhase.IDLE || serverPhase === VoiceSessionPhase.ERROR) void connect();
      return;
    }
    if (phase === VoiceSessionPhase.IDLE || phase === VoiceSessionPhase.ERROR) void connect();
    else if (phase === VoiceSessionPhase.SPEAKING) voxide?.interrupt();
    else disconnect();
  }, [engine, serverPhase, phase, connect, disconnect, voxide]);

  return {
    listen,
    available: engine !== null,
    engine,
    phase,
    lastTurn,
    shownText,
    micLevel: engine === 'server' ? micLevel : voxideLevel,
    messages: snapshot?.messages ?? [],
    errorCode: engine === 'server' ? serverError : (snapshot?.errorCode ?? null),
    connect,
    disconnect,
    press,
  };
}
