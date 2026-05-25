// Accessibility configuration and utilities for Phase 4
import React from 'react';

export const A11Y_CONFIG = {
  // Keyboard navigation shortcuts
  shortcuts: {
    focusSearch: ['Ctrl', 'K'],
    nextRecommendation: ['Tab'],
    previousRecommendation: ['Shift', 'Tab'],
    acceptRecommendation: ['Enter'],
    expandCard: ['Space'],
  },

  // Contrast ratios (WCAG AA minimum)
  minContrastRatio: 4.5,

  // Focus styles
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950',

  // Motion preferences
  motionSafe: {
    duration: 0,
    transition: 'none',
  },
  motionPreferred: {
    duration: 0.3,
    transition: 'all 0.3s ease-out',
  },
};

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ARIA labels and roles for common patterns
export const A11Y_LABELS = {
  dashboard: {
    role: 'main',
    ariaLabel: 'Dashboard',
  },
  dailyFocus: {
    role: 'section',
    ariaLabel: 'Your focus today',
    ariaLive: 'polite',
  },
  recommendationCard: {
    role: 'article',
    ariaLabel: 'Recommendation',
  },
  skillRadar: {
    role: 'img',
    ariaLabel: 'Skill mastery radar chart',
  },
};

// Accessible icon + text pattern
export function AccessibleButton({ children, icon: Icon, ariaLabel, ...props }) {
  return (
    <button {...props} aria-label={ariaLabel || children}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

// Color blind friendly palette (WCAG compliant)
export const A11Y_COLORS = {
  primary: '#0891B2',    // Cyan (high contrast on dark/light)
  secondary: '#7C3AED',  // Violet (distinct from cyan)
  success: '#10B981',    // Emerald (accessible green)
  warning: '#D97706',    // Amber (not pure yellow)
  critical: '#DC2626',   // Red (high contrast)
  neutral: '#94A3B8',    // Slate (neutral)
};

