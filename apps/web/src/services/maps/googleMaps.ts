type LatLng = { lat: number; lng: number };

function zoomForAccuracy(meters?: number | null): number {
  if (!meters || meters <= 25) return 17;
  if (meters <= 80) return 16;
  if (meters <= 250) return 15;
  return 14;
}

/**
 * Interactive Google Map for the responder panel.
 *
 * The supplied Maps key does not have Maps JavaScript API or Maps Embed API
 * enabled, so the keyed SDKs render Google's error overlay. The public
 * `output=embed` viewer pins the scene without that project enablement, and
 * lives in an iframe so the responder Translate widget cannot rewrite the map DOM.
 */
export function sceneMapSrc(position: LatLng, accuracyMeters?: number | null): string {
  const zoom = zoomForAccuracy(accuracyMeters);
  const src = new URL('https://maps.google.com/maps');
  src.searchParams.set('q', `${position.lat},${position.lng}`);
  src.searchParams.set('z', String(zoom));
  src.searchParams.set('hl', 'en');
  src.searchParams.set('output', 'embed');
  return src.toString();
}
