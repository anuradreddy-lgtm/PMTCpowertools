/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F8',
          100: '#C9D5E8',
          200: '#9FB4D3',
          500: '#2B5A9E',
          600: '#1E4585',
          700: '#16346B',
          800: '#0E2450',
          900: '#0A1A3A',
        },
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2B5A9E',
          dark: '#0E2450',
        },
        accent: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.06)',
        hover: '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
