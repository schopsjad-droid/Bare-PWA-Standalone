/**
 * Central map and location provider configuration for Bare PWA.
 * All Geoapify URLs and settings are centralized here.
 * To replace Geoapify, only this file and locationProvider.ts need changes.
 */

// ========================================
// Environment
// ========================================
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';
const MAPS_ENABLED = import.meta.env.VITE_MAPS_ENABLED !== 'false'; // default true

// ========================================
// Provider Configuration
// ========================================
export const MAP_CONFIG = {
  enabled: MAPS_ENABLED && !!GEOAPIFY_API_KEY,
  apiKey: GEOAPIFY_API_KEY,

  // Tile layer
  tileUrl: `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
  tileAttribution: '© <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  maxZoom: 18,

  // Autocomplete
  autocompleteUrl: 'https://api.geoapify.com/v1/geocode/autocomplete',
  reverseGeocodeUrl: 'https://api.geoapify.com/v1/geocode/reverse',

  // Defaults
  defaultCenter: [35.0, 38.0] as [number, number], // Syria center [lat, lng]
  defaultZoom: 6,
  minRadius: 1,
  maxRadius: 100,
  defaultRadius: 25,

  // Autocomplete settings
  autocompleteDebounceMs: 500,
  autocompleteMinChars: 3,
  autocompleteMaxResults: 5,
  autocompleteCountryFilter: 'sy', // Syria
  autocompleteLang: 'ar',

  // Timeouts
  requestTimeoutMs: 8000,
  maxRetries: 2,
} as const;

// ========================================
// Quick radius selections
// ========================================
export const RADIUS_QUICK_OPTIONS = [5, 10, 25, 50, 100]; // km
