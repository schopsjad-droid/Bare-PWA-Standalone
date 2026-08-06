import { useState, useEffect, useRef } from 'react';
import { SYRIA_CENTER, DEFAULT_ZOOM, OPENFREEMAP_STYLE, isValidCoordinates } from '../utils/geo';
import MapFallback from './MapFallback';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ isOpen, onClose, onConfirm, initialLat, initialLng }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [selectedLat, setSelectedLat] = useState(initialLat || SYRIA_CENTER[0]);
  const [selectedLng, setSelectedLng] = useState(initialLng || SYRIA_CENTER[1]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { setWebglSupported(false); return; }

    // Dynamically import MapLibre
    let cancelled = false;
    const initMap = async () => {
      try {
        const maplibregl = await import('maplibre-gl');
        await import('maplibre-gl/dist/maplibre-gl.css');
        if (cancelled || !mapContainerRef.current) return;

        const map = new maplibregl.default.Map({
          container: mapContainerRef.current,
          style: OPENFREEMAP_STYLE,
          center: [initialLng || SYRIA_CENTER[1], initialLat || SYRIA_CENTER[0]],
          zoom: initialLat ? 13 : DEFAULT_ZOOM,
          attributionControl: false
        });

        map.addControl(new maplibregl.default.AttributionControl({ compact: true }), 'bottom-left');
        map.addControl(new maplibregl.default.NavigationControl({ showCompass: false }), 'bottom-right');

        // Add draggable marker
        const marker = new maplibregl.default.Marker({ color: '#4ade80', draggable: true })
          .setLngLat([initialLng || SYRIA_CENTER[1], initialLat || SYRIA_CENTER[0]])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          setSelectedLat(lngLat.lat);
          setSelectedLng(lngLat.lng);
        });

        // Click map to move marker
        map.on('click', (e: any) => {
          marker.setLngLat(e.lngLat);
          setSelectedLat(e.lngLat.lat);
          setSelectedLng(e.lngLat.lng);
        });

        map.on('load', () => setMapLoaded(true));

        mapRef.current = map;
        markerRef.current = marker;
      } catch (e) {
        console.error('[LocationPicker] Map init error:', e);
        setWebglSupported(false);
      }
    };

    initMap();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [isOpen]);

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
          {!webglSupported ? (
            <MapFallback message="الخريطة غير مدعومة في هذا المتصفح. يمكنك إدخال الموقع يدوياً." />
          ) : (
            <>
              <div ref={mapContainerRef} className="location-picker-map" />
              {!mapLoaded && <div className="location-picker-loading"><div className="spinner" /></div>}
            </>
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
