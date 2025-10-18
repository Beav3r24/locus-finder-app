import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface MapProps {
  userPosition: [number, number] | null;
  slugPosition: [number, number] | null;
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

const Map = ({ userPosition, slugPosition }: MapProps) => {
  const [apiKey, setApiKey] = useState('');
  const [tokenSet, setTokenSet] = useState(false);

  if (!tokenSet) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Enter Google Maps API Key</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Get your API key from{' '}
            <a
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Cloud Console
            </a>
          </p>
          <Input
            type="text"
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-4"
          />
          <button
            onClick={() => setTokenSet(true)}
            disabled={!apiKey}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
          >
            Start Game
          </button>
        </Card>
      </div>
    );
  }

  return <RawGoogleMap apiKey={apiKey} userPosition={userPosition} slugPosition={slugPosition} />;
};

const RawGoogleMap = ({ apiKey, userPosition, slugPosition }: { apiKey: string; userPosition: [number, number] | null; slugPosition: [number, number] | null }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const slugMarkerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const fittedRef = useRef(false);

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
    const pos = { lat: userPosition[1], lng: userPosition[0] };
    markerRef.current.setPosition(pos);
    mapRef.current.panTo(pos);
  }, [userPosition, loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !slugMarkerRef.current || !slugPosition) return;
    const pos = { lat: slugPosition[1], lng: slugPosition[0] };
    slugMarkerRef.current.setPosition(pos);
  }, [slugPosition, loaded]);

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
