/**
 * Theme tokens — also mirrored in tailwind.config.js.
 * Use this when you need a value outside of className (e.g., StatusBar, nav theme).
 */
export const theme = {
  colors: {
    bg: '#FEFCF0',
    surface: '#FAF7EA',
    surfaceAlt: '#F6F1E4',
    border: 'rgba(99,48,19,0.10)',
    text: '#633013',
    textMuted: 'rgba(99,48,19,0.40)',
    accent: '#D76F48',
    accentPressed: '#B65C3C',
    danger: '#D9534F',
    success: '#2F9E44',
    menu: '#633013',
    chip: 'rgba(224,207,191,0.20)',
    overlay: 'rgba(32,13,2,0.60)',
  },
  // Minimum 44dp touch targets per WCAG 2.2 (2.5.8 Target Size)
  minTouchTarget: 48,
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 26 },
  fontBase: 16,
} as const;
