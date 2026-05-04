"use client";

import SearchableDropdown from "../../../../components/atoms/SearchableDropdown";
import { countries, getCitiesForCountry } from "../../../../utils/locationData";
import { cn } from "../../../../utils/utils";
import React, { useCallback, useMemo } from "react";

interface LocationSelectorProps {
  countryCode?: string;
  city?: string;
  onCountryChange: (countryCode: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

// Country list is ~250 entries and never changes — build the options array
// once at module scope rather than on every render.
const COUNTRY_OPTIONS = countries.map((country) => ({
  value: country.code,
  label: `${country.flag} ${country.name}`,
}));

const LocationSelector: React.FC<LocationSelectorProps> = ({
  countryCode,
  city,
  onCountryChange,
  onCityChange,
  className = "",
}) => {
  const cityOptions = useMemo(
    () =>
      countryCode
        ? getCitiesForCountry(countryCode).map((cityName) => ({
            value: cityName.name,
            label: cityName.name,
          }))
        : [],
    [countryCode],
  );

  const handleCountryChange = useCallback(
    (newCountryCode: string) => {
      onCountryChange(newCountryCode);
      onCityChange("");
    },
    [onCountryChange, onCityChange],
  );

  const handleCityChange = useCallback(
    (newCity: string) => {
      onCityChange(newCity);
    },
    [onCityChange],
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          Country
        </label>
        <SearchableDropdown
          options={COUNTRY_OPTIONS}
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
            countryCode ? "Select your city..." : "Select a country first"
          }
          searchPlaceholder="Search cities..."
          noOptionsMessage="No cities found"
          disabled={!countryCode || cityOptions.length === 0}
        />
      </div>
    </div>
  );
};

export default React.memo(LocationSelector);
