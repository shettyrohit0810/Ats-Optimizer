import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/*.css",
      ".next/",
      "out/",
      "dist/",
      "node_modules/",
      "**/*.tsbuildinfo"
    ]
  },
  {
    rules: {
      // Disable TypeScript strict rules for development
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Disable React strict rules
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Disable Next.js strict rules
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "warn",
      
      // General rules
      "no-console": "off"
    }
  }
];

export default eslintConfig;
