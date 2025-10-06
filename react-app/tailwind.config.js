/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      colors: {
        brand: {
          50: '#f6f4ff',
          100: '#ece9fe',
          200: '#ddd5fe',
          300: '#c3b5fd',
          400: '#a48afb',
          500: '#9061f9',
          600: '#7e3af2',
          700: '#6c2bd9',
          800: '#5521b5',
          900: '#4a1d96',
        },
      }
    },
  },
  plugins: [],
}
