'use client';

import React from 'react';
import { countries, getCityCoordinates } from '@/utils/locationData';
import { MapsIcon } from '@/components/atoms/MapsIcon';

interface LocationMapProps {
  city?: string | null;
  country?: string | null;
  className?: string;
  zoom?: number;
}

/**
 * Generates simple Google Maps embed URL based on coordinates
 */
function generateMapEmbedUrl(
  lat: number, 
  lng: number
): string {
  // Use actual coordinates from the location data
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.263838364847!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2sLocation!5e0!3m2!1sen!2sus!4v1234567890123`;
}

export const LocationMap: React.FC<LocationMapProps> = ({ 
  city, 
  country, 
  className = '',
  zoom = 8
}) => {

  let coordinates: { lat: number; lng: number } | null = null;
  let locationName = '';
  
  if (city) {
    coordinates = getCityCoordinates(city);
    locationName = city;
  }
  
  if (!coordinates && country) {
    coordinates = getCityCoordinates(country);
    if (!coordinates) {
      const countryData = countries.find(
        c => c.name.toLowerCase() === country.toLowerCase() ||
             c.code.toLowerCase() === country.toLowerCase()
      );
      if (countryData) {
        coordinates = countryData.coordinates;
      }
    }
    if (!locationName) locationName = country;
  }

  if (!coordinates) {
    return (
      <div className={`flex items-center justify-center h-40 bg-muted rounded-lg border border-border ${className}`}>
        <div className="text-muted-foreground text-sm">
          {locationName ? `Location not found: ${locationName}` : 'No location specified'}
        </div>
      </div>
    );
  }

  const mapUrl = generateMapEmbedUrl(
    coordinates.lat,
    coordinates.lng
  );

  return (
    <div className={`mt-6 rounded-lg border border-border overflow-hidden relative ${className}`}>
      <iframe 
        className="w-full h-40"
        src={mapUrl}
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        title={`Map of ${locationName || 'location'}`}
        style={{ border: 0 }}
      />
      {/* Custom pin icon overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none">
        <MapsIcon 
          className="w-12 h-12" 
        />
      </div>
    </div>
  );
};
