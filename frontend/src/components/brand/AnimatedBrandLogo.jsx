"use client";

import dynamic from "next/dynamic";
import { m, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const MotionDiv = m.div;

const LogoScene = dynamic(() => import("./LogoScene"), {
  ssr: false,
  loading: () => <div className="animated-logo__fallback" />,
});

export function AnimatedBrandLogo({ compact = false }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 140, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 140, damping: 18, mass: 0.6 });
  const logoTransform = useMotionTemplate`perspective(1000px) rotateX(${springX}deg) rotateY(${springY}deg)`;

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 8);
    rotateX.set((0.5 - py) * 7);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <MotionDiv
      className={`animated-logo ${compact ? "animated-logo--compact" : ""}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{ transform: logoTransform }}
    >
      <div className="animated-logo__scene">
        <LogoScene />
      </div>
      <div className="animated-logo__caption">
        <p className="eyebrow">SkillForge AI</p>
        <strong className="brand-mark__title">Holographic intelligence core</strong>
      </div>
    </MotionDiv>
  );
}

export default AnimatedBrandLogo;