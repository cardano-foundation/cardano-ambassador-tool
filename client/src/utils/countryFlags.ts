export const getCountryFlag = (code: string): string => {
  if (!code) return 'https://flagcdn.com/ua.svg';
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
};
