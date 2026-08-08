/**
 * Idempotent geo migration script for Bare PWA.
 *
 * Repairs existing advertisements that:
 * - have a city field recognizable by the canonical Syrian location dataset
 * - but are missing valid latitude/longitude/geohash
 *
 * Does NOT modify ads that already have valid geo coordinates.
 * Does NOT modify title, description, price, owner, images, status, listingStatus, createdAt.
 *
 * Usage: node scripts/migrate-geo.mjs
 * Requires: FIREBASE_SERVICE_ACCOUNT_KEY env var or firebase-admin credentials
 *
 * For local testing without admin SDK, this script outputs what WOULD be updated.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ============================================================
// Inline canonical dataset (same as src/data/syrianLocations.ts)
// Duplicated here because this is a standalone Node.js script
// ============================================================

const LOCATIONS = [
  // Governorates
  { id: 'gov-damascus', name: 'دمشق', lat: 33.5138, lng: 36.2765 },
  { id: 'gov-rif-dimashq', name: 'ريف دمشق', lat: 33.5000, lng: 36.4000 },
  { id: 'gov-aleppo', name: 'حلب', lat: 36.2021, lng: 37.1343 },
  { id: 'gov-homs', name: 'حمص', lat: 34.7324, lng: 36.7137 },
  { id: 'gov-hama', name: 'حماة', lat: 35.1318, lng: 36.7518 },
  { id: 'gov-latakia', name: 'اللاذقية', lat: 35.5317, lng: 35.7918 },
  { id: 'gov-tartous', name: 'طرطوس', lat: 34.8894, lng: 35.8866 },
  { id: 'gov-deir-ez-zor', name: 'دير الزور', lat: 35.3359, lng: 40.1408 },
  { id: 'gov-raqqa', name: 'الرقة', lat: 35.9528, lng: 39.0079 },
  { id: 'gov-idlib', name: 'إدلب', lat: 35.9306, lng: 36.6339 },
  { id: 'gov-hasakah', name: 'الحسكة', lat: 36.5026, lng: 40.7440 },
  { id: 'gov-daraa', name: 'درعا', lat: 32.6189, lng: 36.1021 },
  { id: 'gov-suwayda', name: 'السويداء', lat: 32.7093, lng: 36.5662 },
  { id: 'gov-quneitra', name: 'القنيطرة', lat: 33.1260, lng: 35.8244 },
  // Cities (subset matching SYRIAN_CITIES in categories.ts)
  { id: 'city-qamishli', name: 'القامشلي', lat: 37.0503, lng: 41.2262 },
];

// Alternate spellings
const ALTERNATES = {
  'القامشلي': 'القامشلي', 'قامشلي': 'القامشلي', 'قامشلو': 'القامشلي',
  'اللاذقيه': 'اللاذقية', 'اللاذقيّة': 'اللاذقية',
  'حلب الشهباء': 'حلب', 'الشام': 'دمشق', 'دمشق الشام': 'دمشق',
  'ادلب': 'إدلب', 'الرقه': 'الرقة',
  'السويدا': 'السويداء', 'السويدأ': 'السويداء',
  'ديرالزور': 'دير الزور', 'دير ازور': 'دير الزور',
  'الحسكه': 'الحسكة',
};

function resolveCity(name) {
  if (!name) return null;
  const n = name.trim();
  // Direct match
  const direct = LOCATIONS.find(l => l.name === n);
  if (direct) return direct;
  // Alternate
  const canonical = ALTERNATES[n];
  if (canonical) return LOCATIONS.find(l => l.name === canonical) || null;
  return null;
}

// Simple geohash (using geofire-common algorithm inline for standalone script)
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

    if (val > mid) {
      ch |= (1 << (4 - bit));
      range[0] = mid;
    } else {
      range[1] = mid;
    }

    isEven = !isEven;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  // Initialize Firebase Admin
  let app;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp();
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({ credential: cert(key) });
  } else {
    console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY');
    process.exit(1);
  }

  const firestore = getFirestore(app);
  const adsRef = firestore.collection('ads');

  console.log(`[migrate-geo] Starting ${dryRun ? 'DRY RUN' : 'LIVE'} migration...`);

  const snapshot = await adsRef.get();
  let total = 0;
  let skipped = 0;
  let repaired = 0;
  let unresolvable = 0;

  const batch = firestore.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    total++;
    const data = doc.data();

    // Skip ads that already have valid geo coordinates
    if (data.latitude && data.longitude && data.geohash) {
      skipped++;
      continue;
    }

    // Try to resolve from city field
    const cityName = data.city;
    const resolved = resolveCity(cityName);

    if (!resolved) {
      unresolvable++;
      if (cityName) {
        console.log(`  [UNRESOLVABLE] Ad ${doc.id}: city="${cityName}" not in dataset`);
      }
      continue;
    }

    const geohash = geohashForLocation(resolved.lat, resolved.lng);

    const updateFields = {
      latitude: resolved.lat,
      longitude: resolved.lng,
      geohash: geohash,
      locationPrecision: 'approximate',
      locationSource: 'location-selection-migration',
      locationId: resolved.id,
    };

    if (dryRun) {
      console.log(`  [WOULD REPAIR] Ad ${doc.id}: city="${cityName}" → ${resolved.name} (${resolved.lat}, ${resolved.lng})`);
    } else {
      batch.update(doc.ref, updateFields);
      batchCount++;

      // Firestore batch limit is 500
      if (batchCount >= 450) {
        await batch.commit();
        batchCount = 0;
        console.log(`  [BATCH COMMITTED] ${repaired + batchCount} ads repaired so far...`);
      }
    }

    repaired++;
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n[migrate-geo] RESULTS:`);
  console.log(`  Total ads:       ${total}`);
  console.log(`  Already valid:   ${skipped}`);
  console.log(`  Repaired:        ${repaired}`);
  console.log(`  Unresolvable:    ${unresolvable}`);
  console.log(`  Mode:            ${dryRun ? 'DRY RUN (no changes written)' : 'LIVE (changes committed)'}`);
}

main().catch(err => {
  console.error('[migrate-geo] Fatal error:', err);
  process.exit(1);
});
