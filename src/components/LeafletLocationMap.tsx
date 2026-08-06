/**
 * Leaflet-based location map component.
 * Shows one draggable pin and one radius circle.
 * Lazy-loaded — only imported when /map or location picker is opened.
 */
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../config/maps';

// Fix Leaflet default marker icon path issue in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom green marker
const greenIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 2.4.7 4.7 1.9 6.6L12.5 41l10.6-21.9c1.2-1.9 1.9-4.2 1.9-6.6C25 5.6 19.4 0 12.5 0z" fill="#4ade80"/><circle cx="12.5" cy="12.5" r="5" fill="white"/></svg>`),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

interface LeafletLocationMapProps {
  center: [number, number]; // [lat, lng]
  radius: number; // km
  onCenterChange: (lat: number, lng: number) => void;
  onError?: () => void;
  interactive?: boolean;
}

// Component to handle map clicks and marker drag
function MapInteraction({ center, onCenterChange }: { center: [number, number]; onCenterChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onCenterChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly to new center when it changes externally
function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (center[0] !== prevCenter.current[0] || center[1] !== prevCenter.current[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 12), { duration: 0.8 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

// Locate control button
function LocateControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="leaflet-locate-control" onClick={handleLocate}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={locating ? '#4ade80' : 'currentColor'} strokeWidth="2">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
      </svg>
    </div>
  );
}

export default function LeafletLocationMap({ center, radius, onCenterChange, onError, interactive = true }: LeafletLocationMapProps) {
  const [hasMarker, setHasMarker] = useState(
    center[0] !== MAP_CONFIG.defaultCenter[0] || center[1] !== MAP_CONFIG.defaultCenter[1]
  );

  useEffect(() => {
    if (center[0] !== MAP_CONFIG.defaultCenter[0] || center[1] !== MAP_CONFIG.defaultCenter[1]) {
      setHasMarker(true);
    }
  }, [center]);

  const handleCenterChange = (lat: number, lng: number) => {
    setHasMarker(true);
    onCenterChange(lat, lng);
  };

  return (
    <MapContainer
      center={center}
      zoom={hasMarker ? 12 : MAP_CONFIG.defaultZoom}
      className="leaflet-location-map"
      zoomControl={true}
      attributionControl={true}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.tileAttribution}
        maxZoom={MAP_CONFIG.maxZoom}
        errorTileUrl=""
      />

      {interactive && <MapInteraction center={center} onCenterChange={handleCenterChange} />}
      <MapFlyTo center={center} />
      <LocateControl />

      {hasMarker && (
        <>
          <Marker
            position={center}
            icon={greenIcon}
            draggable={interactive}
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                handleCenterChange(latlng.lat, latlng.lng);
              }
            }}
          />
          <Circle
            center={center}
            radius={radius * 1000} // km to meters
            pathOptions={{
              color: '#4ade80',
              fillColor: '#4ade80',
              fillOpacity: 0.08,
              weight: 2,
            }}
          />
        </>
      )}
    </MapContainer>
  );
}
