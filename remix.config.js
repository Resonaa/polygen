/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  browserNodeBuiltinsPolyfill: {
    modules: {
      url: true
    }
  },
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  serverBuildPath: "server/build/index.js",
  serverModuleFormat: "cjs",
  server: "server/index.ts",
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
    "fault",
    "devlop",
    "html-url-attributes"
  ]
};
