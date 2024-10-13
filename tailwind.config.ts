import type { Config } from "tailwindcss";

import baseConfig from "@fleak-org/tailwind-config";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [
    ...baseConfig.content,
    // include app components
    "app/**/*.{ts,tsx}",
    // include @fleak-org/ui components
    "./node_modules/@fleak-org/ui/**/*.{js,mjs,ts,tsx}",
  ],
  presets: [baseConfig],
  theme: {
    extend: {
      colors: {
        fleak: {
          "50": "#ffffa4",
          "100": "#f7ff8a",
          "200": "#dbff6f",
          "300": "#c0ff53",
          "400": "#a4ff35",
          "500": "#89ED00",
          "600": "#6dd300",
          "700": "#4ab500",
          "800": "#159200",
          "900": "#007100",
          "950": "#005e00",
        },
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
