/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barn: {
          950: '#1a1209',
          900: '#2a1f12',
          800: '#3d2e1c',
          700: '#524028',
        },
        cream: {
          50: '#faf6ef',
          100: '#f3ead8',
          200: '#e8d9bc',
        },
        yolk: {
          400: '#f0b429',
          500: '#e09b12',
          600: '#c47f08',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(240, 180, 41, 0.35)',
      },
    },
  },
  plugins: [],
}
