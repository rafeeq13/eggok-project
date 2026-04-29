// Thin wrapper around window.fbq so callers don't have to deal with the global.
// Safe to call before the pixel script has loaded — fbq's own queue handles that;
// safe to call when the pixel isn't configured at all — we just no-op.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function fbqTrack(event: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  if (data) window.fbq('track', event, data);
  else window.fbq('track', event);
}
