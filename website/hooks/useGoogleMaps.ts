'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
const KEY_CACHE = 'eggok_gmaps_key';

let loadingPromise: Promise<void> | null = null;
let loaded = false;

async function fetchKey(): Promise<string | null> {
  try {
    const cached = sessionStorage.getItem(KEY_CACHE);
    if (cached) return cached;
  } catch {}
  try {
    const res = await fetch(`${API}/settings/integrations`);
    if (!res.ok) return null;
    const data = await res.json();
    const key = data?.googleMapsKey || null;
    if (key) {
      try { sessionStorage.setItem(KEY_CACHE, key); } catch {}
    }
    return key;
  } catch {
    return null;
  }
}

function loadScript(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) { loaded = true; resolve(); return; }

    const existing = document.querySelector<HTMLScriptElement>('script[data-gmaps="1"]');
    if (existing) {
      existing.addEventListener('load', () => { loaded = true; resolve(); }, { once: true });
      existing.addEventListener('error', () => reject(new Error('gmaps load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmaps', '1');
    script.onload = () => { loaded = true; resolve(); };
    script.onerror = () => reject(new Error('gmaps load failed'));
    document.head.appendChild(script);
  });
}

export function useGoogleMaps() {
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (loaded || (typeof window !== 'undefined' && (window as any).google?.maps?.places)) {
      loaded = true;
      setMapsReady(true);
      return;
    }

    if (!loadingPromise) {
      loadingPromise = (async () => {
        const key = await fetchKey();
        if (!key) throw new Error('no key');
        await loadScript(key);
      })().catch((err) => {
        // Reset so a remount can retry instead of being stuck forever.
        loadingPromise = null;
        throw err;
      });
    }

    let cancelled = false;
    loadingPromise
      .then(() => { if (!cancelled) setMapsReady(true); })
      .catch(() => { if (!cancelled) setMapsReady(false); });
    return () => { cancelled = true; };
  }, []);

  return mapsReady;
}

/**
 * Initialize Google Places Autocomplete on an input element.
 * Returns a cleanup function.
 */
export function initAutocomplete(
  input: HTMLInputElement,
  onPlaceSelected: (place: { address: string; lat: number; lng: number }) => void,
) {
  if (!(window as any).google?.maps?.places) return () => {};

  const ac = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'us' },
    fields: ['formatted_address', 'geometry'],
  });

  const listener = ac.addListener('place_changed', () => {
    const place = ac.getPlace();
    if (place.formatted_address && place.geometry?.location) {
      onPlaceSelected({
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  });

  return () => {
    google.maps.event.removeListener(listener);
  };
}

/**
 * Validate a delivery address against zones via the backend.
 */
export async function validateDeliveryAddress(lat: number, lng: number): Promise<{
  eligible: boolean;
  distance: number;
  zone: string | null;
  deliveryFee: number;
  minOrder: number;
  estimatedMinutes: number;
}> {
  const res = await fetch(`${API}/settings/validate-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  });
  return res.json();
}
