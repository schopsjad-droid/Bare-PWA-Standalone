import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import MobileBottomNav from '../components/MobileBottomNav';
import MapFallback from '../components/MapFallback';
import StatusBadge from '../components/StatusBadge';
import FavoriteButton from '../components/FavoriteButton';
import { SYRIA_CENTER, DEFAULT_ZOOM, OPENFREEMAP_STYLE, formatDistance, calculateDistance, getGeohashBounds } from '../utils/geo';
import { formatPrice, type PriceType } from '../constants/categories';

interface MapAd {
  id: string;
  title: string;
  price: number;
  priceType?: PriceType;
  city: string;
  images: string[];
  latitude: number;
  longitude: number;
  listingStatus?: string;
  createdAt: any;
}

type MapState = 'loading' | 'ready' | 'unsupported' | 'error';

export default function MapResults() {
  const [, setLocation] = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const initAttemptRef = useRef(0);
  const [mapState, setMapState] = useState<MapState>('loading');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [ads, setAds] = useState<MapAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<MapAd | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [searchRadius, setSearchRadius] = useState(50);
  const [searching, setSearching] = useState(false);

  // Load initial ads with coordinates
  useEffect(() => {
    loadAdsWithLocation();
  }, []);

  const loadAdsWithLocation = async () => {
    try {
      setLoading(true);
      const adsRef = collection(db, 'ads');
      const q = query(adsRef, where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(200));
      const snapshot = await getDocs(q);
      const results: MapAd[] = [];
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.latitude && d.longitude) {
          results.push({
            id: doc.id,
            title: d.title || '',
            price: d.price || 0,
            priceType: d.priceType,
            city: d.city || '',
            images: d.images || [],
            latitude: d.latitude,
            longitude: d.longitude,
            listingStatus: d.listingStatus || 'available',
            createdAt: d.createdAt
          });
        }
      });
      setAds(results);
    } catch (e) {
      console.error('[MapResults] Error loading ads:', e);
    } finally {
      setLoading(false);
    }
  };

  // Search this area using geofire-common
  const handleSearchThisArea = useCallback(async () => {
    if (!mapRef.current) return;
    setSearching(true);
    setShowSearchButton(false);

    const center = mapRef.current.getCenter();
    const bounds = mapRef.current.getBounds();
    const ne = bounds.getNorthEast();
    const radiusKm = Math.min(
      calculateDistance([center.lat, center.lng], [ne.lat, ne.lng]),
      100
    );

    setSearchCenter([center.lat, center.lng]);
    setSearchRadius(radiusKm);

    try {
      const geoBounds = getGeohashBounds([center.lat, center.lng], radiusKm);
      const allResults: MapAd[] = [];
      const seenIds = new Set<string>();

      for (const b of geoBounds) {
        const q = query(
          collection(db, 'ads'),
          where('status', '==', 'approved'),
          where('geohash', '>=', b[0]),
          where('geohash', '<=', b[1]),
          limit(100)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          if (seenIds.has(doc.id)) return;
          seenIds.add(doc.id);
          const d = doc.data();
          if (d.latitude && d.longitude) {
            const dist = calculateDistance([center.lat, center.lng], [d.latitude, d.longitude]);
            if (dist <= radiusKm) {
              allResults.push({
                id: doc.id,
                title: d.title || '',
                price: d.price || 0,
                priceType: d.priceType,
                city: d.city || '',
                images: d.images || [],
                latitude: d.latitude,
                longitude: d.longitude,
                listingStatus: d.listingStatus || 'available',
                createdAt: d.createdAt
              });
            }
          }
        });
      }
      setAds(allResults);
    } catch (e) {
      console.error('[MapResults] Search error:', e);
    } finally {
      setSearching(false);
    }
  }, []);

  // Initialize map with proper lifecycle management
  const initializeMap = useCallback(async () => {
    initAttemptRef.current += 1;
    const currentAttempt = initAttemptRef.current;

    // Clean up any existing map instance
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch (_) {}
      mapRef.current = null;
    }
    setMapLoaded(false);
    setMapState('loading');

    try {
      // Step 1: Dynamically import MapLibre
      const maplibregl = await import('maplibre-gl');

      // Step 2: Check if MapLibre reports WebGL as supported
      // Use MapLibre's own detection which is more reliable than manual canvas test
      const MapLib = maplibregl.default || maplibregl;
      if (typeof MapLib.supported === 'function' && !MapLib.supported()) {
        console.warn('[MapResults] MapLibre reports WebGL not supported');
        setMapState('unsupported');
        return;
      }

      // Step 3: Import CSS
      await import('maplibre-gl/dist/maplibre-gl.css');

      // Step 4: Verify container is ready with non-zero dimensions
      if (currentAttempt !== initAttemptRef.current) return; // stale attempt
      const container = mapContainerRef.current;
      if (!container) {
        console.warn('[MapResults] Map container not available');
        setMapState('error');
        return;
      }

      // Wait for container to have dimensions (may need a frame)
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (currentAttempt !== initAttemptRef.current) return;
        // If still zero, force a minimum height
        if (container.clientWidth === 0 || container.clientHeight === 0) {
          container.style.minHeight = '400px';
          await new Promise(resolve => requestAnimationFrame(resolve));
          if (currentAttempt !== initAttemptRef.current) return;
        }
      }

      // Step 5: Create the map
      const map = new MapLib.Map({
        container: container,
        style: OPENFREEMAP_STYLE,
        center: [SYRIA_CENTER[1], SYRIA_CENTER[0]], // [lng, lat]
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false // Allow software rendering
      });

      const NavControl = MapLib.NavigationControl || maplibregl.NavigationControl;
      const AttrControl = MapLib.AttributionControl || maplibregl.AttributionControl;

      if (AttrControl) map.addControl(new AttrControl({ compact: true }), 'bottom-left');
      if (NavControl) map.addControl(new NavControl(), 'top-left');

      // Handle map errors (style load failure, WebGL context lost, etc.)
      map.on('error', (e: any) => {
        console.error('[MapResults] Map runtime error:', e.error?.message || e.message || e);
      });

      // Show search button on map move
      map.on('moveend', () => {
        setShowSearchButton(true);
      });

      map.on('load', () => {
        if (currentAttempt !== initAttemptRef.current) return;
        setMapLoaded(true);
        setMapState('ready');
        mapRef.current = map;
        // Ensure map fills container correctly
        map.resize();
      });

      // Timeout: if map doesn't load within 15 seconds, show error
      setTimeout(() => {
        if (currentAttempt === initAttemptRef.current && !mapRef.current) {
          console.warn('[MapResults] Map load timeout');
          setMapState('error');
        }
      }, 15000);

    } catch (e: any) {
      if (currentAttempt !== initAttemptRef.current) return;
      console.error('[MapResults] Map initialization error:', e);

      // Distinguish between WebGL unsupported and other errors
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('webgl') && (msg.includes('not supported') || msg.includes('unsupported'))) {
        setMapState('unsupported');
      } else {
        setMapState('error');
      }
    }
  }, []);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    return () => {
      initAttemptRef.current += 1; // Invalidate any pending init
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
    };
  }, [initializeMap]);

  // Update map markers when ads change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || ads.length === 0) return;
    const map = mapRef.current;

    // Remove existing source/layers if they exist
    if (map.getSource('ads-source')) {
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
      map.removeSource('ads-source');
    }

    // Build GeoJSON
    const geojson = {
      type: 'FeatureCollection' as const,
      features: ads.filter(ad => ad.listingStatus !== 'sold').map(ad => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [ad.longitude, ad.latitude]
        },
        properties: {
          id: ad.id,
          title: ad.title,
          price: ad.price,
          priceType: ad.priceType || 'fixed',
          city: ad.city,
          image: ad.images?.[0] || '',
          listingStatus: ad.listingStatus || 'available'
        }
      }))
    };

    map.addSource('ads-source', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'ads-source',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#4ade80', 10, '#22c55e', 30, '#16a34a'],
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255,255,255,0.3)'
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'ads-source',
      filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Bold'], 'text-size': 12 },
      paint: { 'text-color': '#ffffff' }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'ads-source',
      filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': '#4ade80', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }
    });

    map.on('click', 'clusters', (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      (map.getSource('ads-source') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    map.on('click', 'unclustered-point', (e: any) => {
      const props = e.features[0].properties;
      const ad = ads.find(a => a.id === props.id);
      if (ad) setSelectedAd(ad);
    });

    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

    map.on('click', (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'clusters'] });
      if (features.length === 0) setSelectedAd(null);
    });

  }, [mapLoaded, ads]);

  // Render fallback states
  if (mapState === 'unsupported') {
    return (
      <div className="page-wrap">
        <header className="page-header">
          <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
          <h1 className="page-header-title">الخريطة</h1>
          <div className="page-header-spacer" />
        </header>
        <div className="page-content"><MapFallback type="unsupported" /></div>
        <MobileBottomNav />
      </div>
    );
  }

  if (mapState === 'error') {
    return (
      <div className="page-wrap">
        <header className="page-header">
          <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
          <h1 className="page-header-title">الخريطة</h1>
          <div className="page-header-spacer" />
        </header>
        <div className="page-content"><MapFallback type="error" onRetry={initializeMap} /></div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="page-wrap map-results-page">
      <header className="page-header map-results-header">
        <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">الخريطة</h1>
        <span className="map-results-count">{ads.filter(a => a.listingStatus !== 'sold').length} إعلان</span>
      </header>

      <div className="map-results-container">
        <div ref={mapContainerRef} className="map-results-map" />

        {(loading || searching || mapState === 'loading') && (
          <div className="map-results-loading">
            <div className="spinner" />
          </div>
        )}

        {showSearchButton && !searching && mapState === 'ready' && (
          <button className="map-search-area-btn" onClick={handleSearchThisArea}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            البحث في هذه المنطقة
          </button>
        )}

        {selectedAd && (
          <div className="map-preview-card" onClick={() => setLocation(`/ad/${selectedAd.id}`)}>
            <div className="map-preview-img">
              {selectedAd.images?.[0] ? (
                <img src={selectedAd.images[0]} alt="" loading="lazy" />
              ) : (
                <div className="map-preview-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
            </div>
            <div className="map-preview-body">
              <div className="map-preview-title-row">
                <h4 className="map-preview-title">{selectedAd.title}</h4>
                <StatusBadge listingStatus={selectedAd.listingStatus || 'available'} size="sm" />
              </div>
              <div className="map-preview-price">{formatPrice({ amount: selectedAd.price, type: selectedAd.priceType || 'fixed' })}</div>
              <div className="map-preview-meta">
                <span>{selectedAd.city}</span>
                {searchCenter && (
                  <span>{formatDistance(calculateDistance(searchCenter, [selectedAd.latitude, selectedAd.longitude]))}</span>
                )}
              </div>
            </div>
            <button className="map-preview-close" onClick={(e) => { e.stopPropagation(); setSelectedAd(null); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="map-preview-fav"><FavoriteButton adId={selectedAd.id} size="small" /></div>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
