'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapsIcon } from '@/components/atoms/MapsIcon';
import ReactDOMServer from 'react-dom/server';

interface CountryMapProps {
  country?: string | null;
  className?: string;
}

const defaultCenter = { lat: 0, lng: 0 };

export const CountryMap: React.FC<CountryMapProps> = ({ country, className = '' }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    preventGoogleFontsLoading: true,
  });

  const iconDataUrl = useMemo(() => {
  try {
    const svgString = ReactDOMServer.renderToStaticMarkup(
      <MapsIcon
        size={66}
        pinColor="white"
        backgroundColor="#ef4444"
        cardanoIconSize={33}
        cardanoIconColor="#ffffff"
      />
    );

    const cleanedSvg = svgString.replace(/#/g, '%23');
    return `data:image/svg+xml;charset=utf-8,${cleanedSvg}`;
  } catch (error) {
    console.error('Error creating SVG icon:', error);
    return '';
  }
}, []);


  useEffect(() => {
    return () => {
      if (iconDataUrl) URL.revokeObjectURL(iconDataUrl);
    };
  }, [iconDataUrl]);

  useEffect(() => {
  if (!isLoaded || !country) return;

  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: country }, (results, status) => {
    if (status === 'OK' && results && results.length > 0) {
      const loc = results[0].geometry.location;
      setCoordinates({ lat: loc.lat(), lng: loc.lng() });
      setError(null);
    } else {
      console.error('Geocode error:', status, country);
      setError(`Unknown location: ${country}`);
      setCoordinates(null);
    }
  });
}, [isLoaded, country]);


  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-40 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-red-500">Error loading map</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-40 bg-gray-100 rounded-lg ${className}`}>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`flex items-center justify-center h-40 bg-gray-100 rounded-lg ${className}`}>
        <div>{error ?? `Unknown location: ${country ?? '—'}`}</div>
      </div>
    );
  }

  return (
    <div className={`mt-6 rounded-lg border border-border/40 overflow-hidden z-0 ${className}`}>
      <GoogleMap
        mapContainerClassName="h-40 w-full"
        center={coordinates ?? defaultCenter}
        zoom={5}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <MarkerF
          position={coordinates}
          icon={
            iconDataUrl
              ? {
                  url: iconDataUrl,
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 40),
                }
              : undefined
          }
        />
      </GoogleMap>
    </div>
  );
};
