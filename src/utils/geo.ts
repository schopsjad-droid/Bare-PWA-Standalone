/**
 * Geo utility functions for Bare PWA
 * Uses geofire-common for geohash generation and distance calculations
 */
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

// ========================================
// Types
// ========================================
export type LocationPrecision = 'approximate' | 'exact';
export type LocationSource = 'map' | 'device' | 'legacy';
export type ListingStatus = 'available' | 'reserved' | 'sold';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  geohash: string;
  governorate: string;
  city: string;
  area?: string;
  locationPrecision: LocationPrecision;
  locationSource: LocationSource;
}

export interface SearchCenter {
  latitude: number;
  longitude: number;
}

// ========================================
// Constants
// ========================================
export const SYRIA_CENTER: [number, number] = [35.0, 38.0]; // [lat, lng]
export const SYRIA_BOUNDS = { north: 37.5, south: 32.3, east: 42.5, west: 35.5 };
export const DEFAULT_ZOOM = 6;
export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]; // km

export const STATUS_LABELS: Record<ListingStatus, string> = {
  available: 'متاح',
  reserved: 'محجوز',
  sold: 'مباع'
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  available: 'var(--bare-green)',
  reserved: '#f59e0b',
  sold: '#ef4444'
};

// ========================================
// Coordinate Privacy
// ========================================

/**
 * Round coordinates to ~1.1km precision (2 decimal places)
 * This prevents exposing exact home locations
 */
export function roundCoordinates(lat: number, lng: number): [number, number] {
  return [
    Math.round(lat * 100) / 100,
    Math.round(lng * 100) / 100
  ];
}

/**
 * Get public coordinates based on precision setting
 */
export function getPublicCoordinates(
  lat: number, lng: number, precision: LocationPrecision
): [number, number] {
  if (precision === 'exact') return [lat, lng];
  return roundCoordinates(lat, lng);
}

// ========================================
// Geohash Functions
// ========================================

/**
 * Generate geohash from coordinates
 */
export function generateGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

/**
 * Get geohash query bounds for a center point and radius
 */
export function getGeohashBounds(center: [number, number], radiusKm: number) {
  return geohashQueryBounds(center, radiusKm * 1000); // Convert km to meters
}

/**
 * Calculate distance between two points in km
 */
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  return distanceBetween(point1, point2);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} م`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} كم`;
  return `${Math.round(distanceKm)} كم`;
}

// ========================================
// Validation
// ========================================

export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: number): boolean {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}
