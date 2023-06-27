const OFF = 0;
const ERROR = 2;

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node"
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
    "@typescript-eslint/no-var-requires": OFF
  }
};
