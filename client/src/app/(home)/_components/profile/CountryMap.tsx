import React from 'react';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';

interface CountryMapProps {
  country: string;
  className?: string;
}

// Country coordinates (latitude, longitude) for all countries
const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  "Afghanistan": { lat: 33.9391, lng: 67.7100 },
  "Albania": { lat: 41.1533, lng: 20.1683 },
  "Algeria": { lat: 28.0339, lng: 1.6596 },
  "Andorra": { lat: 42.5063, lng: 1.5218 },
  "Angola": { lat: -11.2027, lng: 17.8739 },
  "Argentina": { lat: -38.4161, lng: -63.6167 },
  "Armenia": { lat: 40.0691, lng: 45.0382 },
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "Austria": { lat: 47.5162, lng: 14.5501 },
  "Azerbaijan": { lat: 40.1431, lng: 47.5769 },
  "Bahamas": { lat: 25.0343, lng: -77.3963 },
  "Bahrain": { lat: 25.9304, lng: 50.6378 },
  "Bangladesh": { lat: 23.6850, lng: 90.3563 },
  "Barbados": { lat: 13.1939, lng: -59.5432 },
  "Belarus": { lat: 53.7098, lng: 27.9534 },
  "Belgium": { lat: 50.5039, lng: 4.4699 },
  "Belize": { lat: 17.1899, lng: -88.4976 },
  "Benin": { lat: 9.3077, lng: 2.3158 },
  "Bhutan": { lat: 27.5142, lng: 90.4336 },
  "Bolivia": { lat: -16.2902, lng: -63.5887 },
  "Bosnia and Herzegovina": { lat: 43.9159, lng: 17.6791 },
  "Botswana": { lat: -22.3285, lng: 24.6849 },
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "Brunei": { lat: 4.5353, lng: 114.7277 },
  "Bulgaria": { lat: 42.7339, lng: 25.4858 },
  "Burkina Faso": { lat: 12.2383, lng: -1.5616 },
  "Burundi": { lat: -3.3731, lng: 29.9189 },
  "Cabo Verde": { lat: 16.5388, lng: -24.0132 },
  "Cambodia": { lat: 12.5657, lng: 104.9910 },
  "Cameroon": { lat: 7.3697, lng: 12.3547 },
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Central African Republic": { lat: 6.6111, lng: 20.9394 },
  "Chad": { lat: 15.4542, lng: 18.7322 },
  "Chile": { lat: -35.6751, lng: -71.5430 },
  "China": { lat: 35.8617, lng: 104.1954 },
  "Colombia": { lat: 4.5709, lng: -74.2973 },
  "Comoros": { lat: -11.6455, lng: 43.3333 },
  "Congo (Brazzaville)": { lat: -0.2280, lng: 15.8277 },
  "Congo (Kinshasa)": { lat: -4.0383, lng: 21.7587 },
  "Costa Rica": { lat: 9.7489, lng: -83.7534 },
  "Croatia": { lat: 45.1000, lng: 15.2000 },
  "Cuba": { lat: 21.5218, lng: -77.7812 },
  "Cyprus": { lat: 35.1264, lng: 33.4299 },
  "Czech Republic": { lat: 49.8175, lng: 15.4730 },
  "Denmark": { lat: 56.2639, lng: 9.5018 },
  "Djibouti": { lat: 11.8251, lng: 42.5903 },
  "Dominica": { lat: 15.4150, lng: -61.3710 },
  "Dominican Republic": { lat: 18.7357, lng: -70.1627 },
  "Ecuador": { lat: -1.8312, lng: -78.1834 },
  "Egypt": { lat: 26.0975, lng: 31.2357 },
  "El Salvador": { lat: 13.7942, lng: -88.8965 },
  "Equatorial Guinea": { lat: 1.6508, lng: 10.2679 },
  "Eritrea": { lat: 15.1794, lng: 39.7823 },
  "Estonia": { lat: 58.5953, lng: 25.0136 },
  "Eswatini": { lat: -26.5225, lng: 31.4659 },
  "Ethiopia": { lat: 9.1450, lng: 40.4897 },
  "Fiji": { lat: -16.7784, lng: 179.4144 },
  "Finland": { lat: 61.9241, lng: 25.7482 },
  "France": { lat: 46.2276, lng: 2.2137 },
  "Gabon": { lat: -0.8037, lng: 11.6094 },
  "Gambia": { lat: 13.4432, lng: -15.3101 },
  "Georgia": { lat: 42.3154, lng: 43.3569 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "Ghana": { lat: 7.9465, lng: -1.0232 },
  "Greece": { lat: 39.0742, lng: 21.8243 },
  "Grenada": { lat: 12.1165, lng: -61.6790 },
  "Guatemala": { lat: 15.7835, lng: -90.2308 },
  "Guinea": { lat: 9.9456, lng: -9.6966 },
  "Guinea-Bissau": { lat: 11.8037, lng: -15.1804 },
  "Guyana": { lat: 4.8604, lng: -58.9302 },
  "Haiti": { lat: 18.9712, lng: -72.2852 },
  "Honduras": { lat: 15.2000, lng: -86.2419 },
  "Hungary": { lat: 47.1625, lng: 19.5033 },
  "Iceland": { lat: 64.9631, lng: -19.0208 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "Indonesia": { lat: -0.7893, lng: 113.9213 },
  "Iran": { lat: 32.4279, lng: 53.6880 },
  "Iraq": { lat: 33.2232, lng: 43.6793 },
  "Ireland": { lat: 53.4129, lng: -8.2439 },
  "Israel": { lat: 31.0461, lng: 34.8516 },
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "Jamaica": { lat: 18.1096, lng: -77.2975 },
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "Jordan": { lat: 30.5852, lng: 36.2384 },
  "Kazakhstan": { lat: 48.0196, lng: 66.9237 },
  "Kenya": { lat: -0.0236, lng: 37.9062 },
  "Kiribati": { lat: -3.3704, lng: -168.7340 },
  "Kuwait": { lat: 29.3117, lng: 47.4818 },
  "Kyrgyzstan": { lat: 41.2044, lng: 74.7661 },
  "Laos": { lat: 19.8563, lng: 102.4955 },
  "Latvia": { lat: 56.8796, lng: 24.6032 },
  "Lebanon": { lat: 33.8547, lng: 35.8623 },
  "Lesotho": { lat: -29.6100, lng: 28.2336 },
  "Liberia": { lat: 6.4281, lng: -9.4295 },
  "Libya": { lat: 26.3351, lng: 17.2283 },
  "Liechtenstein": { lat: 47.1660, lng: 9.5554 },
  "Lithuania": { lat: 55.1694, lng: 23.8813 },
  "Luxembourg": { lat: 49.8153, lng: 6.1296 },
  "Madagascar": { lat: -18.7669, lng: 46.8691 },
  "Malawi": { lat: -13.2543, lng: 34.3015 },
  "Malaysia": { lat: 4.2105, lng: 101.9758 },
  "Maldives": { lat: 3.2028, lng: 73.2207 },
  "Mali": { lat: 17.5707, lng: -3.9962 },
  "Malta": { lat: 35.9375, lng: 14.3754 },
  "Marshall Islands": { lat: 7.1315, lng: 171.1845 },
  "Mauritania": { lat: 21.0079, lng: -10.9408 },
  "Mauritius": { lat: -20.3484, lng: 57.5522 },
  "Mexico": { lat: 23.6345, lng: -102.5528 },
  "Micronesia": { lat: 7.4256, lng: 150.5508 },
  "Moldova": { lat: 47.4116, lng: 28.3699 },
  "Monaco": { lat: 43.7384, lng: 7.4246 },
  "Mongolia": { lat: 46.8625, lng: 103.8467 },
  "Montenegro": { lat: 42.7087, lng: 19.3744 },
  "Morocco": { lat: 31.7917, lng: -7.0926 },
  "Mozambique": { lat: -18.6657, lng: 35.5296 },
  "Myanmar": { lat: 21.9162, lng: 95.9560 },
  "Namibia": { lat: -22.9576, lng: 18.4904 },
  "Nauru": { lat: -0.5228, lng: 166.9315 },
  "Nepal": { lat: 28.3949, lng: 84.1240 },
  "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "New Zealand": { lat: -40.9006, lng: 174.8860 },
  "Nicaragua": { lat: 12.8654, lng: -85.2072 },
  "Niger": { lat: 17.6078, lng: 8.0817 },
  "Nigeria": { lat: 9.0820, lng: 8.6753 },
  "North Korea": { lat: 40.3399, lng: 127.5101 },
  "North Macedonia": { lat: 41.6086, lng: 21.7453 },
  "Norway": { lat: 60.4720, lng: 8.4689 },
  "Oman": { lat: 21.4735, lng: 55.9754 },
  "Pakistan": { lat: 30.3753, lng: 69.3451 },
  "Palau": { lat: 7.5150, lng: 134.5825 },
  "Panama": { lat: 8.5380, lng: -80.7821 },
  "Papua New Guinea": { lat: -6.3140, lng: 143.9555 },
  "Paraguay": { lat: -23.4425, lng: -58.4438 },
  "Peru": { lat: -9.1900, lng: -75.0152 },
  "Philippines": { lat: 12.8797, lng: 121.7740 },
  "Poland": { lat: 51.9194, lng: 19.1451 },
  "Portugal": { lat: 39.3999, lng: -8.2245 },
  "Qatar": { lat: 25.3548, lng: 51.1839 },
  "Romania": { lat: 45.9432, lng: 24.9668 },
  "Russia": { lat: 61.5240, lng: 105.3188 },
  "Rwanda": { lat: -1.9403, lng: 29.8739 },
  "Saint Kitts and Nevis": { lat: 17.3578, lng: -62.7830 },
  "Saint Lucia": { lat: 13.9094, lng: -60.9789 },
  "Saint Vincent and the Grenadines": { lat: 12.9843, lng: -61.2872 },
  "Samoa": { lat: -13.7590, lng: -172.1046 },
  "San Marino": { lat: 43.9424, lng: 12.4578 },
  "Sao Tome and Principe": { lat: 0.1864, lng: 6.6131 },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  "Senegal": { lat: 14.4974, lng: -14.4524 },
  "Serbia": { lat: 44.0165, lng: 21.0059 },
  "Seychelles": { lat: -4.6796, lng: 55.4920 },
  "Sierra Leone": { lat: 8.4606, lng: -11.7799 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Slovakia": { lat: 48.6690, lng: 19.6990 },
  "Slovenia": { lat: 46.1512, lng: 14.9955 },
  "Solomon Islands": { lat: -9.6457, lng: 160.1562 },
  "Somalia": { lat: 5.1521, lng: 46.1996 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  "South Sudan": { lat: 6.8770, lng: 31.3070 },
  "Spain": { lat: 40.4637, lng: -3.7492 },
  "Sri Lanka": { lat: 7.8731, lng: 80.7718 },
  "Sudan": { lat: 12.8628, lng: 30.2176 },
  "Suriname": { lat: 3.9193, lng: -56.0278 },
  "Sweden": { lat: 60.1282, lng: 18.6435 },
  "Switzerland": { lat: 46.8182, lng: 8.2275 },
  "Syria": { lat: 34.8021, lng: 38.9968 },
  "Taiwan": { lat: 23.6978, lng: 120.9605 },
  "Tajikistan": { lat: 38.8610, lng: 71.2761 },
  "Tanzania": { lat: -6.3690, lng: 34.8888 },
  "Thailand": { lat: 15.8700, lng: 100.9925 },
  "Timor-Leste": { lat: -8.8742, lng: 125.7275 },
  "Togo": { lat: 8.6195, lng: 0.8248 },
  "Tonga": { lat: -21.1789, lng: -175.1982 },
  "Trinidad and Tobago": { lat: 10.6918, lng: -61.2225 },
  "Tunisia": { lat: 33.8869, lng: 9.5375 },
  "Turkey": { lat: 38.9637, lng: 35.2433 },
  "Turkmenistan": { lat: 38.9697, lng: 59.5563 },
  "Tuvalu": { lat: -7.1095, lng: 177.6493 },
  "Uganda": { lat: 1.3733, lng: 32.2903 },
  "Ukraine": { lat: 48.3794, lng: 31.1656 },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "Uruguay": { lat: -32.5228, lng: -55.7658 },
  "Uzbekistan": { lat: 41.3775, lng: 64.5853 },
  "Vanuatu": { lat: -15.3767, lng: 166.9592 },
  "Vatican City": { lat: 41.9029, lng: 12.4534 },
  "Venezuela": { lat: 6.4238, lng: -66.5897 },
  "Vietnam": { lat: 14.0583, lng: 108.2772 },
  "Yemen": { lat: 15.5527, lng: 48.5164 },
  "Zambia": { lat: -13.1339, lng: 27.8493 },
  "Zimbabwe": { lat: -19.0154, lng: 29.1549 }
};

// Define continent boundaries for focused views
const continentBounds: Record<string, { north: number; south: number; east: number; west: number; zoom: number }> = {
  // Europe
  "Europe": { north: 71, south: 34, east: 40, west: -25, zoom: 4 },
  // North America
  "North America": { north: 85, south: 7, east: -50, west: -170, zoom: 3 },
  // South America
  "South America": { north: 13, south: -60, east: -30, west: -85, zoom: 3 },
  // Africa
  "Africa": { north: 38, south: -35, east: 55, west: -20, zoom: 3 },
  // Asia
  "Asia": { north: 85, south: -10, east: 180, west: 25, zoom: 3 },
  // Oceania
  "Oceania": { north: 30, south: -50, east: 180, west: 110, zoom: 4 },
};

// Map countries to their continents
const countryToContinent: Record<string, string> = {
  // Europe
  "Albania": "Europe", "Andorra": "Europe", "Austria": "Europe", "Belarus": "Europe", "Belgium": "Europe",
  "Bosnia and Herzegovina": "Europe", "Bulgaria": "Europe", "Croatia": "Europe", "Cyprus": "Europe", 
  "Czech Republic": "Europe", "Denmark": "Europe", "Estonia": "Europe", "Finland": "Europe", "France": "Europe",
  "Germany": "Europe", "Greece": "Europe", "Hungary": "Europe", "Iceland": "Europe", "Ireland": "Europe",
  "Italy": "Europe", "Latvia": "Europe", "Liechtenstein": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe",
  "Malta": "Europe", "Moldova": "Europe", "Monaco": "Europe", "Montenegro": "Europe", "Netherlands": "Europe",
  "North Macedonia": "Europe", "Norway": "Europe", "Poland": "Europe", "Portugal": "Europe", "Romania": "Europe",
  "Russia": "Asia", "San Marino": "Europe", "Serbia": "Europe", "Slovakia": "Europe", "Slovenia": "Europe",
  "Spain": "Europe", "Sweden": "Europe", "Switzerland": "Europe", "Ukraine": "Europe", "United Kingdom": "Europe",
  "Vatican City": "Europe",

  // North America
  "Canada": "North America", "United States": "North America", "Mexico": "North America", "Guatemala": "North America",
  "Belize": "North America", "Honduras": "North America", "El Salvador": "North America", "Nicaragua": "North America",
  "Costa Rica": "North America", "Panama": "North America", "Cuba": "North America", "Jamaica": "North America",
  "Haiti": "North America", "Dominican Republic": "North America", "Bahamas": "North America", "Barbados": "North America",
  "Trinidad and Tobago": "North America", "Grenada": "North America", "Saint Lucia": "North America",
  "Saint Vincent and the Grenadines": "North America", "Dominica": "North America", "Antigua and Barbuda": "North America",
  "Saint Kitts and Nevis": "North America",

  // South America
  "Argentina": "South America", "Bolivia": "South America", "Brazil": "South America", "Chile": "South America",
  "Colombia": "South America", "Ecuador": "South America", "Guyana": "South America", "Paraguay": "South America",
  "Peru": "South America", "Suriname": "South America", "Uruguay": "South America", "Venezuela": "South America",

  // Africa
  "Algeria": "Africa", "Angola": "Africa", "Benin": "Africa", "Botswana": "Africa", "Burkina Faso": "Africa",
  "Burundi": "Africa", "Cabo Verde": "Africa", "Cameroon": "Africa", "Central African Republic": "Africa",
  "Chad": "Africa", "Comoros": "Africa", "Congo (Brazzaville)": "Africa", "Congo (Kinshasa)": "Africa",
  "Djibouti": "Africa", "Egypt": "Africa", "Equatorial Guinea": "Africa", "Eritrea": "Africa", "Eswatini": "Africa",
  "Ethiopia": "Africa", "Gabon": "Africa", "Gambia": "Africa", "Ghana": "Africa", "Guinea": "Africa",
  "Guinea-Bissau": "Africa", "Kenya": "Africa", "Lesotho": "Africa", "Liberia": "Africa", "Libya": "Africa",
  "Madagascar": "Africa", "Malawi": "Africa", "Mali": "Africa", "Mauritania": "Africa", "Mauritius": "Africa",
  "Morocco": "Africa", "Mozambique": "Africa", "Namibia": "Africa", "Niger": "Africa", "Nigeria": "Africa",
  "Rwanda": "Africa", "Sao Tome and Principe": "Africa", "Senegal": "Africa", "Seychelles": "Africa",
  "Sierra Leone": "Africa", "Somalia": "Africa", "South Africa": "Africa", "South Sudan": "Africa",
  "Sudan": "Africa", "Tanzania": "Africa", "Togo": "Africa", "Tunisia": "Africa", "Uganda": "Africa",
  "Zambia": "Africa", "Zimbabwe": "Africa",

  // Asia
  "Afghanistan": "Asia", "Armenia": "Asia", "Azerbaijan": "Asia", "Bahrain": "Asia", "Bangladesh": "Asia",
  "Bhutan": "Asia", "Brunei": "Asia", "Cambodia": "Asia", "China": "Asia", "Georgia": "Asia", "India": "Asia",
  "Indonesia": "Asia", "Iran": "Asia", "Iraq": "Asia", "Israel": "Asia", "Japan": "Asia", "Jordan": "Asia",
  "Kazakhstan": "Asia", "Kuwait": "Asia", "Kyrgyzstan": "Asia", "Laos": "Asia", "Lebanon": "Asia",
  "Malaysia": "Asia", "Maldives": "Asia", "Mongolia": "Asia", "Myanmar": "Asia", "Nepal": "Asia",
  "North Korea": "Asia", "Oman": "Asia", "Pakistan": "Asia", "Philippines": "Asia", "Qatar": "Asia",
  "Saudi Arabia": "Asia", "Singapore": "Asia", "South Korea": "Asia", "Sri Lanka": "Asia", "Syria": "Asia",
  "Taiwan": "Asia", "Tajikistan": "Asia", "Thailand": "Asia", "Timor-Leste": "Asia", "Turkey": "Asia",
  "Turkmenistan": "Asia", "United Arab Emirates": "Asia", "Uzbekistan": "Asia", "Vietnam": "Asia", "Yemen": "Asia",

  // Oceania
  "Australia": "Oceania", "Fiji": "Oceania", "Kiribati": "Oceania", "Marshall Islands": "Oceania",
  "Micronesia": "Oceania", "Nauru": "Oceania", "New Zealand": "Oceania", "Palau": "Oceania",
  "Papua New Guinea": "Oceania", "Samoa": "Oceania", "Solomon Islands": "Oceania", "Tonga": "Oceania",
  "Tuvalu": "Oceania", "Vanuatu": "Oceania",
};

// Main CountryMap component - uses continent-focused OpenStreetMap with custom overlay
// Main CountryMap component - Map-like design with geographic context
export const CountryMap: React.FC<CountryMapProps> = ({ country, className = "" }) => {
  const coordinates = countryCoordinates[country];
  
  if (!coordinates) {
    return <SimpleLocationCard country={country} className={className} />;
  }

  const continent = countryToContinent[country];
  const bounds = continent ? continentBounds[continent] : null;

  // Calculate marker position within continent
  let markerPosition = { left: '50%', top: '50%' };
  if (bounds) {
    const xPercent = ((coordinates.lng - bounds.west) / (bounds.east - bounds.west)) * 100;
    const yPercent = ((bounds.north - coordinates.lat) / (bounds.north - bounds.south)) * 100;
    markerPosition = {
      left: `${Math.max(10, Math.min(90, xPercent))}%`,
      top: `${Math.max(10, Math.min(90, yPercent))}%`
    };
  }

  return (
    <div className={`mt-6 rounded-lg border border-border/40 overflow-hidden ${className}`}>
      <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-slate-700 dark:to-slate-600">
        
        {/* Simple continent outline */}
        <div className="absolute inset-0">
          {continent === 'South America' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M80 30 Q120 25 140 40 L145 60 Q150 80 145 100 L140 120 Q130 140 120 135 L100 130 Q80 115 85 95 L80 75 Q75 55 80 30 Z" 
                    fill="rgba(34, 197, 94, 0.4)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1"/>
            </svg>
          )}
          {continent === 'Europe' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M120 40 Q150 35 180 45 L190 65 Q185 80 170 85 L140 80 Q120 65 120 40 Z" 
                    fill="rgba(59, 130, 246, 0.4)" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1"/>
            </svg>
          )}
          {continent === 'Africa' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M130 20 Q160 15 180 30 L185 60 Q190 90 185 120 L175 140 Q160 145 145 140 L130 120 Q125 90 130 60 L125 40 Q125 25 130 20 Z" 
                    fill="rgba(251, 146, 60, 0.4)" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="1"/>
            </svg>
          )}
          {continent === 'Asia' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M100 25 Q150 20 200 30 L240 45 Q245 65 235 80 L200 85 Q150 80 120 75 L100 60 Q95 40 100 25 Z" 
                    fill="rgba(34, 197, 94, 0.4)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1"/>
            </svg>
          )}
          {continent === 'North America' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M50 30 Q90 25 130 35 L140 55 Q135 75 125 85 L90 90 Q60 85 50 65 L45 45 Q45 30 50 30 Z" 
                    fill="rgba(239, 68, 68, 0.4)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1"/>
            </svg>
          )}
          {continent === 'Oceania' && (
            <svg viewBox="0 0 300 160" className="w-full h-full opacity-30">
              <path d="M150 70 Q180 65 200 75 L205 90 Q200 100 180 95 L150 90 Q145 80 150 70 Z" 
                    fill="rgba(6, 182, 212, 0.4)" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="1"/>
            </svg>
          )}
        </div>

        {/* Just the Cardano marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={markerPosition}
        >
          <div className="w-10 h-10 bg-primary-base rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <CardanoIcon size={20} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};
export const SimpleLocationCard: React.FC<CountryMapProps> = ({ country, className = "" }) => {
  return (
    <div className={`mt-6 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-base flex items-center justify-center">
            <CardanoIcon size={20} color="white" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Ambassador Location</div>
            <div className="text-lg font-semibold text-foreground">{country}</div>
          </div>
        </div>
        <div className="text-primary-base">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </div>
  );
};