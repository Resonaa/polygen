import type { UserConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  build: {
    target: "ESNext"
  },
  plugins: [wasm(), topLevelAwait(), comlink(), tsconfigPaths()],
  worker: {
    format: "es",
    plugins: () => [wasm(), topLevelAwait(), comlink(), tsconfigPaths()]
  }
} satisfies UserConfig;
