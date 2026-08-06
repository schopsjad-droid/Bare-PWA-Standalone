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

export default function ListingMap({ latitude, longitude, precision, expanded = false }: ListingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { setWebglSupported(false); return; }

    let cancelled = false;
    const initMap = async () => {
      try {
        const maplibregl = await import('maplibre-gl');
        await import('maplibre-gl/dist/maplibre-gl.css');
        if (cancelled || !mapContainerRef.current) return;

        const map = new maplibregl.default.Map({
          container: mapContainerRef.current,
          style: OPENFREEMAP_STYLE,
          center: [longitude, latitude],
          zoom: precision === 'exact' ? 15 : 12,
          attributionControl: false,
          interactive: expanded
        });

        map.addControl(new maplibregl.default.AttributionControl({ compact: true }), 'bottom-left');

        if (precision === 'approximate') {
          // Show approximate area circle
          map.on('load', () => {
            map.addSource('approx-area', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [longitude, latitude] },
                properties: {}
              }
            });
            map.addLayer({
              id: 'approx-circle',
              type: 'circle',
              source: 'approx-area',
              paint: {
                'circle-radius': 40,
                'circle-color': '#4ade80',
                'circle-opacity': 0.15,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#4ade80',
                'circle-stroke-opacity': 0.5
              }
            });
            setLoaded(true);
          });
        } else {
          // Exact marker
          new maplibregl.default.Marker({ color: '#4ade80' })
            .setLngLat([longitude, latitude])
            .addTo(map);
          map.on('load', () => setLoaded(true));
        }

        mapRef.current = map;
      } catch (e) {
        console.error('[ListingMap] Error:', e);
        setWebglSupported(false);
      }
    };

    initMap();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [latitude, longitude, precision, expanded]);

  if (!webglSupported) return <MapFallback />;

  return (
    <div className={`listing-map-wrap${expanded ? ' expanded' : ''}`}>
      <div ref={mapContainerRef} className="listing-map" />
      {!loaded && <div className="listing-map-loading"><div className="spinner" /></div>}
      <div className="listing-map-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {precision === 'approximate' ? 'الموقع التقريبي' : 'الموقع الدقيق'}
      </div>
    </div>
  );
}
