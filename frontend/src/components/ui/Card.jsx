export function Card({ children, className = "", glow = false }) {
  return <div className={`sf-card ${glow ? "sf-card--glow" : ""} ${className}`.trim()}>{children}</div>;
}

export default Card;