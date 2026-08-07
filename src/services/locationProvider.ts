/**
 * Location provider service for Bare PWA.
 * Abstracts Geoapify calls behind a clean interface.
 * Replace this file to switch providers without touching UI code.
 */
import { MAP_CONFIG } from '../config/maps';

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
// Local Syrian locations (free, no API call)
// ========================================
const SYRIAN_GOVERNORATES: { name: string; lat: number; lng: number }[] = [
  { name: 'دمشق', lat: 33.5138, lng: 36.2765 },
  { name: 'ريف دمشق', lat: 33.5, lng: 36.4 },
  { name: 'حلب', lat: 36.2021, lng: 37.1343 },
  { name: 'حمص', lat: 34.7324, lng: 36.7137 },
  { name: 'حماة', lat: 35.1318, lng: 36.7518 },
  { name: 'اللاذقية', lat: 35.5317, lng: 35.7918 },
  { name: 'طرطوس', lat: 34.8894, lng: 35.8866 },
  { name: 'دير الزور', lat: 35.3359, lng: 40.1408 },
  { name: 'الرقة', lat: 35.9528, lng: 39.0079 },
  { name: 'إدلب', lat: 35.9306, lng: 36.6339 },
  { name: 'الحسكة', lat: 36.5026, lng: 40.7440 },
  { name: 'القامشلي', lat: 37.0503, lng: 41.2262 },
  { name: 'درعا', lat: 32.6189, lng: 36.1021 },
  { name: 'السويداء', lat: 32.7093, lng: 36.5662 },
  { name: 'القنيطرة', lat: 33.1260, lng: 35.8244 },
];

const SYRIAN_CITIES: { name: string; governorate: string; lat: number; lng: number }[] = [
  { name: 'المزة', governorate: 'دمشق', lat: 33.4977, lng: 36.2477 },
  { name: 'المالكي', governorate: 'دمشق', lat: 33.5150, lng: 36.2900 },
  { name: 'أبو رمانة', governorate: 'دمشق', lat: 33.5180, lng: 36.2830 },
  { name: 'الشعلان', governorate: 'دمشق', lat: 33.5120, lng: 36.2880 },
  { name: 'كفرسوسة', governorate: 'دمشق', lat: 33.4950, lng: 36.2700 },
  { name: 'المهاجرين', governorate: 'دمشق', lat: 33.5250, lng: 36.2900 },
  { name: 'الصالحية', governorate: 'دمشق', lat: 33.5200, lng: 36.2950 },
  { name: 'جرمانا', governorate: 'ريف دمشق', lat: 33.4833, lng: 36.3500 },
  { name: 'صحنايا', governorate: 'ريف دمشق', lat: 33.4500, lng: 36.2333 },
  { name: 'داريا', governorate: 'ريف دمشق', lat: 33.4600, lng: 36.2300 },
  { name: 'العزيزية', governorate: 'حلب', lat: 36.1900, lng: 37.1500 },
  { name: 'الحمدانية', governorate: 'حلب', lat: 36.1100, lng: 37.1200 },
  { name: 'السليمانية', governorate: 'حلب', lat: 36.2100, lng: 37.1600 },
  { name: 'الفرقان', governorate: 'حلب', lat: 36.1950, lng: 37.1400 },
  { name: 'الإنشاءات', governorate: 'حمص', lat: 34.7400, lng: 36.7200 },
  { name: 'الوعر', governorate: 'حمص', lat: 34.7500, lng: 36.6700 },
  { name: 'جبلة', governorate: 'اللاذقية', lat: 35.3600, lng: 35.9200 },
  { name: 'بانياس', governorate: 'طرطوس', lat: 35.1800, lng: 35.9500 },
];

/**
 * Search local Syrian locations (no API call needed)
 */
function searchLocalLocations(query: string): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: LocationSuggestion[] = [];

  // Search governorates
  for (const gov of SYRIAN_GOVERNORATES) {
    if (gov.name.includes(q) || gov.name.toLowerCase().includes(q)) {
      results.push({
        id: `local-gov-${gov.name}`,
        label: gov.name,
        latitude: gov.lat,
        longitude: gov.lng,
        governorate: gov.name,
      });
    }
  }

  // Search cities
  for (const city of SYRIAN_CITIES) {
    if (city.name.includes(q) || city.governorate.includes(q)) {
      results.push({
        id: `local-city-${city.name}-${city.governorate}`,
        label: `${city.name} – ${city.governorate}`,
        latitude: city.lat,
        longitude: city.lng,
        governorate: city.governorate,
        city: city.name,
      });
    }
  }

  return results.slice(0, MAP_CONFIG.autocompleteMaxResults);
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

  for (const gov of SYRIAN_GOVERNORATES) {
    const d = Math.sqrt((gov.lat - lat) ** 2 + (gov.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = gov.name;
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
