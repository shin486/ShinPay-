/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#338fff',
          600: '#1b6df5',
          700: '#1456e1',
          800: '#1747b6',
          900: '#193e8f',
        },
        sage: {
          50: '#f4f6f4',
          100: '#e6ebe5',
          200: '#d0dbcf',
          300: '#adc1ab',
          400: '#87a285',
          500: '#6a8668',
          600: '#536c51',
          700: '#435641',
          800: '#384637',
          900: '#303b30',
          950: '#171f17',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'marquee-slow': 'marquee 40s linear infinite',
        'marquee-reverse': 'marqueeRev 52s linear infinite',
      },
    },
  },
  plugins: [],
};