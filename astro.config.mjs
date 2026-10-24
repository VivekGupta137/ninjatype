// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path"; // Import the path module
import { fileURLToPath } from "node:url";

// ESM-safe __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import partytown from "@astrojs/partytown";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import { VitePWA } from "vite-plugin-pwa";
import Icons from "unplugin-icons/vite";
import tailwindcss from "@tailwindcss/vite";

// Separate explicitly ported dev servers so they cannot overwrite each other's
// optimized dependencies while sharing this checkout.
const portArgumentIndex = process.argv.indexOf("--port");
const devCachePort =
    process.argv.find((argument) => argument.startsWith("--port="))?.slice(7) ??
    (portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : "default");

// https://astro.build/config
export default defineConfig({
    site: "https://www.ninjatype.com",
    trailingSlash: "always",
    server: { host: "127.0.0.1", port: 4347 },
    integrations: [
        react(),
        mdx(),
        sitemap({
            filter: (page) => !page.endsWith("/hacker/") && !/\/(?:multiplayer|online)\/?$/.test(page),
        }),
        compress({
            CSS: true,
            // Astro already minifies HTML while preserving React hydration markers.
            HTML: false,
            Image: true,
            JavaScript: true,
            SVG: true,
        }),
        partytown({
            config: {
                forward: ["dataLayer.push", "sa_event"],
            },
        }),
    ],
    output: "static",
    prefetch: true,

    markdown: {
        rehypePlugins: [
            rehypeSlug,
            [
                rehypeExternalLinks,
                {
                    target: "_blank",
                    rel: ["noopener", "noreferrer"],
                },
            ],
        ],
    },

    vite: {
        server: {
            strictPort: true,
            proxy: {
                "/api/multiplayer": {
                    target: "http://127.0.0.1:8787",
                    // Change Host, while keeping the browser's Origin for the Worker allowlist.
                    changeOrigin: true,
                    rewriteWsOrigin: false,
                    ws: true,
                },
            },
        },
        cacheDir: path.resolve(__dirname, "node_modules/.vite", devCachePort),
        optimizeDeps: {
            include: ["@tanstack/react-table"],
        },
        plugins: [
            tailwindcss(),
            Icons({
                compiler: "jsx",
                jsx: "react",
            }),

            VitePWA({
                registerType: "autoUpdate",
                includeAssets: [
                    "favicon.ico",
                    "robots.txt",
                    "fonts/**",
                    "themes/**",
                ],
                manifest: false, // Use existing manifest.json
                workbox: {
                    navigateFallbackDenylist: [/^\/api\//],
                    globPatterns: ["**/*.{js,css,html,png,jpg,svg,woff2}"],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "google-fonts-stylesheets",
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                            },
                        },
                        {
                            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "google-fonts-webfonts",
                                expiration: {
                                    maxEntries: 30,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                            },
                        },
                        {
                            urlPattern: /^https:\/\/www\.googletagmanager\.com/,
                            handler: "NetworkFirst",
                            options: {
                                cacheName: "google-analytics",
                                networkTimeoutSeconds: 3,
                            },
                        },
                    ],
                },
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"), // Alias '@' to the 'src' directory
                "#root": path.resolve(__dirname, "./"), // Alias '#root' to the project root
            },
        },
    },
});
