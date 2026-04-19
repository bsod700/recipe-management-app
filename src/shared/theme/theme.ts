/**
 * Theme tokens — also mirrored in tailwind.config.js.
 * Use this when you need a value outside of className (e.g., StatusBar, nav theme).
 */
export const theme = {
  colors: {
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
  // Minimum 44dp touch targets per WCAG 2.2 (2.5.8 Target Size)
  minTouchTarget: 48,
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 14, xl: 20 },
  fontBase: 16,
} as const;
