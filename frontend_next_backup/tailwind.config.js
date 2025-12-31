/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1014",
        sidebar: "#0B0C0F",
        primary: "#00A3FF",
        card: "#181A20",
        "card-hover": "#22252C",
        text: {
           primary: "#FFFFFF",
           secondary: "#9CA3AF"
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
