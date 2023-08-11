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
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    /^hast-util.*/,
    /^mdast-util.*/,
    /^micromark.*/,
    /^unist-util.*/,
    /^vfile.*/,
    "react-markdown",
    "longest-streak",
    "property-information",
    "space-separated-tokens",
    "bail",
    "comma-separated-tokens",
    "is-plain-obj",
    "trough",
    "hastscript",
    "web-namespaces",
    "decode-named-character-reference",
    "trim-lines",
    "character-entities",
    "ccount",
    "markdown-table",
    "escape-string-regexp",
    "lowlight",
    "fault"
  ]
};
