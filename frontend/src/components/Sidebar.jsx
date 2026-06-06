"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/useAuth";

// Reference Link to satisfy lint when build tooling removes named usage
void Link;

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/memory", label: "Memory Lab" },
  { to: "/dashboard/explainability", label: "Explainability Center" },
  { to: "/dashboard/team", label: "Team Dashboard" },
  { to: "/dashboard/traces", label: "Trace Viewer" },
  { to: "/dashboard/tracking", label: "Tracking" },
  { to: "/settings", label: "Settings" },
  { to: "/", label: "Landing" },
];

export function Sidebar({ open = true, onNavigate }) {
  const pathname = usePathname();
  const { auth } = useAuth();

  return (
    <aside className={`sidebar sf-card sf-card--glow ${open ? "sidebar--open" : "sidebar--closed"}`}>
      <div className="sidebar__brand">
        <span className="brand-mark__orb" />
        <div>
          <p className="eyebrow">Workspace</p>
          <strong className="brand-mark__title">SkillForge AI</strong>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Workspace navigation">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            href={link.to}
            className={`sidebar__link ${pathname === link.to ? "sidebar__link--active" : ""}`}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar__panel">
        <p className="panel-label">Signed in</p>
        <p className="page-text">{auth.user?.profile.fullName || auth.user?.email || "Guest"}</p>
      </div>
    </aside>
  );
}

export default Sidebar;