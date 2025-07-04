export default {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{ts,tsx}": ["bash -c 'npm run type-check'"],
};
