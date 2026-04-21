/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#0d1f38',
          700: '#142c4a',
        },
        blue: {
          600: '#0a52a8',
          500: '#1e6bc7',
        },
        orange: {
          600: '#f05a1a',
          700: '#c84710',
        },
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'cursive'],
        'barlow': ['"Barlow"', 'sans-serif'],
        'barlow-condensed': ['"Barlow Semi Condensed"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}