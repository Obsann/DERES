/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Voxide publishable key (vox_pub_…). Safe in the browser; domain-locked in the Voxide dashboard. */
  readonly VITE_VOXIDE_PUBLIC_KEY?: string;
  /** Overrides the ambulance short code dialed by "Call emergency services". */
  readonly VITE_EMERGENCY_NUMBER?: string;
  /** `auto` (default), `voxide`, or `server` (push-to-talk, transcribed by the server's Voxide key). */
  readonly VITE_VOICE_ENGINE?: 'auto' | 'voxide' | 'server';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
