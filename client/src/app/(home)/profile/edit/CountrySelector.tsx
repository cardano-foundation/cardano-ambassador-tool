'use client';

import { countries } from '@/utils/locationData';
import SearchableDropdown from '@/components/atoms/SearchableDropdown';

interface CountrySelectorProps {
  value?: string;
  onValueChange: (countryCode: string) => void;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onValueChange,
  className = '',
}) => {
  const countryOptions = countries.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
  }));

  return (
    <div className={className}>
      <SearchableDropdown
        options={countryOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder="Select your country..."
        searchPlaceholder="Search countries..."
        noOptionsMessage="No countries found"
      />
    </div>
  );
};

export default CountrySelector;