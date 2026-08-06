import { useEffect, useRef, useState } from 'react';
import { OPENFREEMAP_STYLE } from '../utils/geo';
import type { LocationPrecision } from '../utils/geo';
import MapFallback from './MapFallback';

interface ListingMapProps {
  latitude: number;
  longitude: number;
  precision: LocationPrecision;
  expanded?: boolean;
}

type MapState = 'loading' | 'ready' | 'unsupported' | 'error';

export default function ListingMap({ latitude, longitude, precision, expanded = false }: ListingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const initAttemptRef = useRef(0);
  const [mapState, setMapState] = useState<MapState>('loading');

  const initMap = async () => {
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
        center: [longitude, latitude],
        zoom: precision === 'exact' ? 15 : 12,
        attributionControl: false,
        interactive: expanded,
        failIfMajorPerformanceCaveat: false
      });

      const AttrControl = MapLib.AttributionControl || maplibregl.AttributionControl;
      if (AttrControl) map.addControl(new AttrControl({ compact: true }), 'bottom-left');

      if (precision === 'approximate') {
        map.on('load', () => {
          if (currentAttempt !== initAttemptRef.current) return;
          map.addSource('approx-area', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'Point', coordinates: [longitude, latitude] }, properties: {} }
          });
          map.addLayer({
            id: 'approx-circle', type: 'circle', source: 'approx-area',
            paint: { 'circle-radius': 40, 'circle-color': '#4ade80', 'circle-opacity': 0.15, 'circle-stroke-width': 2, 'circle-stroke-color': '#4ade80', 'circle-stroke-opacity': 0.5 }
          });
          setMapState('ready');
          map.resize();
        });
      } else {
        const Marker = MapLib.Marker || maplibregl.Marker;
        if (Marker) new Marker({ color: '#4ade80' }).setLngLat([longitude, latitude]).addTo(map);
        map.on('load', () => {
          if (currentAttempt !== initAttemptRef.current) return;
          setMapState('ready');
          map.resize();
        });
      }

      mapRef.current = map;

      // Timeout fallback
      setTimeout(() => {
        if (currentAttempt === initAttemptRef.current && mapState === 'loading') {
          setMapState('error');
        }
      }, 15000);

    } catch (e: any) {
      if (currentAttempt !== initAttemptRef.current) return;
      console.error('[ListingMap] Error:', e);
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('webgl') && (msg.includes('not supported') || msg.includes('unsupported'))) {
        setMapState('unsupported');
      } else {
        setMapState('error');
      }
    }
  };

  useEffect(() => {
    initMap();
    return () => {
      initAttemptRef.current += 1;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, precision, expanded]);

  if (mapState === 'unsupported') return <MapFallback type="unsupported" />;
  if (mapState === 'error') return <MapFallback type="error" onRetry={initMap} />;

  return (
    <div className={`listing-map-wrap${expanded ? ' expanded' : ''}`}>
      <div ref={mapContainerRef} className="listing-map" />
      {mapState === 'loading' && <div className="listing-map-loading"><div className="spinner" /></div>}
      <div className="listing-map-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {precision === 'approximate' ? 'الموقع التقريبي' : 'الموقع الدقيق'}
      </div>
    </div>
  );
}
