module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write'],
  '*.{ts,tsx}': [() => 'npm run type-check'],
};
