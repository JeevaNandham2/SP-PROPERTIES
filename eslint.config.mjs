import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  { ignores: ["node_modules/**", ".next/**", ".next-dev/**", "dist/**", "public/admin/**", "sp-properties-deployment-*/**", "releases/**", "tmp/**", ".playwright-mcp/**", "test-results/**", "playwright-report/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // The private editor is a standalone React app, outside Next's router/image runtime.
  { files: ["admin/**/*.tsx"], rules: { "@next/next/no-img-element": "off", "@next/next/no-html-link-for-pages": "off" } },
];
export default config;
