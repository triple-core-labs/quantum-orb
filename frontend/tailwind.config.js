/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: '#F8EF00',
        pale: '#FCFDC7'
      },
      screens: {
        "max-md": { max: "768px" },
        "max-lg": { max: "1024px" },
        limit: "1440px",
      },
    },
  },
  plugins: [],
}

