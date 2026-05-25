// Performance budget and constraints for Phase 4 frontend
// Ensures visual ambitions (Three.js, React Flow, animations) don't harm performance

export const PERFORMANCE_BUDGET = {
  // FPS targets
  targetFPS: {
    dashboard: 60,
    animations: 55,
    charts: 50,
    graphs: 45,
  },

  // Animation constraints
  animations: {
    maxDurationMs: 600,
    maxBlurRadius: 24,
    disabledOnLowEnd: true,
    reduceOnMobile: true,
  },

  // Component render time targets (ms)
  renderBudgets: {
    dashboard: 500,
    card: 100,
    chart: 300,
    graph: 800,
  },

  // Bundle size targets
  budgets: {
    recharts: 50, // kb
    framerMotion: 30,
    reactFlow: 60,
    totalJS: 250,
  },

  // Image optimization
  images: {
    maxUnoptimized: 0,
    nextImageRequired: true,
    lazy: true,
  },

  // Blur and shader limits
  blur: {
    maxRadius: 24,
    disabledOnMobile: false,
    alternatives: true, // fallback to backdrop-filter alternatives
  },

  // Graph virtualization
  graph: {
    maxNodesVisible: 50,
    virtualizeAbove: 100,
    lazy: true,
  },
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 640,      // sm
  tablet: 1024,     // lg
  desktop: 1280,    // xl
  wide: 1920,       // 2xl
};

// Cognitive load limits per viewport
export const COGNITIVE_LOAD = {
  mobile: {
    maxRecommendations: 1,
    maxCharts: 1,
    maxInsights: 2,
    density: 'low',
  },
  tablet: {
    maxRecommendations: 3,
    maxCharts: 2,
    maxInsights: 3,
    density: 'medium',
  },
  desktop: {
    maxRecommendations: 5,
    maxCharts: 3,
    maxInsights: 5,
    density: 'high',
  },
};

// Motion config respecting reduced-motion
export function getMotionConfig(prefersReducedMotion) {
  if (prefersReducedMotion) {
    return {
      duration: 0,
      type: 'tween',
      animate: false,
    };
  }
  return {
    duration: 0.3,
    type: 'spring',
    stiffness: 100,
    damping: 15,
    animate: true,
  };
}

// Device detection
export function getDeviceType(windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200) {
  if (windowWidth < BREAKPOINTS.mobile) return 'mobile';
  if (windowWidth < BREAKPOINTS.tablet) return 'tablet';
  if (windowWidth < BREAKPOINTS.wide) return 'desktop';
  return 'wide';
}

// FPS monitoring utility
export class FPSMonitor {
  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.frames = 0;
    this.lastTime = performance.now();
    this.currentFPS = 0;
  }

  tick() {
    this.frames++;
    const now = performance.now();
    if (now >= this.lastTime + 1000) {
      this.currentFPS = Math.round(this.frames * 1000 / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;
    }
    return this.currentFPS;
  }

  isBelowBudget() {
    return this.currentFPS >= this.targetFPS * 0.9; // 90% of target
  }
}
