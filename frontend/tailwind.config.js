/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        background: '#152D42',
        accent: '#00FDDC',
        'accent-dim': '#00FDDC26',
        'on-accent': '#152D42',
        surface: {
          DEFAULT: '#1C3A54',
          2: '#254862',
          3: '#254862',
        },
        border: '#2E5674',
        gray: {
          100: '#EEF4FA',
          200: '#C8DCEE',
          300: '#A0C4DC',
          400: '#A0C4DC',
          500: '#7AAAB8',
          600: '#7AAAB8',
          700: '#2E5674',
        },
        primary: {
          500: '#00FDDC',
          600: '#00D4B8',
        },
        secondary: {
          50: '#00FDDC26',
          500: '#00FDDC',
        },
      },
    },
  },
  plugins: [],
}
