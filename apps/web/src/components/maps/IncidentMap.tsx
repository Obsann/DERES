import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui';
import { loadGoogleMaps, mapsApiKey, mountSceneMap } from '@/services/maps/googleMaps';

type SceneHandle = ReturnType<typeof mountSceneMap>;

type Props = {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters?: number | null;
  title?: string;
};

export function IncidentMap({ latitude, longitude, accuracyMeters, title }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const hasCoords = latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const canLoad = Boolean(mapsApiKey());

  useEffect(() => {
    if (!hasCoords || !canLoad) {
      scene.current?.destroy();
      scene.current = null;
      setStatus('idle');
      return;
    }

    const element = host.current;
    if (!element) return;

    let cancelled = false;
    setStatus((current) => (current === 'ready' ? current : 'loading'));

    void loadGoogleMaps()
      .then((api) => {
        if (cancelled || !host.current) return;
        const position = { lat: latitude, lng: longitude };
        if (scene.current) {
          scene.current.update(position, accuracyMeters);
        } else {
          scene.current = mountSceneMap(api, host.current, position, { title, accuracyMeters });
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [accuracyMeters, canLoad, hasCoords, latitude, longitude, title]);

  useEffect(
    () => () => {
      scene.current?.destroy();
      scene.current = null;
    },
    [],
  );

  const overlay =
    !hasCoords || status !== 'ready'
      ? {
          idle: hasCoords
            ? canLoad
              ? 'Loading map…'
              : 'Map key not configured'
            : 'Waiting for bystander location',
          loading: 'Loading map…',
          ready: '',
          error: 'Could not load the map',
        }[status]
      : null;

  return (
    <div className="relative mt-4 overflow-hidden rounded-lg bg-[#dce8e8]">
      <div ref={host} className="h-52 w-full" aria-hidden={status !== 'ready'} />
      {overlay ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 map-grid">
          <span className="grid size-12 place-items-center rounded-full bg-[#087a65] text-white shadow-lg">
            <Icon name="location" />
          </span>
          <p className="px-4 text-center text-xs font-bold text-[#3d5558]">{overlay}</p>
        </div>
      ) : null}
    </div>
  );
}

export default IncidentMap;
