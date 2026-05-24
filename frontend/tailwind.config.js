/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#990000",
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc7c7",
          300: "#ff9e9e",
          400: "#ff6464",
          500: "#ff2d2d",
          600: "#cc0000",
          700: "#990000",
          800: "#800000",
          900: "#660000",
          950: "#440000",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#fdf9e8",
          100: "#fbf0c4",
          200: "#f7e18b",
          300: "#f2cb48",
          400: "#D4AF37",
          500: "#c49a22",
          600: "#a97a19",
          700: "#875a17",
          800: "#71491a",
          900: "#613d1c",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 15px rgba(212, 175, 55, 0.4)",
        "glow-lg": "0 0 30px rgba(212, 175, 55, 0.5)",
      },
    },
  },
  plugins: [],
};
