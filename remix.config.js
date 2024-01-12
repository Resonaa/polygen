/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
  assetsBuildDirectory: "build/",
  browserNodeBuiltinsPolyfill: { modules: { url: true } },
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css"],
  server: "server.ts",
  serverBuildPath: "build/server/index.js",
  serverModuleFormat: "cjs",
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
