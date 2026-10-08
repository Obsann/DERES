/**
 * Push-to-talk capture for the server speech engine.
 *
 * A turn ends on whichever comes first: the person stops talking, the
 * caller's stop signal (a second tap), or the hard cap. The clip is sent as
 * 16kHz mono WAV because speech-to-text services accept it whatever the
 * browser recorded natively (WebM on Chrome, MP4 on Safari).
 */

export type RecorderFailure = 'unsupported' | 'permission' | 'device';

export class RecorderError extends Error {
  constructor(readonly reason: RecorderFailure, options?: { cause?: unknown }) {
    super(`Recording failed: ${reason}`, options);
    this.name = 'RecorderError';
  }
}

export interface RecordOptions {
  /** Aborting ends the turn early and still returns what was heard. */
  stopSignal?: AbortSignal;
  maxDurationMs?: number;
  /** Ends the turn after this much quiet once speech has started. */
  trailingSilenceMs?: number;
  /** Ends the turn if nobody starts speaking within this window. */
  noSpeechTimeoutMs?: number;
  /** 0..1, roughly perceived loudness, about 20 times a second. */
  onLevel?: (level: number) => void;
}

export interface Recording {
  audioBase64: string;
  mimeType: 'audio/wav';
  durationMs: number;
  /** False when the voice detector never crossed the speech threshold. */
  heardSpeech: boolean;
}

const TARGET_SAMPLE_RATE = 16_000;
const NOISE_SAMPLE_MS = 300;
const MIN_SPEECH_RMS = 0.015;

export function canRecord(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined' &&
    typeof AudioContext !== 'undefined'
  );
}

export async function record(options: RecordOptions = {}): Promise<Recording> {
  if (!canRecord()) throw new RecorderError('unsupported');

  const maxDurationMs = options.maxDurationMs ?? 10_000;
  const trailingSilenceMs = options.trailingSilenceMs ?? 700;
  const noSpeechTimeoutMs = options.noSpeechTimeoutMs ?? 6_000;

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (cause) {
    const denied = cause instanceof DOMException && (cause.name === 'NotAllowedError' || cause.name === 'SecurityError');
    throw new RecorderError(denied ? 'permission' : 'device', { cause });
  }

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  context.createMediaStreamSource(stream).connect(analyser);

  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const startedAt = performance.now();
  let heardSpeech = false;
  let lastSpeechAt = 0;
  let noiseFloor = 0;
  let noiseSamples = 0;
  const samples = new Float32Array(analyser.fftSize);

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });
  const stop = () => {
    if (recorder.state !== 'inactive') recorder.stop();
  };
  options.stopSignal?.addEventListener('abort', stop, { once: true });

  const meter = window.setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const rms = Math.sqrt(sum / samples.length);
    const elapsed = performance.now() - startedAt;

    // The first moments are the room, not the person: calibrate on them.
    if (elapsed < NOISE_SAMPLE_MS) {
      noiseSamples += 1;
      noiseFloor += (rms - noiseFloor) / noiseSamples;
    } else if (rms > Math.max(MIN_SPEECH_RMS, noiseFloor * 3)) {
      heardSpeech = true;
      lastSpeechAt = elapsed;
    }

    options.onLevel?.(Math.min(1, rms * 8));

    if (
      elapsed >= maxDurationMs ||
      (heardSpeech && elapsed - lastSpeechAt >= trailingSilenceMs) ||
      (!heardSpeech && elapsed >= noSpeechTimeoutMs)
    ) {
      stop();
    }
  }, 50);

  recorder.start(250);
  if (options.stopSignal?.aborted) stop();

  try {
    await stopped;
  } finally {
    window.clearInterval(meter);
    options.stopSignal?.removeEventListener('abort', stop);
    options.onLevel?.(0);
    stream.getTracks().forEach((track) => track.stop());
  }

  const durationMs = Math.round(performance.now() - startedAt);
  try {
    const encoded = await chunksToWav(new Blob(chunks, { type: recorder.mimeType }), context);
    return { audioBase64: toBase64(encoded), mimeType: 'audio/wav', durationMs, heardSpeech };
  } catch (cause) {
    throw new RecorderError('device', { cause });
  } finally {
    void context.close();
  }
}

async function chunksToWav(blob: Blob, context: AudioContext): Promise<Uint8Array> {
  if (blob.size === 0) return encodeWav(new Float32Array(0), TARGET_SAMPLE_RATE);
  const decoded = await context.decodeAudioData(await blob.arrayBuffer());
  const length = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE);
}

/** Canonical 44-byte header. Some parsers misread the 18-byte fmt chunk Windows writes. */
function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
