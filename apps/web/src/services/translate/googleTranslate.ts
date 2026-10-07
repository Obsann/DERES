/**
 * Google Translate for the responder dashboard only.
 *
 * Bystander screens already ship in English, Amharic and Afaan Oromoo, and
 * their instructions must match the spoken protocol word for word, so they are
 * marked `notranslate`. On responder pages, patient facts and protocol text are
 * marked the same way; only labels and headings are machine-translated.
 */

const SCRIPT_ID = 'google-translate-script';
const WIDGET_ID = 'google_translate_element';
const LANGUAGES = 'en,am,om';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

let patched = false;

/**
 * Google Translate swaps text nodes for its own elements. When React later
 * removes or inserts next to a node that was swapped, the DOM call throws and
 * the page goes blank. Ignore only that mismatch, and only once the widget is in use.
 */
function patchDomForTranslate(): void {
  if (patched || typeof Node !== 'function') return;
  patched = true;

  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

export function translateWidget(): HTMLElement | null {
  return document.getElementById(WIDGET_ID);
}

/** Loads the widget script once. Safe to call on every responder page mount. */
export function loadGoogleTranslate(): void {
  if (document.getElementById(SCRIPT_ID)) return;
  patchDomForTranslate();

  window.googleTranslateElementInit = () => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    if (!TranslateElement) return;
    new TranslateElement({ pageLanguage: 'en', includedLanguages: LANGUAGES, autoDisplay: false }, WIDGET_ID);
  };

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}
