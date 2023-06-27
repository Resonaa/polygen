/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  serverBuildPath: "server/build/index.js",
  future: {
    v2_routeConvention: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_headers: true,
    v2_dev: true
  },
  tailwind: true,
  serverModuleFormat: "esm"
};
