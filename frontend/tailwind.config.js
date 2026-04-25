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
        surface: {
          DEFAULT: '#3A4D45',
          2: '#4A5E56',
          3: '#3D4E44',
        },
        primary: {
          50: '#2A3520',
          100: '#374527',
          200: '#4D6235',
          300: '#628048',
          400: '#5A6E66',
          500: '#5A6E66',
          600: '#4A5C54',
          700: '#3A4A42',
          800: '#3C4824',
          900: '#283018',
        },
        secondary: {
          50: '#22293A',
          100: '#2A3347',
          200: '#939AAA',
          300: '#ABAFC0',
          400: '#BBC0CF',
          500: '#CDD1DE',
          600: '#B0B5C4',
          700: '#9299A8',
          800: '#737A8A',
          900: '#555C6A',
        },
      },
    },
  },
  plugins: [],
}
