'use client';

import { countries, getCitiesForCountry } from '@/utils/locationData';
import React from 'react';
import { cn } from '@/utils/utils';
import SearchableDropdown from '../../../../components/atoms/SearchableDropdown';

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
    onCountryChange(newCountryCode);
    // Reset city when country changes
    onCityChange('');
  };

  const handleCityChange = (newCity: string) => {
    onCityChange(newCity);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          Country
        </label>
        <SearchableDropdown
          options={countryOptions}
          value={countryCode}
          onValueChange={handleCountryChange}
          placeholder="Select your country..."
          searchPlaceholder="Search countries..."
          noOptionsMessage="No countries found"
        />
      </div>

      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          City
        </label>
        <SearchableDropdown
          options={cityOptions}
          value={city}
          onValueChange={handleCityChange}
          placeholder={
            countryCode ? 'Select your city...' : 'Select a country first'
          }
          searchPlaceholder="Search cities..."
          noOptionsMessage="No cities found"
          disabled={!countryCode || cityOptions.length === 0}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
