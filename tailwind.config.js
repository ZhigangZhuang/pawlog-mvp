/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7EF",
        ink: "#2E2B28",
        clay: "#E97843",
        moss: "#6A9B6B",
        rose: "#D96060",
        sand: "#EFE2D0",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(73, 56, 40, 0.10)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
