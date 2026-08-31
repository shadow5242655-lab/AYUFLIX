/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ayu: {
          red: '#E50914',
          'dark-red': '#B20710',
          black: '#000000',
          'off-black': '#0A0A0A',
          gray: '#A0A0A0',
        },
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(229, 9, 20, 0.6)',
        'red-glow-sm': '0 0 10px rgba(229, 9, 20, 0.4)',
      },
      textShadow: {
        'red-glow': '0 0 20px rgba(229, 9, 20, 0.8)',
      },
    },
  },
  plugins: [],
};
