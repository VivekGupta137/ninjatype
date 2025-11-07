// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path"; // Import the path module
import { fileURLToPath } from "node:url";

// ESM-safe __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://ninjatype.com', // Update with your actual domain
  integrations: [react(), mdx(), sitemap()],
  output: "static",
  // prefetch: true,

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