/**
 * Base URL for API calls from the browser.
 *
 * In development, use same-origin `/api` so Vite's proxy forwards to the backend
 * (avoids relying on CORS during local work). In production builds, use VITE_API_URL.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) return '';

  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return '';
}
