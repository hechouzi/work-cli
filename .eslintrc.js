module.exports = {
  extends: ["airbnb", "prettier", "plugin:react/recommended", "prettier/react"],
  plugins: ["react", "jsx-a11y"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "no-new": ["off"],
    "no-unused-vars": ["warn"],
    "no-console": [
      "error",
      {
        allow: ["warn", "error"],
      },
    ],
    "no-undef": ["off"],
    "no-tabs": ["off"],
    "no-debugger": ["off"],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "new-cap": ["off"],
    "react/prop-types": ["off"],
    "import/prefer-default-export": ["off"],
    "react/jsx-filename-extension": ["warn", { extensions: [".js", ".jsx"] }],
    "react/display-name": ["off"],
    "react/jsx-props-no-spreading": 0,
    "react/jsx-fragments": 0,
    "no-plusplus": 0,
    "no-unused-expressions": 0,
    "import/no-extraneous-dependencies": 0,
    "jsx-a11y/no-static-element-interactions": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/media-has-caption": 0,
    "react/no-string-refs": 0,
  },
};
