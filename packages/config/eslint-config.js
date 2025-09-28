module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "warn"
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  }
};