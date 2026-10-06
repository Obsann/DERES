/**
 * Local speech for the lines that must be heard before the agent can talk:
 * the greeting, the permission reason, and "I'm thinking".
 *
 * Returns false when speech itself is dead. The caller shows the text and
 * does not try to apologize through the broken channel.
 */
export function speakLocally(text: string, lang: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis || text.trim() === '') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(ok);
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);
    const timeout = window.setTimeout(() => {
      window.speechSynthesis.cancel();
      finish(false);
    }, 8000);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}
