/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        gold: "#d4af37",
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
