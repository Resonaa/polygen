/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  serverBuildDirectory: "server/build",
  future: {
    v2_routeConvention: true
  }
};
