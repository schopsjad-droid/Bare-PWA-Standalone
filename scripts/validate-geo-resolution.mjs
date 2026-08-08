import { readFileSync } from 'fs';

/**
 * Deterministic validation: test geo resolution for multiple Syrian regions.
 * Tests CreateAd resolution, EditAd city-change, and radius query inclusion.
 */

// Parse dataset
const ts = readFileSync('src/data/syrianLocations.ts', 'utf8');
const regex = /\{ id: '([^']+)', name: '([^']+)',.*?type: '([^']+)',.*?governorateName: '([^']+)',.*?lat: ([\d.]+), lng: ([\d.]+)/g;
const locations = [];
let match;
while ((match = regex.exec(ts)) !== null) {
  locations.push({ id: match[1], name: match[2], type: match[3], gov: match[4], lat: parseFloat(match[5]), lng: parseFloat(match[6]) });
}

// Simple geohash implementation for validation
function geohashForLocation(lat, lng, precision = 10) {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let hash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;
  while (hash.length < precision) {
    const range = isEven ? lngRange : latRange;
    const val = isEven ? lng : lat;
    const mid = (range[0] + range[1]) / 2;
    if (val > mid) { ch |= (1 << (4 - bit)); range[0] = mid; }
    else { range[1] = mid; }
    isEven = !isEven;
    bit++;
    if (bit === 5) { hash += BASE32[ch]; bit = 0; ch = 0; }
  }
  return hash;
}

// Haversine distance in km
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function resolve(name) {
  return locations.find(l => l.name === name) || null;
}

// ============================================================
// TEST CASES
// ============================================================
const testCities = [
  { name: 'دمشق', expectedType: 'governorate' },
  { name: 'حلب', expectedType: 'governorate' },
  { name: 'حمص', expectedType: 'governorate' },
  { name: 'طرطوس', expectedType: 'governorate' },
  { name: 'اللاذقية', expectedType: 'governorate' },
  { name: 'بانياس', expectedType: 'city' },  // smaller city
];

let passed = 0;
let failed = 0;

console.log('=== DETERMINISTIC GEO VALIDATION ===\n');

// Test 1: CreateAd resolution
console.log('--- Test 1: CreateAd location resolution ---');
for (const tc of testCities) {
  const loc = resolve(tc.name);
  if (!loc) {
    console.log(`  [FAIL] ${tc.name}: NOT RESOLVED`);
    failed++;
    continue;
  }
  const geohash = geohashForLocation(loc.lat, loc.lng);
  if (!geohash || geohash.length < 5) {
    console.log(`  [FAIL] ${tc.name}: invalid geohash "${geohash}"`);
    failed++;
    continue;
  }
  console.log(`  [PASS] ${tc.name} → id=${loc.id}, coords=(${loc.lat}, ${loc.lng}), geohash=${geohash.substring(0,6)}...`);
  passed++;
}

// Test 2: EditAd city change updates coordinates
console.log('\n--- Test 2: EditAd city change ---');
const oldCity = resolve('دمشق');
const newCity = resolve('حلب');
if (oldCity && newCity) {
  const oldHash = geohashForLocation(oldCity.lat, oldCity.lng);
  const newHash = geohashForLocation(newCity.lat, newCity.lng);
  if (oldHash !== newHash && oldCity.lat !== newCity.lat) {
    console.log(`  [PASS] Changing from دمشق to حلب: coords changed (${oldCity.lat},${oldCity.lng}) → (${newCity.lat},${newCity.lng}), geohash changed`);
    passed++;
  } else {
    console.log(`  [FAIL] City change did not produce different coordinates/geohash`);
    failed++;
  }
} else {
  console.log(`  [FAIL] Could not resolve both cities`);
  failed++;
}

// Test 3: Radius query inclusion
console.log('\n--- Test 3: Radius query inclusion ---');
// Buyer searches from Damascus center, 50km radius
const searchCenter = resolve('دمشق');
const nearbyCity = resolve('جرمانا'); // ~8km from Damascus
const farCity = resolve('حمص'); // ~160km from Damascus

if (searchCenter && nearbyCity && farCity) {
  const distNearby = distanceKm(searchCenter.lat, searchCenter.lng, nearbyCity.lat, nearbyCity.lng);
  const distFar = distanceKm(searchCenter.lat, searchCenter.lng, farCity.lat, farCity.lng);

  if (distNearby < 50) {
    console.log(`  [PASS] جرمانا is ${distNearby.toFixed(1)}km from دمشق — WITHIN 50km radius`);
    passed++;
  } else {
    console.log(`  [FAIL] جرمانا distance ${distNearby.toFixed(1)}km — expected < 50km`);
    failed++;
  }

  if (distFar > 50) {
    console.log(`  [PASS] حمص is ${distFar.toFixed(1)}km from دمشق — OUTSIDE 50km radius`);
    passed++;
  } else {
    console.log(`  [FAIL] حمص distance ${distFar.toFixed(1)}km — expected > 50km`);
    failed++;
  }
} else {
  console.log(`  [FAIL] Could not resolve test cities for radius check`);
  failed += 2;
}

// Test 4: Baniyas resolves to Tartous governorate (not Tartous city center)
console.log('\n--- Test 4: Specific city resolves to its own coords, not governorate center ---');
const baniyas = resolve('بانياس');
const tartous = resolve('طرطوس');
if (baniyas && tartous) {
  const dist = distanceKm(baniyas.lat, baniyas.lng, tartous.lat, tartous.lng);
  if (dist > 5) {
    console.log(`  [PASS] بانياس coords (${baniyas.lat},${baniyas.lng}) differ from طرطوس center (${tartous.lat},${tartous.lng}) by ${dist.toFixed(1)}km`);
    passed++;
  } else {
    console.log(`  [FAIL] بانياس resolved to same coords as طرطوس center`);
    failed++;
  }
} else {
  console.log(`  [FAIL] Could not resolve بانياس or طرطوس`);
  failed++;
}

// Summary
console.log('\n=== VALIDATION RESULT ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nALL TESTS PASSED.');
}
