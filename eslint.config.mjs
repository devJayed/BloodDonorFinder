import { defineConfig, globalIgnores } from "eslint/config"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import typescriptEslint from "@typescript-eslint/eslint-plugin"

export default defineConfig([
  ...nextCoreWebVitals,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_|^actionTypes$",
        },
      ],
    },
  },
  globalIgnores([".next/**", "next-env.d.ts"]),
])
