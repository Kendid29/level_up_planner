// Level Up Planner: Design Tokens
// Defined strictly in accordance with DESIGN.md and Anti-Slop principles

export const colors = {
  // Core palette
  cream: '#F7F5EF', // Primary app background
  paper: '#FFFEFA', // Card, modal, sheet surfaces
  sage: '#A8B9A0', // Soft accent
  forest: '#526B56', // Primary action, active tabs
  beige: '#E8E1D5', // Secondary surface, progress track
  charcoal: '#333831', // Primary text
  muted: '#7C8379', // Secondary text
  line: '#E8E4DA', // Borders and dividers
  paleSage: '#EEF1E9', // Highlight, active chip background
  softBlue: '#DCE8E8', // Secondary accent

  // Semantic palette
  success: '#426B50',
  warning: '#9A6B32',
  error: '#A34F49',
  info: '#526B75',

  // Utility colors
  white: '#FFFFFF',
  overlay: 'rgba(51, 56, 49, 0.45)', // Charcoal with opacity for modal backdrop
  cardHover: '#F4EFEB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const radius = {
  sm: 8, // Small chips, tags
  md: 12, // Inputs, buttons
  lg: 16, // Cards
  xl: 20, // Featured cards, sheets
  full: 999, // Pills, avatars, circular checkboxes
};

export const typography = {
  display: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700' as const,
    color: colors.charcoal,
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: colors.charcoal,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: colors.charcoal,
  },
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.charcoal,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.charcoal,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: colors.muted,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
    color: colors.muted,
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
};
