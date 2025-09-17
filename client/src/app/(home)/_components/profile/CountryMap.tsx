'use client';
import { MapsIcon } from '@/components/atoms/MapsIcon';
import L from 'leaflet';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import countryCoordinates from '../../../../utils/CountryCoordinates';

interface CountryMapProps {
  country: string;
  className?: string;
}

export const CountryMap: React.FC<CountryMapProps> = ({
  country,
  className = '',
}) => {
  const coordinates = countryCoordinates[country];

  if (!coordinates) {
    return <div className={className}>Unknown country: {country}</div>;
  }

  const CardanoPin = () => (
    <div className="group relative">
      <MapsIcon
        size={66}
        pinColor="white"
        backgroundColor="#ef4444"
        cardanoIconColor="#ffffff"
        cardanoIconSize={20}
      />
    </div>
  );

  const cardanoIcon = L.divIcon({
    html: ReactDOMServer.renderToString(<CardanoPin />),
    className: '!bg-transparent !border-none',
    iconSize: [32, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div
      className={`border-border/40 mt-6 overflow-hidden rounded-lg border ${className}`}
    >
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={4}
        scrollWheelZoom={false}
        className="h-40 w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <Marker
          position={[coordinates.lat, coordinates.lng]}
          icon={cardanoIcon}
        ></Marker>
      </MapContainer>
    </div>
  );
};
