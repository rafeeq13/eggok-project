'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

let loadingPromise: Promise<void> | null = null;
let loaded = false;

export function useGoogleMaps() {
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (loaded || (typeof window !== 'undefined' && (window as any).google?.maps)) {
      loaded = true;
      setMapsReady(true);
      return;
    }

    if (!loadingPromise) {
      loadingPromise = new Promise<void>((resolve) => {
        fetch(`${API}/settings/integrations`)
          .then(r => r.ok ? r.text() : '')
          .then(text => {
            if (!text) { resolve(); return; }
            const data = JSON.parse(text);
            const key = data?.googleMapsKey;
            if (!key) { resolve(); return; }
            if ((window as any).google?.maps) { loaded = true; resolve(); return; }
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
            script.async = true;
            script.onload = () => { loaded = true; resolve(); };
            script.onerror = () => resolve();
            document.head.appendChild(script);
          })
          .catch(() => resolve());
      });
    }

    loadingPromise.then(() => setMapsReady(loaded));
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
