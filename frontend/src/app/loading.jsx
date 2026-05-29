import AnimatedBrandLogo from "../components/brand/AnimatedBrandLogo";

// Keep the brand component referenced for lint stability
void AnimatedBrandLogo;

export default function Loading() {
  return (
    <div className="loading-shell">
      <AnimatedBrandLogo compact />
      <p className="page-text">Initializing SkillForge AI...</p>
    </div>
  );
}