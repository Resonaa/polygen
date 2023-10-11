const OFF = 0;
const ERROR = 2;

/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname
  },
  plugins: ["chakra-ui"],
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier"
  ],
  ignorePatterns: ["public/**/*.js"],
  rules: {
    "import/order": [
      ERROR,
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        groups: ["builtin", "external", "internal", "parent", "sibling"],
        "newlines-between": "always"
      }
    ],
    "@typescript-eslint/no-var-requires": OFF,
    "chakra-ui/props-order": ERROR,
    "chakra-ui/props-shorthand": ERROR,
    "chakra-ui/require-specific-component": ERROR
  },
  root: true
};
