/**
 * @type {import("@remix-run/dev").AppConfig}
 */
const config = {
  assetsBuildDirectory: "build/",
  browserNodeBuiltinsPolyfill: { modules: { url: true } },
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  server: "server.ts",
  serverBuildPath: "build/server/index.js"
};

export default config;
