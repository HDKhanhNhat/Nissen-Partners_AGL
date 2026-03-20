module.exports = {
  extends: "eslint:recommended",
  rules: {
    // enable additional rules
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],

    // override configuration set by extending "eslint:recommended"
    "no-empty": "warn",
    "no-cond-assign": ["error", "always"],

    // disable rules from base configurations
    "for-direction": "off",
    "parserOptions": {
      "sourceType": "module",
    }
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jquery: true,
  },
  ignorePatterns: ["node_module/**/*", "dist/**/*"],
};
