/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    },
    project: true,
    tsconfigRootDir: __dirname
  },

  env: {
    browser: true,
    commonjs: true,
    es6: true
  },

  // Base config
  extends: ["eslint:recommended"],

  plugins: ["@cspell"],
  rules: {
    "@cspell/spellchecker": [
      "warn",
      {
        autoFix: true,
        checkStrings: false,
        checkStringTemplates: false,
        cspell: {
          words: [
            "polygen",
            "fastify",
            "nprogress",
            "revalidator",
            "usercontent",
            "autosize",
            "rehype",
            "katex",
            "chakra",
            "pixi",
            "stylis",
            "isbot",
            "leaderboard",
            "lngs"
          ]
        }
      }
    ]
  },

  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y", "chakra-ui"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "prettier"
      ],
      settings: {
        react: {
          version: "detect"
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" }
        ]
      },
      rules: {
        "react/jsx-no-leaked-render": [
          "warn",
          { validStrategies: ["ternary"] }
        ],
        "chakra-ui/props-order": "error",
        "chakra-ui/props-shorthand": "error",
        "chakra-ui/require-specific-component": "error"
      }
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"]
          },
          typescript: {
            alwaysTryTypes: true
          }
        }
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/stylistic",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier"
      ],
      rules: {
        "import/order": [
          "error",
          {
            alphabetize: { caseInsensitive: true, order: "asc" },
            groups: ["builtin", "external", "internal", "parent", "sibling"],
            "newlines-between": "always"
          }
        ],
        "import/no-named-as-default-member": "off"
      }
    },

    // Markdown
    {
      files: ["**/*.md"],
      plugins: ["markdown"],
      extends: ["plugin:markdown/recommended", "prettier"]
    },

    // Node
    {
      files: [".eslintrc.js"],
      env: {
        node: true
      }
    }
  ]
};
