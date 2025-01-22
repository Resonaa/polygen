import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [tsconfigPaths()],
  build: {
    target: "ESNext"
  }
} satisfies UserConfig;
