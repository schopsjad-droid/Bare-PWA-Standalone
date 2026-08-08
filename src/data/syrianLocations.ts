/**
 * Centralized canonical Syrian location dataset.
 * Single source of truth for ALL location resolution in Bare.
 *
 * Every selectable location has:
 * - stable ID (slug-based, never changes)
 * - Arabic display name
 * - type: governorate | city | town | district | locality
 * - governorateId (self-reference for governorates)
 * - parentId (for cities/towns → their governorate)
 * - latitude / longitude (approximate geographic center)
 *
 * DO NOT scatter coordinates in React components.
 * All location resolution must go through this dataset.
 */

export type LocationType = 'governorate' | 'city' | 'town' | 'district' | 'locality';

export interface SyrianLocation {
  id: string;
  name: string;
  type: LocationType;
  governorateId: string;
  governorateName: string;
  parentId?: string;
  lat: number;
  lng: number;
}

// ============================================================
// GOVERNORATES (14 official + Rif Dimashq)
// ============================================================
const GOVERNORATES: SyrianLocation[] = [
  { id: 'gov-damascus', name: 'دمشق', type: 'governorate', governorateId: 'gov-damascus', governorateName: 'دمشق', lat: 33.5138, lng: 36.2765 },
  { id: 'gov-rif-dimashq', name: 'ريف دمشق', type: 'governorate', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', lat: 33.5000, lng: 36.4000 },
  { id: 'gov-aleppo', name: 'حلب', type: 'governorate', governorateId: 'gov-aleppo', governorateName: 'حلب', lat: 36.2021, lng: 37.1343 },
  { id: 'gov-homs', name: 'حمص', type: 'governorate', governorateId: 'gov-homs', governorateName: 'حمص', lat: 34.7324, lng: 36.7137 },
  { id: 'gov-hama', name: 'حماة', type: 'governorate', governorateId: 'gov-hama', governorateName: 'حماة', lat: 35.1318, lng: 36.7518 },
  { id: 'gov-latakia', name: 'اللاذقية', type: 'governorate', governorateId: 'gov-latakia', governorateName: 'اللاذقية', lat: 35.5317, lng: 35.7918 },
  { id: 'gov-tartous', name: 'طرطوس', type: 'governorate', governorateId: 'gov-tartous', governorateName: 'طرطوس', lat: 34.8894, lng: 35.8866 },
  { id: 'gov-deir-ez-zor', name: 'دير الزور', type: 'governorate', governorateId: 'gov-deir-ez-zor', governorateName: 'دير الزور', lat: 35.3359, lng: 40.1408 },
  { id: 'gov-raqqa', name: 'الرقة', type: 'governorate', governorateId: 'gov-raqqa', governorateName: 'الرقة', lat: 35.9528, lng: 39.0079 },
  { id: 'gov-idlib', name: 'إدلب', type: 'governorate', governorateId: 'gov-idlib', governorateName: 'إدلب', lat: 35.9306, lng: 36.6339 },
  { id: 'gov-hasakah', name: 'الحسكة', type: 'governorate', governorateId: 'gov-hasakah', governorateName: 'الحسكة', lat: 36.5026, lng: 40.7440 },
  { id: 'gov-daraa', name: 'درعا', type: 'governorate', governorateId: 'gov-daraa', governorateName: 'درعا', lat: 32.6189, lng: 36.1021 },
  { id: 'gov-suwayda', name: 'السويداء', type: 'governorate', governorateId: 'gov-suwayda', governorateName: 'السويداء', lat: 32.7093, lng: 36.5662 },
  { id: 'gov-quneitra', name: 'القنيطرة', type: 'governorate', governorateId: 'gov-quneitra', governorateName: 'القنيطرة', lat: 33.1260, lng: 35.8244 },
];

// ============================================================
// CITIES & TOWNS (organized by governorate)
// ============================================================
const CITIES_AND_TOWNS: SyrianLocation[] = [
  // --- Damascus (دمشق) ---
  { id: 'city-mezzeh', name: 'المزة', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.4977, lng: 36.2477 },
  { id: 'city-malki', name: 'المالكي', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5150, lng: 36.2900 },
  { id: 'city-abu-rummaneh', name: 'أبو رمانة', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5180, lng: 36.2830 },
  { id: 'city-shaalan', name: 'الشعلان', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5120, lng: 36.2880 },
  { id: 'city-kafr-souseh', name: 'كفرسوسة', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.4950, lng: 36.2700 },
  { id: 'city-muhajirin', name: 'المهاجرين', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5250, lng: 36.2900 },
  { id: 'city-salihiyeh', name: 'الصالحية', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5200, lng: 36.2950 },
  { id: 'city-bab-touma', name: 'باب توما', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5130, lng: 36.3150 },
  { id: 'city-qassa', name: 'القصاع', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5170, lng: 36.3200 },
  { id: 'city-rukneddine', name: 'ركن الدين', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5350, lng: 36.3050 },
  { id: 'city-midan', name: 'الميدان', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.4900, lng: 36.3000 },
  { id: 'city-dummar', name: 'دمر', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5400, lng: 36.2200 },
  { id: 'city-mashrou-dummar', name: 'مشروع دمر', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5450, lng: 36.2100 },
  { id: 'city-barzeh', name: 'برزة', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5500, lng: 36.3200 },
  { id: 'city-qaboun', name: 'القابون', type: 'district', governorateId: 'gov-damascus', governorateName: 'دمشق', parentId: 'gov-damascus', lat: 33.5450, lng: 36.3350 },

  // --- Rif Dimashq (ريف دمشق) ---
  { id: 'city-jaramana', name: 'جرمانا', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.4833, lng: 36.3500 },
  { id: 'city-sahnaya', name: 'صحنايا', type: 'town', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.4500, lng: 36.2333 },
  { id: 'city-daraya', name: 'داريا', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.4600, lng: 36.2300 },
  { id: 'city-douma', name: 'دوما', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.5700, lng: 36.4000 },
  { id: 'city-harasta', name: 'حرستا', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.5600, lng: 36.3700 },
  { id: 'city-qudsaya', name: 'قدسيا', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.5400, lng: 36.1900 },
  { id: 'city-zabadani', name: 'الزبداني', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.7300, lng: 36.1000 },
  { id: 'city-yabroud', name: 'يبرود', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.9700, lng: 36.6600 },
  { id: 'city-nabk', name: 'النبك', type: 'city', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 34.0200, lng: 36.7300 },
  { id: 'city-sayyida-zainab', name: 'السيدة زينب', type: 'town', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.4500, lng: 36.3400 },
  { id: 'city-kisweh', name: 'الكسوة', type: 'town', governorateId: 'gov-rif-dimashq', governorateName: 'ريف دمشق', parentId: 'gov-rif-dimashq', lat: 33.3500, lng: 36.2400 },

  // --- Aleppo (حلب) ---
  { id: 'city-aziziyeh', name: 'العزيزية', type: 'district', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.1900, lng: 37.1500 },
  { id: 'city-hamdaniyeh', name: 'الحمدانية', type: 'district', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.1100, lng: 37.1200 },
  { id: 'city-sulaymaniyeh', name: 'السليمانية', type: 'district', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.2100, lng: 37.1600 },
  { id: 'city-furqan', name: 'الفرقان', type: 'district', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.1950, lng: 37.1400 },
  { id: 'city-shahba-aleppo', name: 'شهبا', type: 'district', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.2200, lng: 37.1200 },
  { id: 'city-manbij', name: 'منبج', type: 'city', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.5300, lng: 37.9600 },
  { id: 'city-al-bab', name: 'الباب', type: 'city', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.3700, lng: 37.5200 },
  { id: 'city-afrin', name: 'عفرين', type: 'city', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.5100, lng: 36.8700 },
  { id: 'city-azaz', name: 'أعزاز', type: 'city', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.5900, lng: 37.0500 },
  { id: 'city-jarablus', name: 'جرابلس', type: 'city', governorateId: 'gov-aleppo', governorateName: 'حلب', parentId: 'gov-aleppo', lat: 36.8200, lng: 38.0100 },

  // --- Homs (حمص) ---
  { id: 'city-inshaat', name: 'الإنشاءات', type: 'district', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.7400, lng: 36.7200 },
  { id: 'city-waer', name: 'الوعر', type: 'district', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.7500, lng: 36.6700 },
  { id: 'city-palmyra', name: 'تدمر', type: 'city', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.5600, lng: 38.2800 },
  { id: 'city-rastan', name: 'الرستن', type: 'city', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.9300, lng: 36.7300 },
  { id: 'city-talbiseh', name: 'تلبيسة', type: 'town', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.8400, lng: 36.7300 },
  { id: 'city-qusayr', name: 'القصير', type: 'city', governorateId: 'gov-homs', governorateName: 'حمص', parentId: 'gov-homs', lat: 34.5100, lng: 36.5800 },

  // --- Hama (حماة) ---
  { id: 'city-salamiyeh', name: 'السلمية', type: 'city', governorateId: 'gov-hama', governorateName: 'حماة', parentId: 'gov-hama', lat: 35.0100, lng: 37.0500 },
  { id: 'city-masyaf', name: 'مصياف', type: 'city', governorateId: 'gov-hama', governorateName: 'حماة', parentId: 'gov-hama', lat: 35.0600, lng: 36.3400 },
  { id: 'city-muhradeh', name: 'محردة', type: 'city', governorateId: 'gov-hama', governorateName: 'حماة', parentId: 'gov-hama', lat: 35.2500, lng: 36.5700 },
  { id: 'city-suqaylabiyah', name: 'السقيلبية', type: 'city', governorateId: 'gov-hama', governorateName: 'حماة', parentId: 'gov-hama', lat: 35.3900, lng: 36.3800 },

  // --- Latakia (اللاذقية) ---
  { id: 'city-jableh', name: 'جبلة', type: 'city', governorateId: 'gov-latakia', governorateName: 'اللاذقية', parentId: 'gov-latakia', lat: 35.3600, lng: 35.9200 },
  { id: 'city-qardaha', name: 'القرداحة', type: 'city', governorateId: 'gov-latakia', governorateName: 'اللاذقية', parentId: 'gov-latakia', lat: 35.4500, lng: 36.0700 },
  { id: 'city-haffa', name: 'الحفة', type: 'city', governorateId: 'gov-latakia', governorateName: 'اللاذقية', parentId: 'gov-latakia', lat: 35.5900, lng: 36.0400 },
  { id: 'city-kasab', name: 'كسب', type: 'town', governorateId: 'gov-latakia', governorateName: 'اللاذقية', parentId: 'gov-latakia', lat: 35.9200, lng: 35.9600 },

  // --- Tartous (طرطوس) ---
  { id: 'city-banias', name: 'بانياس', type: 'city', governorateId: 'gov-tartous', governorateName: 'طرطوس', parentId: 'gov-tartous', lat: 35.1800, lng: 35.9500 },
  { id: 'city-safita', name: 'صافيتا', type: 'city', governorateId: 'gov-tartous', governorateName: 'طرطوس', parentId: 'gov-tartous', lat: 34.8200, lng: 36.1200 },
  { id: 'city-dreikish', name: 'دريكيش', type: 'city', governorateId: 'gov-tartous', governorateName: 'طرطوس', parentId: 'gov-tartous', lat: 34.8900, lng: 36.1500 },
  { id: 'city-sheikh-badr', name: 'الشيخ بدر', type: 'town', governorateId: 'gov-tartous', governorateName: 'طرطوس', parentId: 'gov-tartous', lat: 34.9900, lng: 36.0800 },

  // --- Deir ez-Zor (دير الزور) ---
  { id: 'city-mayadin', name: 'الميادين', type: 'city', governorateId: 'gov-deir-ez-zor', governorateName: 'دير الزور', parentId: 'gov-deir-ez-zor', lat: 35.0200, lng: 40.4500 },
  { id: 'city-abu-kamal', name: 'البوكمال', type: 'city', governorateId: 'gov-deir-ez-zor', governorateName: 'دير الزور', parentId: 'gov-deir-ez-zor', lat: 34.4600, lng: 40.9200 },

  // --- Raqqa (الرقة) ---
  { id: 'city-tabqa', name: 'الطبقة', type: 'city', governorateId: 'gov-raqqa', governorateName: 'الرقة', parentId: 'gov-raqqa', lat: 35.8300, lng: 38.5500 },
  { id: 'city-tal-abyad', name: 'تل أبيض', type: 'city', governorateId: 'gov-raqqa', governorateName: 'الرقة', parentId: 'gov-raqqa', lat: 36.7000, lng: 38.9600 },

  // --- Idlib (إدلب) ---
  { id: 'city-maarat-numan', name: 'معرة النعمان', type: 'city', governorateId: 'gov-idlib', governorateName: 'إدلب', parentId: 'gov-idlib', lat: 35.6500, lng: 36.6700 },
  { id: 'city-ariha', name: 'أريحا', type: 'city', governorateId: 'gov-idlib', governorateName: 'إدلب', parentId: 'gov-idlib', lat: 35.8100, lng: 36.6100 },
  { id: 'city-jisr-shughour', name: 'جسر الشغور', type: 'city', governorateId: 'gov-idlib', governorateName: 'إدلب', parentId: 'gov-idlib', lat: 35.8100, lng: 36.3200 },
  { id: 'city-saraqib', name: 'سراقب', type: 'city', governorateId: 'gov-idlib', governorateName: 'إدلب', parentId: 'gov-idlib', lat: 35.8600, lng: 36.8000 },

  // --- Hasakah (الحسكة) ---
  { id: 'city-qamishli', name: 'القامشلي', type: 'city', governorateId: 'gov-hasakah', governorateName: 'الحسكة', parentId: 'gov-hasakah', lat: 37.0503, lng: 41.2262 },
  { id: 'city-ras-al-ayn', name: 'رأس العين', type: 'city', governorateId: 'gov-hasakah', governorateName: 'الحسكة', parentId: 'gov-hasakah', lat: 36.8500, lng: 40.0700 },
  { id: 'city-malikiyah', name: 'المالكية', type: 'city', governorateId: 'gov-hasakah', governorateName: 'الحسكة', parentId: 'gov-hasakah', lat: 37.1700, lng: 42.1400 },

  // --- Daraa (درعا) ---
  { id: 'city-nawa', name: 'نوى', type: 'city', governorateId: 'gov-daraa', governorateName: 'درعا', parentId: 'gov-daraa', lat: 32.8900, lng: 36.0500 },
  { id: 'city-sanamayn', name: 'الصنمين', type: 'city', governorateId: 'gov-daraa', governorateName: 'درعا', parentId: 'gov-daraa', lat: 33.0700, lng: 36.1800 },
  { id: 'city-jasim', name: 'جاسم', type: 'city', governorateId: 'gov-daraa', governorateName: 'درعا', parentId: 'gov-daraa', lat: 32.9900, lng: 36.0600 },
  { id: 'city-izra', name: 'إزرع', type: 'city', governorateId: 'gov-daraa', governorateName: 'درعا', parentId: 'gov-daraa', lat: 32.8600, lng: 36.2500 },

  // --- Suwayda (السويداء) ---
  { id: 'city-shahba', name: 'شهبا', type: 'city', governorateId: 'gov-suwayda', governorateName: 'السويداء', parentId: 'gov-suwayda', lat: 32.8500, lng: 36.6300 },
  { id: 'city-salkhad', name: 'صلخد', type: 'city', governorateId: 'gov-suwayda', governorateName: 'السويداء', parentId: 'gov-suwayda', lat: 32.4900, lng: 36.7100 },

  // --- Quneitra (القنيطرة) ---
  { id: 'city-fiq', name: 'فيق', type: 'town', governorateId: 'gov-quneitra', governorateName: 'القنيطرة', parentId: 'gov-quneitra', lat: 32.7800, lng: 35.7000 },
];

// ============================================================
// COMBINED DATASET
// ============================================================
export const ALL_LOCATIONS: SyrianLocation[] = [...GOVERNORATES, ...CITIES_AND_TOWNS];

// ============================================================
// LOOKUP INDEXES (built once at import time)
// ============================================================

/** Lookup by stable ID */
const byId = new Map<string, SyrianLocation>();

/** Lookup by Arabic name (may have multiple matches; returns first match) */
const byName = new Map<string, SyrianLocation>();

/** Lookup by name + governorate (for disambiguation) */
const byNameAndGov = new Map<string, SyrianLocation>();

/** All locations grouped by governorate ID */
const byGovernorate = new Map<string, SyrianLocation[]>();

// Build indexes
for (const loc of ALL_LOCATIONS) {
  byId.set(loc.id, loc);

  // Name index: first match wins (governorates before cities)
  if (!byName.has(loc.name)) {
    byName.set(loc.name, loc);
  }

  // Name+Gov composite key
  const compositeKey = `${loc.name}|${loc.governorateName}`;
  byNameAndGov.set(compositeKey, loc);

  // Group by governorate
  if (!byGovernorate.has(loc.governorateId)) {
    byGovernorate.set(loc.governorateId, []);
  }
  byGovernorate.get(loc.governorateId)!.push(loc);
}

// ============================================================
// ALTERNATE SPELLINGS (handle production data inconsistencies)
// ============================================================
const ALTERNATE_NAMES: Record<string, string> = {
  'القامشلي': 'القامشلي',     // already canonical
  'قامشلي': 'القامشلي',
  'قامشلو': 'القامشلي',
  'اللاذقيه': 'اللاذقية',
  'اللاذقيّة': 'اللاذقية',
  'طرطوس': 'طرطوس',
  'حلب الشهباء': 'حلب',
  'الشام': 'دمشق',
  'دمشق الشام': 'دمشق',
  'سوريا': 'دمشق',           // fallback for generic "Syria"
  'ادلب': 'إدلب',
  'إدلب': 'إدلب',
  'الرقه': 'الرقة',
  'السويدا': 'السويداء',
  'السويدأ': 'السويداء',
  'دير الزور': 'دير الزور',
  'ديرالزور': 'دير الزور',
  'دير ازور': 'دير الزور',
  'الحسكه': 'الحسكة',
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Resolve a location by its stable ID.
 */
export function getLocationById(id: string): SyrianLocation | undefined {
  return byId.get(id);
}

/**
 * Resolve a location by Arabic display name.
 * Handles alternate spellings and common variants.
 * If governorate is provided, uses it for disambiguation.
 */
export function resolveLocationByName(name: string, governorate?: string): SyrianLocation | undefined {
  if (!name) return undefined;

  const normalized = name.trim();

  // 1. Try composite key (name + governorate) for disambiguation
  if (governorate) {
    const composite = `${normalized}|${governorate.trim()}`;
    const found = byNameAndGov.get(composite);
    if (found) return found;
  }

  // 2. Try direct name lookup
  const direct = byName.get(normalized);
  if (direct) return direct;

  // 3. Try alternate spellings
  const canonical = ALTERNATE_NAMES[normalized];
  if (canonical) {
    if (governorate) {
      const composite = `${canonical}|${governorate.trim()}`;
      const found = byNameAndGov.get(composite);
      if (found) return found;
    }
    return byName.get(canonical);
  }

  // 4. Fuzzy: try without common prefixes/suffixes
  const withoutAl = normalized.replace(/^ال/, '');
  if (withoutAl !== normalized) {
    const found = byName.get(withoutAl);
    if (found) return found;
  }

  return undefined;
}

/**
 * Get all cities/towns within a governorate.
 */
export function getLocationsByGovernorate(governorateId: string): SyrianLocation[] {
  return (byGovernorate.get(governorateId) || []).filter(l => l.type !== 'governorate');
}

/**
 * Get all governorates.
 */
export function getGovernoratesList(): SyrianLocation[] {
  return GOVERNORATES;
}

/**
 * Get the flat list of all location names for backward-compatible dropdowns.
 * Returns governorate names (matching the existing SYRIAN_CITIES export).
 */
export function getSelectableCityNames(): string[] {
  return GOVERNORATES.map(g => g.name);
}

/**
 * Resolve coordinates for a city name (as stored in existing ads).
 * This is the main function used by CreateAd/EditAd to auto-resolve geo fields.
 * Returns { lat, lng, locationId, governorateName } or null if unresolvable.
 */
export function resolveGeoForCity(cityName: string): {
  lat: number;
  lng: number;
  locationId: string;
  governorateName: string;
} | null {
  const location = resolveLocationByName(cityName);
  if (!location) return null;

  return {
    lat: location.lat,
    lng: location.lng,
    locationId: location.id,
    governorateName: location.governorateName,
  };
}

/**
 * Search the canonical dataset (used by buyer filter and autocomplete).
 * Returns matching locations sorted by relevance.
 */
export function searchCanonicalLocations(query: string): SyrianLocation[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const results: SyrianLocation[] = [];

  for (const loc of ALL_LOCATIONS) {
    if (loc.name.includes(q) || loc.governorateName.includes(q)) {
      results.push(loc);
    }
  }

  // Sort: exact match first, then governorates before cities
  results.sort((a, b) => {
    const aExact = a.name === q ? 0 : 1;
    const bExact = b.name === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    if (a.type === 'governorate' && b.type !== 'governorate') return -1;
    if (b.type === 'governorate' && a.type !== 'governorate') return 1;
    return 0;
  });

  return results.slice(0, 15);
}
