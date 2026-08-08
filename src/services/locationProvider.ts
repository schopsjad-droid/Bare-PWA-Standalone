/**
 * Location provider service for Bare PWA.
 * Uses the centralized Syrian location dataset as primary source.
 * Geoapify is only called for locations NOT in the canonical dataset.
 */
import { MAP_CONFIG } from '../config/maps';
import { searchCanonicalLocations, ALL_LOCATIONS, type SyrianLocation } from '../data/syrianLocations';

export interface LocationSuggestion {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  governorate?: string;
  city?: string;
  area?: string;
}

// ========================================
// Local Syrian locations from centralized dataset
// ========================================

/**
 * Convert canonical SyrianLocation to LocationSuggestion
 */
function canonicalToSuggestion(loc: SyrianLocation): LocationSuggestion {
  return {
    id: loc.id,
    label: loc.type === 'governorate' ? loc.name : `${loc.name} – ${loc.governorateName}`,
    latitude: loc.lat,
    longitude: loc.lng,
    governorate: loc.governorateName,
    city: loc.type !== 'governorate' ? loc.name : undefined,
  };
}

/**
 * Search local Syrian locations from canonical dataset (no API call needed)
 */
function searchLocalLocations(query: string): LocationSuggestion[] {
  const results = searchCanonicalLocations(query);
  return results.map(canonicalToSuggestion).slice(0, MAP_CONFIG.autocompleteMaxResults);
}

// ========================================
// Geoapify Autocomplete
// ========================================
let abortController: AbortController | null = null;

/**
 * Search locations using Geoapify Autocomplete API.
 * Falls back gracefully if API is unavailable.
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const q = query.trim();
  if (q.length < MAP_CONFIG.autocompleteMinChars) return [];

  // 1. Always check local results first (free)
  const localResults = searchLocalLocations(q);

  // 2. If maps not enabled or no API key, return local only
  if (!MAP_CONFIG.enabled) return localResults;

  // 3. If local results are sufficient, skip API call
  if (localResults.length >= MAP_CONFIG.autocompleteMaxResults) return localResults;

  // 4. Call Geoapify for additional results
  try {
    // Cancel any pending request
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const params = new URLSearchParams({
      text: q,
      apiKey: MAP_CONFIG.apiKey,
      lang: MAP_CONFIG.autocompleteLang,
      filter: `countrycode:${MAP_CONFIG.autocompleteCountryFilter}`,
      limit: String(MAP_CONFIG.autocompleteMaxResults),
      type: 'city,district,suburb,neighbourhood,street,locality',
    });

    const response = await fetch(`${MAP_CONFIG.autocompleteUrl}?${params}`, {
      signal: abortController.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn('[LocationProvider] Geoapify returned', response.status);
      return localResults;
    }

    const data = await response.json();
    const apiResults: LocationSuggestion[] = (data.features || []).map((f: any) => ({
      id: `geoapify-${f.properties.place_id || Math.random()}`,
      label: f.properties.formatted || f.properties.name || '',
      latitude: f.properties.lat,
      longitude: f.properties.lon,
      governorate: f.properties.state || '',
      city: f.properties.city || f.properties.town || '',
      area: f.properties.suburb || f.properties.district || '',
    }));

    // Merge: local first, then API results (deduplicated)
    const merged = [...localResults];
    const existingLabels = new Set(localResults.map(r => r.label));
    for (const r of apiResults) {
      if (!existingLabels.has(r.label)) {
        merged.push(r);
        existingLabels.add(r.label);
      }
    }
    return merged.slice(0, MAP_CONFIG.autocompleteMaxResults);

  } catch (e: any) {
    if (e.name === 'AbortError') return localResults;
    console.warn('[LocationProvider] Autocomplete error:', e.message);
    return localResults;
  }
}

/**
 * Reverse geocode coordinates to a readable label.
 * Used sparingly — only after explicit user action.
 */
const reverseGeocodeCache = new Map<string, string>();

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (reverseGeocodeCache.has(cacheKey)) return reverseGeocodeCache.get(cacheKey)!;

  if (!MAP_CONFIG.enabled) {
    // Fallback: find nearest known location
    return findNearestLocalLabel(lat, lng);
  }

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      apiKey: MAP_CONFIG.apiKey,
      lang: MAP_CONFIG.autocompleteLang,
    });

    const response = await fetch(`${MAP_CONFIG.reverseGeocodeUrl}?${params}`, {
      signal: AbortSignal.timeout(MAP_CONFIG.requestTimeoutMs),
    });

    if (!response.ok) return findNearestLocalLabel(lat, lng);

    const data = await response.json();
    const feature = data.features?.[0]?.properties;
    if (!feature) return findNearestLocalLabel(lat, lng);

    const label = feature.city || feature.town || feature.state || feature.formatted || '';
    const result = label || findNearestLocalLabel(lat, lng);
    reverseGeocodeCache.set(cacheKey, result);
    return result;

  } catch {
    return findNearestLocalLabel(lat, lng);
  }
}

/**
 * Find the nearest known local location label
 */
function findNearestLocalLabel(lat: number, lng: number): string {
  let nearest = '';
  let minDist = Infinity;

  for (const loc of ALL_LOCATIONS) {
    if (loc.type !== 'governorate') continue;
    const d = Math.sqrt((loc.lat - lat) ** 2 + (loc.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = loc.name;
    }
  }

  return nearest || 'سوريا';
}

/**
 * Check if the map provider is available and configured
 */
export function isMapProviderAvailable(): boolean {
  return MAP_CONFIG.enabled;
}
