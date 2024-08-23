/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: 'class', // Enables dark mode via a class
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0071EF',
        },
        secondary: {
          DEFAULT: '#00EFA7',
        },
        tertiary: {
          DEFAULT: '#FFC600',
        },
      },
      backgroundColor: {
        'light-bg': '#f3f4f6',
        'dark-bg': '#1f2937',
      },
      textColor: {
        DEFAULT: '#1f2937', // Light mode default text color
        dark: '#f3f4f6',    // Dark mode default text color
      },
    },
  },
  plugins: [],
}
