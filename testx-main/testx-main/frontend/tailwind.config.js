/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'cloudtype-blue': '#1083fe',
        'cloudtype-blue-hover': '#0070f3',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}