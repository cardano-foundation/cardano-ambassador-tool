'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapsIcon } from '@/components/atoms/MapsIcon';
import { countries, getCityCoordinates } from '@/utils/locationData';
import ReactDOMServer from 'react-dom/server';

interface LocationMapProps {
  city?: string | null;
  country?: string | null;
  className?: string;
}

const defaultCenter = { lat: 0, lng: 0 };

export const LocationMap: React.FC<LocationMapProps> = ({ city, country, className = '' }) => {
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
    if (city) {
      const cityCoordinates = getCityCoordinates(city);
      if (cityCoordinates) {
        setCoordinates(cityCoordinates);
        setError(null);
        return;
      }
    }

    if (country) {
      const cityCoordinates = getCityCoordinates(country);
      if (cityCoordinates) {
        setCoordinates(cityCoordinates);
        setError(null);
        return;
      }

      const countryData = countries.find(
        c => c.name.toLowerCase() === country.toLowerCase() ||
             c.code.toLowerCase() === country.toLowerCase()
      );

      if (countryData) {
        setCoordinates(countryData.coordinates);
        setError(null);
        return;
      }
    }

    const locationName = city || country;
    if (locationName) {
      setError(`Unknown location: ${locationName}`);
      setCoordinates(null);
    }
  }, [city, country]);


  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-40 bg-muted rounded-lg ${className}`}>
        <div className="text-destructive">Error loading map</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-40 bg-muted rounded-lg ${className}`}>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`flex items-center justify-center h-40 bg-muted rounded-lg ${className}`}>
        <div className="text-muted-foreground">{error ?? `Unknown location: ${city || country || '—'}`}</div>
      </div>
    );
  }

  return (
    <div className={`mt-6 rounded-lg border border-border overflow-hidden z-0 ${className}`}>
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
