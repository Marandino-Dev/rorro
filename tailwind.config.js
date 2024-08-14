/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#a9d6e5',
          100: '#89c2d9',
          200: '#61a5c2',
          300: '#468faf',
          400: '#2c7da0',
          500: '#2a6f97',
          600: '#014f86',
          700: '#01497c',
          800: '#013a63',
          900: '#012a4a',
        },
        secondary: {
          50: '#979dac',
          100: '#7d8597',
          200: '#5c677d',
          300: '#33415c',
        },
      },
    },
  },
  plugins: [],
}
