import AnimatedBrandLogo from "../components/brand/AnimatedBrandLogo";

export default function Loading() {
  return (
    <div className="loading-shell">
      <AnimatedBrandLogo compact />
      <p className="page-text">Initializing SkillForge AI...</p>
    </div>
  );
}