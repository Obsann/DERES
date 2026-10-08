/**
 * Local speech for the lines that must be heard before the agent can talk:
 * the greeting, the permission reason, and "I'm thinking".
 *
 * English almost always has a device voice. Amharic sometimes does (Android
 * Chrome / Edge language packs). Afaan Oromoo almost never does — do not fall
 * back to an English voice for it here; Voxide speaks Oromo instead. Geʽez
 * must never be read by an English voice.
 */

export function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const wanted = lang.toLowerCase().replace('_', '-');
  const prefix = wanted.split('-')[0] ?? wanted;
  const normalised = (value: string) => value.toLowerCase().replace('_', '-');

  return (
    voices.find((voice) => normalised(voice.lang) === wanted) ??
    voices.find((voice) => normalised(voice.lang).startsWith(`${prefix}-`)) ??
    voices.find((voice) => normalised(voice.lang) === prefix) ??
    voices.find((voice) => normalised(voice.name).includes(prefix === 'am' ? 'amharic' : prefix === 'om' ? 'oromo' : '')) ??
    null
  );
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const current = window.speechSynthesis.getVoices();
  if (current.length > 0) return Promise.resolve(current);

  return new Promise((resolve) => {
    const finish = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      window.clearTimeout(timer);
      resolve(window.speechSynthesis.getVoices());
    };
    const timer = window.setTimeout(finish, 1500);
    window.speechSynthesis.addEventListener('voiceschanged', finish);
  });
}

export async function speakLocally(text: string, lang: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis || text.trim() === '') {
    return false;
  }

  const voices = await loadVoices();
  const prefix = lang.toLowerCase().split('-')[0] ?? lang;
  const voice = pickVoice(voices, lang);
  // Without a matching voice, Chrome will invent an English reading. Refuse.
  if (!voice && prefix !== 'en') return false;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(ok);
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? lang;
    if (voice) utterance.voice = voice;
    utterance.rate = prefix === 'en' ? 1 : 0.92;
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);
    const timeout = window.setTimeout(() => {
      window.speechSynthesis.cancel();
      finish(false);
    }, 12_000);

    window.speechSynthesis.cancel();
    // Chrome drops speak() if it immediately follows cancel().
    window.setTimeout(() => {
      if (settled) return;
      window.speechSynthesis.speak(utterance);
    }, 40);
  });
}
