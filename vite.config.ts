import { vitePlugin as remix } from "@remix-run/dev";
import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [
    remix({
      future: {
        unstable_singleFetch: true
      }
    }),
    tsconfigPaths()
  ],
  build: {
    target: "ESNext"
  },
  publicDir: "static/public"
} satisfies UserConfig;
