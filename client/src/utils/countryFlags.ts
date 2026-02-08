import { countries, getCountryByCode } from "./locationData";

export const getCountryFlag = (countryInput: string): string => {
  if (!countryInput?.trim()) return "🌍";

  const input = countryInput.trim();

  const countryByCode = getCountryByCode(input);
  if (countryByCode) return countryByCode.flag;

  const countryByName = countries.find(
    (country) => country.name.toLowerCase() === input.toLowerCase(),
  );
  if (countryByName) return countryByName.flag;

  const partialMatch = countries.find((country) => {
    const countryName = country.name.toLowerCase();
    const inputLower = input.toLowerCase();
    return countryName.includes(inputLower) || inputLower.includes(countryName);
  });
  if (partialMatch) return partialMatch.flag;

  const specialCases: { [key: string]: string } = {
    Argentina: "🇦🇷",
    Romania: "🇷🇴",
    Indonesia: "🇮🇩",
    Norway: "🇳🇴",
    Ghana: "🇬🇭",
    Germany: "🇩🇪",
    DRC: "🇨🇩",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "United States": "🇺🇸",
    Kazakhstan: "🇰🇿",
    Poland: "🇵🇱",
    Venezuela: "🇻🇪",
    Netherlands: "🇳🇱",
    Italy: "🇮🇹",
    Brazil: "🇧🇷",
    UAE: "🇦🇪",
    Singapore: "🇸🇬",
    France: "🇫🇷",
    Japan: "🇯🇵",
    Ireland: "🇮🇪",
    Spain: "🇪🇸",
    Nigeria: "🇳🇬",
    "United Kingdom": "🇬🇧",
    India: "🇮🇳",
    Sweden: "🇸🇪",
    "Czech Republic": "🇨🇿",
    Mexico: "🇲🇽",
    Russia: "🇷🇺",
    Canada: "🇨🇦",
    Morocco: "🇲🇦",
    "South Korea": "🇰🇷",
    Ukraine: "🇺🇦",
    Austria: "🇦🇹",
    Slovakia: "🇸🇰",
    China: "🇨🇳",
    "Hong Kong": "🇭🇰",
    Colombia: "🇨🇴",
    Egypt: "🇪🇬",
    "New Zealand": "🇳🇿",
    Tunisia: "🇹🇳",
    Australia: "🇦🇺",
  };

  return specialCases[input.toLowerCase()] || "🌍";
};
