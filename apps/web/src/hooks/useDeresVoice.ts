import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Language,
  VoiceSessionPhase,
  type Id,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import type { VoxideClient } from '@voxide/react/core';
import { emergencyCallHref } from '@/config/emergency';
import { publishedProtocols } from '@voicesos/protocols';
import { incidentsApi } from '@/services/api';
import { listenCapability, CapabilityStatus } from '@/services/capability';
import { isLocalIncidentId } from '@/services/protocol/localIncident';
import { voiceLoopCopy } from '@/services/voice/loopCopy';
import { canRecord, record, RecorderError } from '@/services/voice/recorder';
import { canSpeak, getSpeechStatus, prefetchSpokenLines, speak, stopSpeaking, type SpeechStatus } from '@/services/voice/speech';
import {
  appSpeaksLanguage,
  bindDeresSession,
  getVoxideClient,
  VOXIDE_OPENING_CUE,
  voxidePhase,
} from '@/services/voice/voxide';

const noop = () => () => undefined;

/** Two unanswered listens in a row and the mic is closed rather than left open. */
const MAX_QUIET_TURNS = 2;

export type VoiceEngine = 'voxide' | 'server';

/**
 * Voxide in the browser is the duplex voice. `server` is push-to-talk when the
 * API can both hear and speak. With `VITE_VOICE_ENGINE=auto` (default), Voxide
 * wins when it can run.
 */
function chooseEngine(voxideReady: boolean, serverReady: boolean): VoiceEngine | null {
  const preference = import.meta.env.VITE_VOICE_ENGINE ?? 'auto';
  if (preference === 'voxide') return voxideReady ? 'voxide' : null;
  if (preference === 'server') return serverReady ? 'server' : null;
  if (voxideReady) return 'voxide';
  return serverReady ? 'server' : null;
}

/** Shows the browser permission prompt, then releases the stream so Voxide can take it. */
async function requestMicrophone(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

async function openLiveSession(
  voxide: VoxideClient,
  ready?: Promise<unknown>,
  greetThroughAgent = true,
): Promise<void> {
  await (ready ?? voxide.init());
  await voxide.connect();
  // English and Amharic are already being spoken by the phone. Asking the
  // agent to greet as well costs a full model turn before it will listen.
  if (greetThroughAgent) await voxide.sendText(VOXIDE_OPENING_CUE);
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
  const [hostSpeaking, setHostSpeaking] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);

  const instructionRef = useRef<string | null>(null);
  const dialedRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const greetedRef = useRef(false);
  const sessionRef = useRef<AbortController | null>(null);
  const recordingRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const languageRef = useRef(language);
  languageRef.current = language;

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
  const voxideReady = Boolean(voiceIncidentId && voxide && hasMic);
  const serverReady = Boolean(voiceIncidentId && speechStatus?.transcribe && canRecord());
  const listen = listenCapability({
    hasMediaDevices: hasMic,
    engineReady: voxideReady || serverReady,
    // Voxide keeps the engine so a mic tap can ask again. Server recorder
    // denial is the only hard stop.
    denied: serverError === 'permission' && !voxideReady,
  });
  const engine =
    voiceIncidentId && listen.status === CapabilityStatus.AVAILABLE
      ? chooseEngine(voxideReady, serverReady)
      : null;

  useEffect(() => {
    instructionRef.current = lastTurn?.reply ?? null;
  }, [lastTurn]);

  useEffect(() => {
    if (!engine) return;
    const lines = publishedProtocols.flatMap((protocol) =>
      protocol.steps
        .map((step) => step.prompt[language] ?? '')
        .filter((line) => line.trim() !== ''),
    );
    void prefetchSpokenLines(language, lines);
  }, [engine, language]);

  const snapshot = useSyncExternalStore(
    voxide && engine === 'voxide' ? voxide.subscribe.bind(voxide) : noop,
    () => (voxide && engine === 'voxide' ? voxide.getSnapshot() : null),
  );

  const stopServerSession = useCallback(() => {
    sessionRef.current?.abort();
    sessionRef.current = null;
    recordingRef.current?.abort();
    stopSpeaking();
    setHostSpeaking(false);
    setServerPhase(VoiceSessionPhase.IDLE);
  }, []);

  const failMic = useCallback(
    async (lines = voiceLoopCopy(languageRef.current)) => {
      setShownText(lines.micDenied);
      const said = await speak(lines.micDenied, languageRef.current);
      if (!said) setShownText(lines.micDenied);
    },
    [],
  );

  /**
   * One owner for the live session. A new runId cancels anything still
   * starting after a language or incident change.
   */
  useEffect(() => {
    if (engine !== 'voxide' || !voxide || !voiceIncidentId) return;

    const runId = ++runIdRef.current;
    const alive = () => runIdRef.current === runId;
    const lines = voiceLoopCopy(language);
    const hostVoice = appSpeaksLanguage(language);

    dialedRef.current = false;
    heardSpeechRef.current = false;
    setLastTurn(null);
    setServerError(null);
    setHostSpeaking(false);
    setShownText(lines.greeting);
    stopSpeaking();
    voxide.disconnect();

    const boot = voxide.init();
    // Speak on the phone only when a real voice for this language exists.
    // Otherwise the agent greets, so a missing Amharic pack does not go silent.
    const hostSpeaks = hostVoice ? canSpeak(language) : Promise.resolve(false);
    const greetingSpoken = hostSpeaks.then((ok) => (ok ? speak(lines.greeting, language) : false));

    const release = bindDeresSession(voxide, {
      incidentId: voiceIncidentId,
      language,
      onTurn: (turn) => {
        if (alive()) setLastTurn(turn);
      },
      getCurrentInstruction: () => instructionRef.current,
      greetingSpoken,
      hostSpeaks,
      onHostSpeech: (speaking, text) => {
        if (!alive()) return;
        setHostSpeaking(speaking);
        if (speaking && text) setShownText(text);
      },
    });

    void (async () => {
      const [allowed, host] = await Promise.all([requestMicrophone(), hostSpeaks]);
      if (!alive()) return;
      if (!allowed) {
        stopSpeaking();
        setServerError('permission');
        await failMic(lines);
        return;
      }

      try {
        await openLiveSession(voxide, boot, !host);
        if (!alive()) {
          voxide.disconnect();
          return;
        }
      } catch {
        if (!alive()) return;
        try {
          voxide.disconnect();
          await openLiveSession(voxide, undefined, !host);
          if (!alive()) {
            voxide.disconnect();
            return;
          }
        } catch {
          if (alive()) await failMic(lines);
        }
      }
    })();

    return () => {
      release();
      runIdRef.current += 1;
      stopSpeaking();
      setHostSpeaking(false);
      voxide.disconnect();
    };
  }, [engine, voxide, voiceIncidentId, language, sessionTick, failMic]);

  useEffect(() => {
    if (engine === 'server') return;
    stopServerSession();
  }, [engine, voiceIncidentId, language, stopServerSession]);

  const greet = useCallback(async () => {
    const lines = voiceLoopCopy(language);
    const greeted = await speak(lines.greeting, language);
    if (!greeted) setShownText(lines.greeting);
  }, [language]);

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
        await failMic(lines);
        setServerError(error instanceof RecorderError ? error.reason : 'device');
        setServerPhase(VoiceSessionPhase.ERROR);
        sessionRef.current = null;
        return;
      } finally {
        if (recordingRef.current === tap) recordingRef.current = null;
      }
      if (!live()) return;

      if (tap.signal.aborted && !clip.heardSpeech) break;

      setShownText(null);
      setServerPhase(VoiceSessionPhase.PROCESSING);
      let turn: VoiceTurnResponse;
      try {
        turn = await incidentsApi.voiceTurn(
          voiceIncidentId,
          clip.heardSpeech
            ? { language, audioBase64: clip.audioBase64, mimeType: clip.mimeType }
            : { language, silence: true },
          { skipRetry: true },
        );
      } catch {
        if (!live()) return;
        setServerError('network');
        setServerPhase(VoiceSessionPhase.ERROR);
        sessionRef.current = null;
        return;
      }
      if (!live()) return;

      setLastTurn(turn);
      setServerPhase(VoiceSessionPhase.SPEAKING);
      setHostSpeaking(true);
      const said = await speak(turn.reply, language);
      setHostSpeaking(false);
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
  }, [voiceIncidentId, language, greet, failMic]);

  // Reset the one-shot server greeting when the incident or language changes.
  useEffect(() => {
    greetedRef.current = false;
  }, [voiceIncidentId, language]);

  const connect = useCallback(async () => {
    setServerError(null);
    if (engine === 'server') {
      void runServerSession();
      return;
    }
    if (!voxide) return;
    const live = voxide.getSnapshot().status;
    if (live !== 'idle' && live !== 'error' && live !== 'armed') return;
    // Re-run the single session owner (permission → greet → listen).
    setSessionTick((value) => value + 1);
  }, [engine, voxide, runServerSession]);

  const disconnect = useCallback(() => {
    if (engine === 'server') stopServerSession();
    else {
      stopSpeaking();
      setHostSpeaking(false);
      voxide?.disconnect();
    }
  }, [engine, voxide, stopServerSession]);

  const [voxideLevel, setVoxideLevel] = useState(0);
  const voxideListening = engine === 'voxide' && snapshot?.status === 'listening' && !hostSpeaking;

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
  }, [voxideListening, voxide]);

  useEffect(() => {
    if (engine !== 'voxide') return;
    if (lastTurn?.capability !== 'place_call' || dialedRef.current) return;
    if (snapshot?.status === 'speaking' || hostSpeaking) heardSpeechRef.current = true;
    if (heardSpeechRef.current && snapshot?.status === 'listening' && !hostSpeaking) {
      dialedRef.current = true;
      window.location.href = emergencyCallHref;
    }
  }, [engine, lastTurn, snapshot?.status, hostSpeaking]);

  const phase =
    engine === 'server'
      ? serverPhase === VoiceSessionPhase.IDLE && lastTurn?.failure != null
        ? VoiceSessionPhase.ERROR
        : serverPhase === VoiceSessionPhase.LISTENING && lastTurn?.phase === VoiceSessionPhase.AWAITING_CONFIRMATION
          ? VoiceSessionPhase.AWAITING_CONFIRMATION
          : serverPhase
      : hostSpeaking
        ? VoiceSessionPhase.SPEAKING
        : lastTurn?.failure != null
          ? VoiceSessionPhase.ERROR
          : snapshot
            ? snapshot.status === 'listening' && lastTurn?.phase === VoiceSessionPhase.AWAITING_CONFIRMATION
              ? VoiceSessionPhase.AWAITING_CONFIRMATION
              : voxidePhase(snapshot.status)
            : VoiceSessionPhase.IDLE;

  /**
   * Mic button. Tap while speaking / thinking to interrupt. Tap while listening
   * to end. Tap while idle / error to start again.
   */
  const press = useCallback(() => {
    if (engine === 'server') {
      if (serverPhase === VoiceSessionPhase.LISTENING) recordingRef.current?.abort();
      else if (serverPhase === VoiceSessionPhase.SPEAKING) stopSpeaking();
      else if (serverPhase === VoiceSessionPhase.IDLE || serverPhase === VoiceSessionPhase.ERROR) void connect();
      return;
    }
    if (phase === VoiceSessionPhase.IDLE || phase === VoiceSessionPhase.ERROR) void connect();
    else if (phase === VoiceSessionPhase.SPEAKING || phase === VoiceSessionPhase.PROCESSING) {
      stopSpeaking();
      setHostSpeaking(false);
      voxide?.interrupt();
    } else disconnect();
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
