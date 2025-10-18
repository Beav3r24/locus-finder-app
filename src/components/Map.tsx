import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';

interface MapProps {
  userPosition: [number, number] | null;
  slugPosition: [number, number] | null;
  activityRoutes?: Array<[number, number][]>;
}

// Provide minimal typings for the global Google object to avoid TS errors
declare global {
  interface Window {
    google?: any;
    _gmaps_loading_promise?: Promise<void>;
  }
}

// Load Google Maps script once with the provided API key without using the library loader
const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (window.google?.maps) return Promise.resolve();
  if (window._gmaps_loading_promise) return window._gmaps_loading_promise;

  window._gmaps_loading_promise = new Promise((resolve, reject) => {
    const existing = document.getElementById('gmaps-script') as HTMLScriptElement | null;

    if (existing) {
      if (window.google?.maps) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return window._gmaps_loading_promise;
};

const Map = ({ userPosition, slugPosition, activityRoutes }: MapProps) => {
  return <RawGoogleMap apiKey={GOOGLE_MAPS_API_KEY} userPosition={userPosition} slugPosition={slugPosition} activityRoutes={activityRoutes} />;
};

const RawGoogleMap = ({ apiKey, userPosition, slugPosition, activityRoutes }: { apiKey: string; userPosition: [number, number] | null; slugPosition: [number, number] | null; activityRoutes?: Array<[number, number][]> }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const slugMarkerRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const fittedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const targetPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((e) => {
        console.error('Failed to load Google Maps', e);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!loaded || !mapContainerRef.current || mapRef.current) return;
    const center = userPosition ? { lat: userPosition[1], lng: userPosition[0] } : { lat: 40, lng: -74.5 };
    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // User marker
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'You',
    });

    // Slug marker
    slugMarkerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapRef.current,
      icon: {
        path: 'M 0,0',
        scale: 0,
      },
      label: {
        text: '🐌',
        fontSize: '32px',
      },
      title: 'Immortal Slug',
    });
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !markerRef.current || !userPosition) return;
    
    const targetPos = { lat: userPosition[1], lng: userPosition[0] };
    targetPositionRef.current = targetPos;
    
    const currentPos = markerRef.current.getPosition();
    if (!currentPos) {
      markerRef.current.setPosition(targetPos);
      mapRef.current.panTo(targetPos);
      return;
    }
    
    const startPos = { lat: currentPos.lat(), lng: currentPos.lng() };
    const startTime = Date.now();
    const duration = 2500; // 2500ms animation
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentLat = startPos.lat + (targetPos.lat - startPos.lat) * eased;
      const currentLng = startPos.lng + (targetPos.lng - startPos.lng) * eased;
      
      markerRef.current.setPosition({ lat: currentLat, lng: currentLng });
      mapRef.current.panTo({ lat: currentLat, lng: currentLng });
      
      if (progress < 1 && targetPositionRef.current === targetPos) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [userPosition, loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !slugMarkerRef.current || !slugPosition) return;
    const pos = { lat: slugPosition[1], lng: slugPosition[0] };
    slugMarkerRef.current.setPosition(pos);
  }, [slugPosition, loaded]);

  // Draw activity routes as polylines
  useEffect(() => {
    if (!loaded || !mapRef.current || !activityRoutes) return;
    
    // Clear existing polylines
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];
    
    // Draw new polylines
    activityRoutes.forEach(route => {
      if (route.length > 0) {
        const path = route.map(([lat, lng]) => ({ lat, lng }));
        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#FF6B35',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapRef.current,
        });
        polylinesRef.current.push(polyline);
      }
    });
    
    // Fit bounds to show all routes
    if (activityRoutes.length > 0 && !fittedRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      activityRoutes.forEach(route => {
        route.forEach(([lat, lng]) => {
          bounds.extend({ lat, lng });
        });
      });
      mapRef.current.fitBounds(bounds, 50);
      fittedRef.current = true;
    }
  }, [loaded, activityRoutes]);

  // Fit both user and slug into view once when both are available
  useEffect(() => {
    if (!loaded || !mapRef.current || !userPosition || !slugPosition || fittedRef.current) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: userPosition[1], lng: userPosition[0] });
    bounds.extend({ lat: slugPosition[1], lng: slugPosition[0] });
    mapRef.current.fitBounds(bounds, 80);
    fittedRef.current = true;
  }, [loaded, userPosition, slugPosition]);

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <div ref={mapContainerRef} className="absolute inset-0" />
    </div>
  );
};

export default Map;
