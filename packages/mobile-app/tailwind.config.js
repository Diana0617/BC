/** @type {import('tailwindcss').Config} */
const { designTokens } = require('../shared/config/designTokens');

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      fontSize: designTokens.fontSize,
      fontWeight: designTokens.fontWeight,
      lineHeight: designTokens.lineHeight,
      fontFamily: {
        // React Native usa fonts del sistema por defecto
        'sans': ['System'],
        'mono': ['Courier'],
      },
    },
  },
  plugins: [],
}

