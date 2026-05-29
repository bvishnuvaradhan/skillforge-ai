import React, { useMemo } from 'react';
import { BREAKPOINTS, COGNITIVE_LOAD } from '../lib/performance';

// Hook to adapt content based on device and cognitive load
export function useResponsiveContent(allContent = []) {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const deviceType = useMemo(() => {
    if (windowWidth < BREAKPOINTS.mobile) return 'mobile';
    if (windowWidth < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  }, [windowWidth]);

  const cognitiveLoad = COGNITIVE_LOAD[deviceType] || COGNITIVE_LOAD.desktop;

  const adaptedContent = useMemo(() => ({
    recommendations: allContent.slice(0, cognitiveLoad.maxRecommendations),
    charts: allContent.slice(0, cognitiveLoad.maxCharts),
    insights: allContent.slice(0, cognitiveLoad.maxInsights),
    density: cognitiveLoad.density,
    deviceType,
  }), [allContent, cognitiveLoad, deviceType]);

  return adaptedContent;
}

// Mobile-optimized layout component
export function MobileResponsiveLayout({ children, density = 'medium' }) {
  const spacingMap = {
    low: 'space-y-4',
    medium: 'space-y-6',
    high: 'space-y-8',
  };

  const paddingMap = {
    low: 'p-4',
    medium: 'p-6',
    high: 'p-8',
  };

  return (
    <div className={`${spacingMap[density]} ${paddingMap[density]}`}>
      {children}
    </div>
  );
}

// Adaptive grid that changes based on device
export function ResponsiveGrid({ children, columns = { mobile: 1, tablet: 2, desktop: 3 } }) {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridClass = useMemo(() => {
    if (windowWidth < BREAKPOINTS.mobile) return `grid-cols-${columns.mobile}`;
    if (windowWidth < BREAKPOINTS.tablet) return `grid-cols-${columns.tablet}`;
    return `grid-cols-${columns.desktop}`;
  }, [windowWidth, columns]);

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {children}
    </div>
  );
}

// Mobile card - simplified for small screens
export function MobileCard({ title, value, subtext, icon: Icon, color = 'cyan' }) {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-500/5',
    purple: 'from-purple-500/20 to-purple-500/5',
    emerald: 'from-emerald-500/20 to-emerald-500/5',
    pink: 'from-pink-500/20 to-pink-500/5',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 border border-white/10`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs opacity-50 truncate">{title}</p>
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          {subtext && <p className="text-xs opacity-40 mt-1 line-clamp-2">{subtext}</p>}
        </div>
        {Icon && <Icon size={20} className="flex-shrink-0 opacity-50" />}
      </div>
    </div>
  );
}

// Simplified chart for mobile (static or minimal animation)
export function MobileChart({ title, data, type = 'bar' }) {
  const maxValue = Math.max(...data.map(d => d.value || 0));

  // keep helper referenced to avoid unused warnings in some bundles
  void maxValue;
  // defensive reference for param 'type'
  void type;

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-4">
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs truncate">{item.label}</span>
              <span className="text-xs opacity-70">{item.value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
