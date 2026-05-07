import dynamic from "next/dynamic";

const LogoScene = dynamic(() => import("./brand/LogoScene"), { ssr: false, loading: () => <span className="brand-mark__orb" /> });

export function BrandMark() {
  return (
    <div className="brand-mark" aria-label="SkillForge AI brand">
      <div className="brand-mark__orb">
        <LogoScene />
      </div>
      <div>
        <p className="eyebrow">SkillForge AI</p>
        <strong className="brand-mark__title">Intelligence workspace</strong>
      </div>
    </div>
  );
}

export default BrandMark;