import { useEffect, useRef } from 'react';
import { loadGoogleTranslate, translateWidget } from '@/services/translate/googleTranslate';

/**
 * Header slot for the Google Translate dropdown. The widget lives outside
 * React; this only moves it in while a responder page is mounted, and hides it
 * again when they leave, so it never appears on the emergency screens.
 */
export function TranslateSlot() {
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = translateWidget();
    const target = slot.current;
    if (!widget || !target) return;

    loadGoogleTranslate();
    widget.hidden = false;
    target.appendChild(widget);

    return () => {
      widget.hidden = true;
      document.body.appendChild(widget);
    };
  }, []);

  return <div ref={slot} className="d-translate-slot" />;
}
