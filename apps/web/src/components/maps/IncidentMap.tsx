import { Icon } from '@/components/ui';
import { sceneMapSrc } from '@/services/maps/googleMaps';

type Props = {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters?: number | null;
  title?: string;
};

export function IncidentMap({ latitude, longitude, accuracyMeters, title }: Props) {
  const hasCoords = latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const src = hasCoords ? sceneMapSrc({ lat: latitude, lng: longitude }, accuracyMeters) : null;

  return (
    <div className="relative mt-4 overflow-hidden rounded-lg bg-[#dce8e8] notranslate" translate="no">
      {src ? (
        <iframe
          title={title || 'Scene location'}
          src={src}
          className="h-52 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex h-52 flex-col items-center justify-center gap-2 map-grid">
          <span className="grid size-12 place-items-center rounded-full bg-[#087a65] text-white shadow-lg">
            <Icon name="location" />
          </span>
          <p className="px-4 text-center text-xs font-bold text-[#3d5558]">Waiting for bystander location</p>
        </div>
      )}
    </div>
  );
}

export default IncidentMap;
