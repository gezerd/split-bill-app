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
        accent: '#E6AE00',
        'accent-dim': '#E6AE0026',
        'on-accent': '#111111',
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
          500: '#E6AE00',
          600: '#C99B00',
        },
        secondary: {
          50: '#E6AE0026',
          500: '#E6AE00',
        },
      },
    },
  },
  plugins: [],
}
