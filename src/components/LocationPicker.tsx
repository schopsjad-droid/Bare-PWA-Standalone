import { useState, useEffect, useRef, useCallback } from 'react';
import { SYRIA_CENTER, DEFAULT_ZOOM, OPENFREEMAP_STYLE, isValidCoordinates } from '../utils/geo';
import MapFallback from './MapFallback';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

type MapState = 'loading' | 'ready' | 'unsupported' | 'error';

export default function LocationPicker({ isOpen, onClose, onConfirm, initialLat, initialLng }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initAttemptRef = useRef(0);
  const [mapState, setMapState] = useState<MapState>('loading');
  const [selectedLat, setSelectedLat] = useState(initialLat || SYRIA_CENTER[0]);
  const [selectedLng, setSelectedLng] = useState(initialLng || SYRIA_CENTER[1]);
  const [locating, setLocating] = useState(false);

  const initMap = useCallback(async () => {
    initAttemptRef.current += 1;
    const currentAttempt = initAttemptRef.current;

    if (mapRef.current) {
      try { mapRef.current.remove(); } catch (_) {}
      mapRef.current = null;
    }
    setMapState('loading');

    try {
      const maplibregl = await import('maplibre-gl');
      const MapLib = maplibregl.default || maplibregl;

      // Use MapLibre's own WebGL support check
      if (typeof MapLib.supported === 'function' && !MapLib.supported()) {
        setMapState('unsupported');
        return;
      }

      await import('maplibre-gl/dist/maplibre-gl.css');

      if (currentAttempt !== initAttemptRef.current) return;
      const container = mapContainerRef.current;
      if (!container) { setMapState('error'); return; }

      // Wait for container dimensions
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (currentAttempt !== initAttemptRef.current) return;
      }

      const map = new MapLib.Map({
        container: container,
        style: OPENFREEMAP_STYLE,
        center: [initialLng || SYRIA_CENTER[1], initialLat || SYRIA_CENTER[0]],
        zoom: initialLat ? 13 : DEFAULT_ZOOM,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false
      });

      const AttrControl = MapLib.AttributionControl || maplibregl.AttributionControl;
      const NavControl = MapLib.NavigationControl || maplibregl.NavigationControl;
      const Marker = MapLib.Marker || maplibregl.Marker;

      if (AttrControl) map.addControl(new AttrControl({ compact: true }), 'bottom-left');
      if (NavControl) map.addControl(new NavControl({ showCompass: false }), 'bottom-right');

      // Add draggable marker
      if (Marker) {
        const marker = new Marker({ color: '#4ade80', draggable: true })
          .setLngLat([initialLng || SYRIA_CENTER[1], initialLat || SYRIA_CENTER[0]])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          setSelectedLat(lngLat.lat);
          setSelectedLng(lngLat.lng);
        });

        markerRef.current = marker;

        // Click map to move marker
        map.on('click', (e: any) => {
          marker.setLngLat(e.lngLat);
          setSelectedLat(e.lngLat.lat);
          setSelectedLng(e.lngLat.lng);
        });
      }

      map.on('load', () => {
        if (currentAttempt !== initAttemptRef.current) return;
        setMapState('ready');
        map.resize();
      });

      mapRef.current = map;

      // Timeout fallback
      setTimeout(() => {
        if (currentAttempt === initAttemptRef.current && !mapRef.current) {
          setMapState('error');
        }
      }, 15000);

    } catch (e: any) {
      if (currentAttempt !== initAttemptRef.current) return;
      console.error('[LocationPicker] Map init error:', e);
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('webgl') && (msg.includes('not supported') || msg.includes('unsupported'))) {
        setMapState('unsupported');
      } else {
        setMapState('error');
      }
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    if (!isOpen) return;
    initMap();
    return () => {
      initAttemptRef.current += 1;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
    };
  }, [isOpen, initMap]);

  const handleUseMyLocation = useCallback(async () => {
    if (!navigator.geolocation) { alert('تحديد الموقع غير مدعوم في هذا المتصفح'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        markerRef.current?.setLngLat([longitude, latitude]);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
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

  return (
    <div className="location-picker-overlay">
      <div className="location-picker-sheet">
        <div className="location-picker-header">
          <button onClick={onClose} className="location-picker-cancel">إلغاء</button>
          <h3>تحديد الموقع على الخريطة</h3>
          <button onClick={handleConfirm} className="location-picker-confirm">تأكيد</button>
        </div>

        <div className="location-picker-map-wrap">
          {mapState === 'unsupported' ? (
            <MapFallback type="unsupported" />
          ) : mapState === 'error' ? (
            <MapFallback type="error" onRetry={initMap} />
          ) : (
            <>
              <div ref={mapContainerRef} className="location-picker-map" />
              {mapState === 'loading' && <div className="location-picker-loading"><div className="spinner" /></div>}
            </>
          )}
        </div>

        <div className="location-picker-actions">
          <button onClick={handleUseMyLocation} disabled={locating || mapState !== 'ready'} className="btn btn-secondary btn-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
            {locating ? 'جاري التحديد...' : 'استخدام موقعي الحالي'}
          </button>
          <p className="location-picker-hint">اسحب العلامة أو انقر على الخريطة لتحديد الموقع</p>
        </div>
      </div>
    </div>
  );
}
