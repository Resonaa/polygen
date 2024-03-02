import { vitePlugin as remix } from "@remix-run/dev";
import type { UserConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [
    remix(),
    tsconfigPaths(),
    VitePWA({
      injectRegister: false,
      manifest: {
        name: "polygen",
        short_name: "polygen",
        theme_color: "#ffffff",
        display: "minimal-ui",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      includeAssets: ["favicon.svg"],
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: "module"
      }
    })
  ],
  build: {
    target: "ESNext"
  },
  publicDir: "static/public"
} satisfies UserConfig;
