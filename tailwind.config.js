/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        "120": "30rem",
        "150": "37.5rem",
        "180": "45rem",
        "210": "52.5rem",
        "240": "60rem",
      }
    },
  },
  plugins: [],
}

