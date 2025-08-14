// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'], // Sets Inter as the default body font
        'quantico': ['Quantico', 'sans-serif'], // Creates a new 'font-quantico' utility
      },
      colors: {
        'union-blue': '#002654',
        'goal-red': '#CE1126',
        'star-silver': '#A2AAAD',
        'ice-white': '#FFFFFF',
        'slate-gray': '#4A5568',
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out'
      }
    },
  },
  plugins: [],
}