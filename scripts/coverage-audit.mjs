import { readFileSync } from 'fs';

// Read the dataset source
const ts = readFileSync('src/data/syrianLocations.ts', 'utf8');

// Extract all location entries
const regex = /\{ id: '([^']+)', name: '([^']+)',.*?lat: ([\d.]+), lng: ([\d.]+)/g;
const locations = [];
let match;
while ((match = regex.exec(ts)) !== null) {
  locations.push({ id: match[1], name: match[2], lat: parseFloat(match[3]), lng: parseFloat(match[4]) });
}

// The selectable cities in the app (from categories.ts SYRIAN_CITIES)
const selectableCities = [
  'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'دير الزور', 'الرقة', 'إدلب', 'الحسكة', 'القامشلي',
  'درعا', 'السويداء', 'القنيطرة'
];

console.log('=== COVERAGE AUDIT ===');
console.log('Total locations in dataset:', locations.length);

const govs = locations.filter(l => l.id.startsWith('gov-'));
const nonGovs = locations.filter(l => l.id.startsWith('city-'));
console.log('Governorates:', govs.length);
console.log('Cities/Towns/Districts:', nonGovs.length);
console.log('');

let missing = 0;
let valid = 0;
for (const city of selectableCities) {
  const found = locations.find(l => l.name === city);
  if (found) {
    valid++;
    console.log(`[OK] ${city} → ${found.id} (${found.lat}, ${found.lng})`);
  } else {
    missing++;
    console.log(`[MISSING] ${city} — NOT FOUND IN DATASET`);
  }
}

console.log('');
console.log('=== COORDINATE VALIDATION ===');
// Syria bounding box: lat 32-38, lng 35-43
const suspicious = locations.filter(l => l.lat < 32 || l.lat > 38 || l.lng < 35 || l.lng > 43);
if (suspicious.length > 0) {
  console.log('[WARNING] Locations with coordinates outside Syria bounding box:');
  suspicious.forEach(l => console.log(`  ${l.name}: ${l.lat}, ${l.lng}`));
} else {
  console.log('[OK] All coordinates within Syria bounding box (32-38N, 35-43E)');
}

console.log('');
console.log('=== RESULT ===');
console.log('Selectable cities checked:', selectableCities.length);
console.log('Valid (with coordinates):', valid);
console.log('Missing:', missing);

if (missing > 0) {
  console.log('');
  console.log('ERROR: Some selectable locations are missing from the dataset!');
  process.exit(1);
} else {
  console.log('');
  console.log('SUCCESS: Every selectable Bare location has valid coordinates.');
}
