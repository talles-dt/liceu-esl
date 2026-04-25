import next from "eslint-config-next";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "prep/**",
      "plan/**",
      "01-product/**",
      "02-architecture/**",
      "03-development/**",
      "04-pedagogy/**",
      "05-ops/**",
    ],
  },
  ...next,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default config;
