// Design Token System for Phase 4
// Single source of truth for colors, spacing, typography, shadows, etc.

export const DESIGN_TOKENS = {
  // Color palette
  colors: {
    // Primary
    cyan: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00BCD4',
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
    },
    // Secondary
    purple: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
    // Success
    emerald: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBEF63',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },
    // Amber/Warning
    amber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    // Red/Critical
    red: {
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    // Slate/Neutral
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },

  // Spacing scale (based on 4px grid)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
  },

  // Typography
  typography: {
    fonts: {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Shadows
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(34, 211, 238, 0.3)',
    glowPurple: '0 0 20px rgba(168, 85, 247, 0.3)',
  },

  // Border radius
  radii: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  // Blur
  blur: {
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Motion/Transitions
  transitions: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
    slower: '500ms ease-out',
  },

  // Z-index scale
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
};

// Theme-aware gradient presets
export const GRADIENTS = {
  // UI gradients
  primary: 'from-cyan-500 to-cyan-600',
  secondary: 'from-purple-500 to-purple-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-amber-500 to-amber-600',
  critical: 'from-red-500 to-red-600',

  // Background gradients
  bgDark: 'from-slate-900 via-slate-800 to-slate-900',
  bgLight: 'from-slate-50 via-white to-slate-50',

  // Accent gradients
  accentCyanPurple: 'from-cyan-400 to-purple-400',
  accentPurplePink: 'from-purple-400 to-pink-400',
  accentEmeraldCyan: 'from-emerald-400 to-cyan-400',
};

// Animation presets
export const ANIMATIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 },
  },
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
  },
};

// Component variants using tokens
export const COMPONENT_VARIANTS = {
  card: {
    base: 'rounded-md bg-white/5 backdrop-blur-md border border-white/10',
    hover: 'hover:bg-white/10 hover:border-white/20 transition-colors',
    glass: 'bg-slate-900/40 backdrop-blur-xl border border-white/10',
  },
  button: {
    base: 'font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-400',
    secondary: 'bg-white/10 hover:bg-white/20 text-white focus:ring-cyan-400',
  },
};
