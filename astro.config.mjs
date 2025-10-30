// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path"; // Import the path module
import { fileURLToPath } from "node:url";

// ESM-safe __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "static",

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Alias '@' to the 'src' directory
        "#root": path.resolve(__dirname, "./"), // Alias '#root' to the project root
      },
    },
  },

  adapter: cloudflare(),
});