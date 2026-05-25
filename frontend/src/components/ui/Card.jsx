export function Card({ children, className = "", glow = false, depth = "level1" }) {
  const depthStyles = {
    level1: 'bg-white/5 backdrop-blur-md border border-white/10 shadow-xs hover:border-white/20',
    level2: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-sm hover:border-white/30',
    level3: 'bg-slate-900/40 backdrop-blur-xl border border-white/20 shadow-md hover:border-cyan-500/30',
    elevated: 'bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 shadow-lg hover:border-cyan-500/50',
  };

  const glowClass = glow ? 'shadow-[0_0_16px_rgba(0,188,212,0.3)]' : '';
  const depthClass = depthStyles[depth] || depthStyles.level1;

  return (
    <div
      className={`sf-card rounded-lg transition-all duration-300 ${depthClass} ${glowClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default Card;