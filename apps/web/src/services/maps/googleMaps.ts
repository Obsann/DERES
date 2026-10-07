type LatLng = { lat: number; lng: number };

type MapsApi = {
  translate?: {
    TranslateElement: new (options: Record<string, unknown>, elementId: string) => unknown;
  };
  maps: {
    Map: new (
      el: HTMLElement,
      opts: {
        center: LatLng;
        zoom: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        gestureHandling?: string;
        clickableIcons?: boolean;
        styles?: unknown[];
      },
    ) => GoogleMap;
    Marker: new (opts: {
      position: LatLng;
      map: GoogleMap;
      title?: string;
      animation?: unknown;
    }) => GoogleMarker;
    Circle: new (opts: {
      map: GoogleMap;
      center: LatLng;
      radius: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }) => GoogleCircle;
    Animation?: { DROP: unknown };
    event?: MapsEvent;
  };
};

type GoogleMap = {
  setCenter: (position: LatLng) => void;
  setZoom: (zoom: number) => void;
};

type MapsEvent = {
  trigger: (instance: unknown, eventName: string) => void;
};

type GoogleMarker = {
  setPosition: (position: LatLng) => void;
  setMap: (map: GoogleMap | null) => void;
};

type GoogleCircle = {
  setCenter: (position: LatLng) => void;
  setRadius: (radius: number) => void;
  setMap: (map: GoogleMap | null) => void;
};

declare global {
  interface Window {
    google?: MapsApi;
  }
}

let loading: Promise<MapsApi> | null = null;

export function mapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_MAPS_API_KEY?.trim();
  return key || undefined;
}

/** Muted teal so the scene pin reads against the responder dashboard. */
export const SCENE_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#dce8e8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3d5558' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f4f8f8' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#b7c9c8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8ddd6' }, { visibility: 'on' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f3f7f7' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c5d4d3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e4eeed' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a9c9c6' }] },
];

export function loadGoogleMaps(): Promise<MapsApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Maps need a browser'));
  if (window.google?.maps?.Map) return Promise.resolve(window.google);

  if (!loading) {
    const key = mapsApiKey();
    if (!key) return Promise.reject(new Error('Missing VITE_MAPS_API_KEY'));

    loading = new Promise((resolve, reject) => {
      const finish = () => {
        if (window.google?.maps?.Map) {
          resolve(window.google);
          return;
        }
        loading = null;
        reject(new Error('Google Maps did not initialize'));
      };

      const existing = document.querySelector<HTMLScriptElement>('script[data-deres-maps]');
      if (existing) {
        existing.addEventListener('load', finish);
        existing.addEventListener('error', () => {
          loading = null;
          reject(new Error('Google Maps failed to load'));
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
      script.async = true;
      script.defer = true;
      script.dataset.deresMaps = '1';
      script.onload = finish;
      script.onerror = () => {
        loading = null;
        reject(new Error('Google Maps failed to load'));
      };
      document.head.appendChild(script);
    });
  }

  return loading;
}

export function mountSceneMap(
  api: MapsApi,
  element: HTMLElement,
  position: LatLng,
  options: { title?: string; accuracyMeters?: number | null },
): { update: (next: LatLng, accuracyMeters?: number | null) => void; destroy: () => void } {
  const map = new api.maps.Map(element, {
    center: position,
    zoom: zoomForAccuracy(options.accuracyMeters),
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    clickableIcons: false,
    styles: SCENE_MAP_STYLES,
  });

  const marker = new api.maps.Marker({
    position,
    map,
    title: options.title || 'Scene',
    animation: api.maps.Animation?.DROP,
  });

  let circle: GoogleCircle | null = null;
  if (options.accuracyMeters && options.accuracyMeters > 0) {
    circle = new api.maps.Circle({
      map,
      center: position,
      radius: options.accuracyMeters,
      fillColor: '#087a65',
      fillOpacity: 0.16,
      strokeColor: '#087a65',
      strokeOpacity: 0.7,
      strokeWeight: 1,
    });
  }

  window.setTimeout(() => {
    api.maps.event?.trigger(map, 'resize');
    map.setCenter(position);
  }, 80);

  return {
    update(next, accuracyMeters) {
      map.setCenter(next);
      map.setZoom(zoomForAccuracy(accuracyMeters));
      marker.setPosition(next);
      if (accuracyMeters && accuracyMeters > 0) {
        if (circle) {
          circle.setCenter(next);
          circle.setRadius(accuracyMeters);
        } else {
          circle = new api.maps.Circle({
            map,
            center: next,
            radius: accuracyMeters,
            fillColor: '#087a65',
            fillOpacity: 0.16,
            strokeColor: '#087a65',
            strokeOpacity: 0.7,
            strokeWeight: 1,
          });
        }
      } else if (circle) {
        circle.setMap(null);
        circle = null;
      }
    },
    destroy() {
      marker.setMap(null);
      circle?.setMap(null);
    },
  };
}

function zoomForAccuracy(meters?: number | null): number {
  if (!meters || meters <= 25) return 17;
  if (meters <= 80) return 16;
  if (meters <= 250) return 15;
  return 14;
}
