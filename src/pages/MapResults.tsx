/**
 * /map — Location & Radius Selector
 * Purpose: Let the user pick a search center and radius, then return to results.
 * This page does NOT display advertisements.
 */
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import MobileBottomNav from '../components/MobileBottomNav';
import { MAP_CONFIG, RADIUS_QUICK_OPTIONS } from '../config/maps';
import { searchLocations, reverseGeocode, isMapProviderAvailable, type LocationSuggestion } from '../services/locationProvider';

// Lazy-load the map component
const LeafletMap = lazy(() => import('../components/LeafletLocationMap'));

export default function MapResults() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  // Parse existing filter from URL
  const initialLat = params.get('lat') ? parseFloat(params.get('lat')!) : null;
  const initialLng = params.get('lng') ? parseFloat(params.get('lng')!) : null;
  const initialRadius = params.get('radius') ? parseInt(params.get('radius')!) : MAP_CONFIG.defaultRadius;
  const initialLabel = params.get('label') || '';
  const returnQuery = params.get('q') || '';
  const returnCategory = params.get('cat') || '';

  const [centerLat, setCenterLat] = useState<number | null>(initialLat);
  const [centerLng, setCenterLng] = useState<number | null>(initialLng);
  const [radius, setRadius] = useState(initialRadius);
  const [locationLabel, setLocationLabel] = useState(initialLabel);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete with debounce
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

  // Select a suggestion
  const handleSelectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    setCenterLat(suggestion.latitude);
    setCenterLng(suggestion.longitude);
    setLocationLabel(suggestion.label);
    setSearchQuery(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Use current location
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('تحديد الموقع غير مدعوم في هذا المتصفح');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenterLat(latitude);
        setCenterLng(longitude);
        // Reverse geocode for label
        const label = await reverseGeocode(latitude, longitude);
        setLocationLabel(label || 'موقعي الحالي');
        setSearchQuery(label || 'موقعي الحالي');
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) alert('تم رفض إذن الموقع. يمكنك تحديد الموقع يدوياً.');
        else if (err.code === 2) alert('تعذر تحديد الموقع. يرجى المحاولة لاحقاً.');
        else alert('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Handle map center change (from pin drag or map click)
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setCenterLat(lat);
    setCenterLng(lng);
    // Don't reverse geocode on every drag — only label when user confirms or uses current location
  }, []);

  // Confirm and return to results
  const handleConfirm = useCallback(() => {
    if (centerLat === null || centerLng === null) return;

    const resultParams = new URLSearchParams();
    resultParams.set('lat', centerLat.toFixed(5));
    resultParams.set('lng', centerLng.toFixed(5));
    resultParams.set('radius', String(radius));
    if (locationLabel) resultParams.set('label', locationLabel);
    if (returnQuery) resultParams.set('q', returnQuery);
    if (returnCategory) resultParams.set('cat', returnCategory);

    setLocation(`/category/${returnCategory || 'all'}?${resultParams.toString()}`);
  }, [centerLat, centerLng, radius, locationLabel, returnQuery, returnCategory, setLocation]);

  // Reset filter
  const handleReset = useCallback(() => {
    setCenterLat(null);
    setCenterLng(null);
    setRadius(MAP_CONFIG.defaultRadius);
    setLocationLabel('');
    setSearchQuery('');
  }, []);

  // Clear search input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  const hasSelection = centerLat !== null && centerLng !== null;

  return (
    <div className="page-wrap location-filter-page">
      {/* Header */}
      <header className="page-header">
        <Link href="/"><span className="page-header-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </span></Link>
        <h1 className="page-header-title">الموقع والمسافة</h1>
        {hasSelection && (
          <button className="page-header-action" onClick={handleReset}>مسح</button>
        )}
        {!hasSelection && <div className="page-header-spacer" />}
      </header>

      {/* Search Section */}
      <div className="location-search-section">
        <div className="location-search-input-wrap">
          <svg className="location-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={searchInputRef}
            type="text"
            className="location-search-input"
            placeholder="ابحث عن مدينة أو منطقة..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          {searchQuery && (
            <button className="location-search-clear" onClick={handleClearSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="location-suggestions">
            {suggestions.map((s) => (
              <button key={s.id} className="location-suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current location button */}
        <button className="location-use-current" onClick={handleUseMyLocation} disabled={locating}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
          {locating ? 'جاري التحديد...' : 'استخدام موقعي الحالي'}
        </button>

        {/* Location label */}
        {hasSelection && locationLabel && (
          <div className="location-selected-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{locationLabel}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="location-map-container">
        {isMapProviderAvailable() ? (
          <Suspense fallback={<div className="location-map-loading"><div className="spinner" /></div>}>
            <LeafletMap
              center={hasSelection ? [centerLat!, centerLng!] : MAP_CONFIG.defaultCenter}
              radius={radius}
              onCenterChange={handleMapCenterChange}
              onError={() => setMapError(true)}
            />
          </Suspense>
        ) : (
          <div className="location-map-fallback">
            <p>تعذر تحميل الخريطة مؤقتاً. يمكنك اختيار المحافظة والمدينة يدوياً.</p>
          </div>
        )}
        {mapError && (
          <div className="location-map-fallback">
            <p>تعذر تحميل الخريطة مؤقتاً. يمكنك اختيار المحافظة والمدينة يدوياً.</p>
          </div>
        )}
      </div>

      {/* Radius Section */}
      <div className="location-radius-section">
        <div className="location-radius-header">
          <span className="location-radius-label">نطاق البحث</span>
          <span className="location-radius-value">{radius} كم</span>
        </div>
        <input
          type="range"
          className="location-radius-slider"
          min={MAP_CONFIG.minRadius}
          max={MAP_CONFIG.maxRadius}
          step={1}
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
        />
        <div className="location-radius-quick">
          {RADIUS_QUICK_OPTIONS.map((r) => (
            <button
              key={r}
              className={`location-radius-chip${radius === r ? ' active' : ''}`}
              onClick={() => setRadius(r)}
            >
              {r} كم
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="location-confirm-section">
        <button
          className="btn btn-primary btn-full location-confirm-btn"
          disabled={!hasSelection}
          onClick={handleConfirm}
        >
          عرض النتائج
        </button>
      </div>

      <MobileBottomNav />
    </div>
  );
}
