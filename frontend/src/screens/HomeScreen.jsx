"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { useAuth } from "../context/useAuth";
import AnimatedBrandLogo from "../components/brand/AnimatedBrandLogo";
import ThreeScene from "../components/ThreeScene";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";

const MotionDiv = m.div;

export function HomeScreen() {
  const { auth } = useAuth();

  return (
    <section className="page-shell home-page">
      <MotionDiv className="home-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <AnimatedBrandLogo />
        <SectionHeader
          eyebrow="Foundation design system"
          title="SkillForge AI"
          description="A futuristic workspace base with branding, reusable UI, a themed shell, and a 3D hero foundation."
          actions={
            <>
              <Link className="sf-button sf-button--primary" href={auth.user ? "/dashboard" : "/login"}>
                {auth.user ? "Open Dashboard" : "Login"}
              </Link>
              <Link className="sf-button sf-button--secondary" href="/signup">
                Signup
              </Link>
            </>
          }
        />
        <div className="hero-copy-grid">
          <Card glow className="hero-copy-card">
            <p className="panel-label">What’s included</p>
            <ul className="status-list">
              <li>Branding and layout shell</li>
              <li>Reusable cards, fields, buttons</li>
              <li>Theme foundation with smooth transitions</li>
              <li>Basic 3D rendering foundation</li>
            </ul>
          </Card>
          <Card className="hero-copy-card">
            <p className="panel-label">Phase 1 scope</p>
            <p className="page-text">
              Foundation-level design only: not a final pixel-perfect product, but a coherent startup-grade base.
            </p>
          </Card>
        </div>
      </MotionDiv>
      <Card glow className="hero-panel">
        <div className="three-wrapper">
          <ThreeScene />
        </div>
        <div className="hero-panel__footer">
          <p className="panel-label">Workspace status</p>
          <ul className="status-list">
            <li>Frontend: JSX only</li>
            <li>Phase 1: auth and profiles</li>
            <li>Theme: light and dark</li>
            <li>Backend: Mongo-backed API</li>
          </ul>
        </div>
      </Card>
    </section>
  );
}

export default HomeScreen;