// Thin wrapper around window.fbq so callers don't have to deal with the global.
// Safe to call before the pixel script has loaded — fbq's own queue handles that;
// safe to call when the pixel isn't configured at all — we just no-op.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function fbqTrack(event: string, data?: Record<string, any>, eventID?: string) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  // The third argument shape `{ eventID }` is how Meta Pixel accepts a custom event ID
  // for deduplication against Conversions API events with the same id.
  if (data && eventID) window.fbq('track', event, data, { eventID });
  else if (data) window.fbq('track', event, data);
  else window.fbq('track', event);
}
