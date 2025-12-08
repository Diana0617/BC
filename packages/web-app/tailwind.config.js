/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        plancyan: {
          DEFAULT: '#06b6d4',
          light: '#67e8f9',
          dark: '#0891b2',
        },
        planred: {
          DEFAULT: '#f87171',
          light: '#fca5a5',
          dark: '#ef4444',
        },
        planyellow: {
          DEFAULT: '#fde047',
          light: '#fef9c3',
          dark: '#facc15',
        },
        planbg: {
          DEFAULT: '#fff',
          dark: '#1e293b',
        },
      },
      fontFamily: {
        'sans': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'nunito': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'beauty': '0 4px 14px 0 rgba(236, 72, 153, 0.39)',
        'beauty-lg': '0 8px 25px 0 rgba(236, 72, 153, 0.5)',
        'plan': '0 4px 16px 0 rgba(6,182,212,0.12)',
        'plan-lg': '0 8px 32px 0 rgba(248,113,113,0.18)',
      },
      screens: {
        'xs': '475px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
