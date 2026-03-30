/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Sets Comico as the primary sans font for Tailwind
        sans: ['"Comico"', 'system-ui', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}