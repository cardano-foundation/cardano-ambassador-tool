'use client';

import { countries, getCitiesForCountry } from '@/utils/locationData';
import React from 'react';
import Dropdown from '../../../../components/atoms/Dropdown';

interface LocationSelectorProps {
  countryCode?: string;
  city?: string;
  onCountryChange: (countryCode: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  countryCode,
  city,
  onCountryChange,
  onCityChange,
  className = '',
}) => {
  const countryOptions = countries.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
  }));

  const cityOptions = countryCode
    ? getCitiesForCountry(countryCode).map((cityName) => ({
        value: cityName,
        label: cityName,
      }))
    : [];

  const handleCountryChange = (newCountryCode: string) => {
    console.log('LocationSelector - Country changing to:', newCountryCode);
    onCountryChange(newCountryCode);
    // Reset city when country changes
    onCityChange('');
  };

  const handleCityChange = (newCity: string) => {
    console.log('LocationSelector - City changing to:', newCity);
    onCityChange(newCity);
  };


  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          Country
        </label>
        <Dropdown
          options={countryOptions}
          value={countryCode}
          onValueChange={handleCountryChange}
          placeholder="Select your country..."
        />
      </div>

      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          City
        </label>
        <Dropdown
          options={cityOptions}
          value={city}
          onValueChange={handleCityChange}
          placeholder={
            countryCode ? 'Select your city...' : 'Select a country first'
          }
          disabled={!countryCode || cityOptions.length === 0}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
