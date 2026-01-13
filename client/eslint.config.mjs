import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [".next/*", "node_modules/*", "out/*"],
  },
  // This ensures everyone's machine resolves the Next.js plugins correctly
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Add any custom team rules here
    },
  },
];