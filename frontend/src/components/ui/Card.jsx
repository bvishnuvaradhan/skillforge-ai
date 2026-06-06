export function Card({ children, className = "", glow = false, depth = "level1" }) {
  const depthStyles = {
    level1: 'bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xs hover:border-white/20',
    level2: 'bg-slate-900/50 backdrop-blur-xl border border-white/15 shadow-sm hover:border-white/25',
    level3: 'bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-md hover:border-cyan-500/25',
    elevated: 'bg-slate-900/70 backdrop-blur-2xl border border-cyan-500/20 shadow-lg hover:border-cyan-500/45',
  };

  const glowClass = glow ? 'shadow-[0_0_16px_rgba(0,188,212,0.35)]' : '';
  const depthClass = depthStyles[depth] || depthStyles.level1;

  return (
    <div
      className={`sf-card rounded-3xl ${depthClass} ${glowClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default Card;