/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // High-contrast palette (WCAG 2.2 AA compliant against dark bg)
        bg: '#0B0B0F',
        surface: '#17171C',
        surfaceAlt: '#1F1F26',
        border: '#2E2E38',
        text: '#F5F5F7',
        textMuted: '#B5B5BE',
        accent: '#FFB020',
        accentPressed: '#E09A17',
        danger: '#FF4D4D',
        success: '#4ADE80',
      },
      fontSize: {
        // Minimum 16px floor per accessibility rules
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['22px', { lineHeight: '30px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
