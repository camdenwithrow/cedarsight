/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: ['responsive'],
      spacing: {
        '128': '28rem',
      }
    },
  },
  plugins: [],
}