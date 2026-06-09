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
      keyframes: {
        'toast-in': {
          '0%':   { opacity: '0', transform: 'translateX(0.75rem) translateY(-0.25rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)       translateY(0)' },
        },
        'toast-out': {
          '0%':   { opacity: '1', transform: 'translateX(0)       translateY(0)' },
          '100%': { opacity: '0', transform: 'translateX(0.75rem) translateY(-0.25rem)' },
        },
      },
      animation: {
        'toast-in':  'toast-in  0.22s ease-out',
        'toast-out': 'toast-out 0.18s ease-in forwards',
      },
    },
  },
  plugins: [],
}
