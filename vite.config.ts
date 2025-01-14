import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [tsconfigPaths()],
  build: {
    target: "ESNext",
    rollupOptions: {
      output: {
        manualChunks: {
          chunk: [
            "three",
            "lodash",
            "iwanthue",
            "lit",
            "lz-string",
            "simplex-noise"
          ]
        }
      }
    }
  }
} satisfies UserConfig;
