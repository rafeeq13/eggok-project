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
 * Initialize Google Places Autocomplete on an input element using AutocompleteService
 * directly (NOT the deprecated-ish Autocomplete widget). This gives us:
 *   - Instant fetch on the first keystroke (no 300ms widget debounce).
 *   - A custom dropdown we fully control (no .pac-container z-index fights).
 *   - Immediate fetch when we attach to an input that already has text which fixes
 *     the common case where the user types while the Maps script is still loading
 *     and would otherwise see nothing until they typed again.
 *
 * Returns a cleanup function.
 */
export function initAutocomplete(
  input: HTMLInputElement,
  onPlaceSelected: (place: { address: string; lat: number; lng: number }) => void,
) {
  const g = (window as any).google;
  if (!g?.maps?.places) return () => {};

  const autocompleteService = new g.maps.places.AutocompleteService();
  const placesService = new g.maps.places.PlacesService(document.createElement('div'));
  const geocoder = new g.maps.Geocoder();
  let sessionToken = new g.maps.places.AutocompleteSessionToken();

  const dropdown = document.createElement('div');
  dropdown.setAttribute('role', 'listbox');
  dropdown.className = 'eggok-gm-suggestions';
  dropdown.style.cssText =
    'position:absolute;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:10000;overflow:hidden;display:none;' +
    'max-height:280px;overflow-y:auto;font-family:inherit;';
  document.body.appendChild(dropdown);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastQuery = '';
  let currentRequestId = 0;

  const positionDropdown = () => {
    const rect = input.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
  };

  const hide = () => { dropdown.style.display = 'none'; };
  const show = () => { positionDropdown(); dropdown.style.display = 'block'; };

  // Geocode the raw typed text used as a fallback so the user can always proceed
  // even when Places returns no predictions or is denied/limited.
  const selectByGeocode = (text: string) => {
    geocoder.geocode({ address: text, componentRestrictions: { country: 'US' } }, (results: any[] | null, status: any) => {
      if (status === 'OK' && results && results[0]?.geometry?.location) {
        const r = results[0];
        const address = r.formatted_address || text;
        input.value = address;
        onPlaceSelected({
          address,
          lat: r.geometry.location.lat(),
          lng: r.geometry.location.lng(),
        });
      } else {
        console.warn('[gmaps] geocode failed:', status, 'for', text);
      }
      hide();
    });
  };

  const buildItem = (label: string, sublabel: string | null, onSelect: () => void, isFirst: boolean) => {
    const item = document.createElement('div');
    item.setAttribute('role', 'option');
    item.style.cssText =
      'padding:10px 14px;cursor:pointer;font-size:16px;color:#1A1A1A;' +
      `border-top:${isFirst ? 'none' : '1px solid #F0F0F0'};`;
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    item.innerHTML = sublabel
      ? `<div style="font-weight:600;line-height:1.3;">${escape(label)}</div>` +
        `<div style="font-size:12px;color:#777;margin-top:2px;">${escape(sublabel)}</div>`
      : `<div>${escape(label)}</div>`;
    item.addEventListener('mouseenter', () => { item.style.background = '#F5F5F5'; });
    item.addEventListener('mouseleave', () => { item.style.background = ''; });
    item.addEventListener('mousedown', (e) => { e.preventDefault(); onSelect(); });
    return item;
  };

  const render = (predictions: any[] | null, query: string) => {
    dropdown.innerHTML = '';
    const items: HTMLElement[] = [];

    (predictions || []).slice(0, 5).forEach((p: any, i: number) => {
      const main = p.structured_formatting?.main_text || p.description;
      const secondary = p.structured_formatting?.secondary_text || null;
      items.push(buildItem(main, secondary, () => {
        placesService.getDetails(
          { placeId: p.place_id, fields: ['formatted_address', 'geometry'], sessionToken },
          (place: any, status: any) => {
            if (status === g.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
              const address = place.formatted_address || p.description;
              input.value = address;
              onPlaceSelected({
                address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
              sessionToken = new g.maps.places.AutocompleteSessionToken();
              hide();
            } else {
              console.warn('[gmaps] getDetails failed:', status, '— falling back to geocode');
              selectByGeocode(p.description);
            }
          },
        );
      }, i === 0));
    });

    // Always-visible fallback row so the user can proceed even if Places returned
    // ZERO_RESULTS or was denied. Geocoder resolves the typed text to lat/lng.
    if (query.length >= 2) {
      items.push(buildItem(
        `Use “${query}”`,
        'Search this exact address',
        () => selectByGeocode(query),
        items.length === 0,
      ));
    }

    if (items.length === 0) { hide(); return; }
    items.forEach(it => dropdown.appendChild(it));
    show();
  };

  const fetchPredictions = (query: string) => {
    if (!query || query.length < 2) { hide(); return; }
    const reqId = ++currentRequestId;
    autocompleteService.getPlacePredictions(
      { input: query, componentRestrictions: { country: 'us' }, sessionToken },
      (predictions: any[] | null, status: any) => {
        if (reqId !== currentRequestId) return; // out-of-order
        const PS = g.maps.places.PlacesServiceStatus;
        if (status && status !== PS.OK && status !== PS.ZERO_RESULTS) {
          console.error('[gmaps] AutocompleteService failed:', status, '— check Google Cloud key, billing, Places API enabled, and HTTP referer restrictions for this domain');
        }
        render(predictions, query);
      },
    );
  };

  const onInput = () => {
    const value = input.value.trim();
    if (value === lastQuery) return;
    lastQuery = value;
    if (debounceTimer) clearTimeout(debounceTimer);
    // 80ms feels instant to humans; still coalesces rapid keystrokes into one request.
    debounceTimer = setTimeout(() => fetchPredictions(value), 80);
  };

  const onFocus = () => {
    if (lastQuery.length >= 2) fetchPredictions(lastQuery);
  };

  const onBlur = () => {
    // Delay so mousedown on a suggestion can run first.
    setTimeout(hide, 180);
  };

  input.addEventListener('input', onInput);
  input.addEventListener('focus', onFocus);
  input.addEventListener('blur', onBlur);
  window.addEventListener('resize', positionDropdown);
  window.addEventListener('scroll', positionDropdown, true);

  // Critical: if the user typed while the Maps script was still loading, their text is already
  // in the input by the time we attach. Fetch immediately for that text so suggestions appear
  // without requiring another keystroke.
  if (input.value.trim().length >= 2) {
    lastQuery = input.value.trim();
    fetchPredictions(lastQuery);
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    input.removeEventListener('input', onInput);
    input.removeEventListener('focus', onFocus);
    input.removeEventListener('blur', onBlur);
    window.removeEventListener('resize', positionDropdown);
    window.removeEventListener('scroll', positionDropdown, true);
    dropdown.remove();
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
