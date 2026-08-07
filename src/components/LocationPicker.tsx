/**
 * LocationPicker — Full-screen location selector for CreateAd/EditAd.
 * Uses Leaflet + Geoapify (lazy-loaded).
 * Shows one pin, no advertisements.
 */
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { SYRIA_CENTER, DEFAULT_ZOOM, isValidCoordinates } from '../utils/geo';
import { MAP_CONFIG } from '../config/maps';
import { searchLocations, reverseGeocode, isMapProviderAvailable, type LocationSuggestion } from '../services/locationProvider';

const LeafletLocationMap = lazy(() => import('./LeafletLocationMap'));

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ isOpen, onClose, onConfirm, initialLat, initialLng }: LocationPickerProps) {
  const [selectedLat, setSelectedLat] = useState(initialLat || SYRIA_CENTER[0]);
  const [selectedLng, setSelectedLng] = useState(initialLng || SYRIA_CENTER[1]);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat || SYRIA_CENTER[0]);
      setSelectedLng(initialLng || SYRIA_CENTER[1]);
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [isOpen, initialLat, initialLng]);

  const handleCenterChange = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < MAP_CONFIG.autocompleteMinChars) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, MAP_CONFIG.autocompleteDebounceMs);
  }, []);

  const handleSelectSuggestion = useCallback((s: LocationSuggestion) => {
    setSelectedLat(s.latitude);
    setSelectedLng(s.longitude);
    setSearchQuery(s.label);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) { alert('تحديد الموقع غير مدعوم في هذا المتصفح'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLat(pos.coords.latitude);
        setSelectedLng(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) alert('تم رفض إذن الموقع. يمكنك تحديد الموقع يدوياً على الخريطة.');
        else if (err.code === 2) alert('تعذر تحديد الموقع. يرجى المحاولة لاحقاً.');
        else alert('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleConfirm = () => {
    if (isValidCoordinates(selectedLat, selectedLng)) {
      onConfirm(selectedLat, selectedLng);
    }
  };

  if (!isOpen) return null;

  const hasInitial = initialLat && initialLng;
  const center: [number, number] = [selectedLat, selectedLng];

  return (
    <div className="location-picker-overlay">
      <div className="location-picker-sheet">
        <div className="location-picker-header">
          <button onClick={onClose} className="location-picker-cancel">إلغاء</button>
          <h3>تحديد الموقع على الخريطة</h3>
          <button onClick={handleConfirm} className="location-picker-confirm">تأكيد</button>
        </div>

        {/* Search */}
        <div className="location-picker-search">
          <input
            type="text"
            placeholder="ابحث عن مدينة أو منطقة..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          {showSuggestions && (
            <div className="location-suggestions location-picker-suggestions">
              {suggestions.map((s) => (
                <button key={s.id} className="location-suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="location-picker-map-wrap">
          {isMapProviderAvailable() ? (
            <Suspense fallback={<div className="location-picker-loading"><div className="spinner" /></div>}>
              <LeafletLocationMap
                center={center}
                radius={1}
                onCenterChange={handleCenterChange}
                interactive={true}
              />
            </Suspense>
          ) : (
            <div className="location-map-fallback">
              <p>تعذر تحميل الخريطة مؤقتاً. يمكنك اختيار المحافظة والمدينة يدوياً.</p>
            </div>
          )}
        </div>

        <div className="location-picker-actions">
          <button onClick={handleUseMyLocation} disabled={locating} className="btn btn-secondary btn-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
            {locating ? 'جاري التحديد...' : 'استخدام موقعي الحالي'}
          </button>
          <p className="location-picker-hint">اسحب العلامة أو انقر على الخريطة لتحديد الموقع</p>
        </div>
      </div>
    </div>
  );
}
