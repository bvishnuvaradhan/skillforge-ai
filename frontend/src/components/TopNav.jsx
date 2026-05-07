"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav" aria-label="Primary">
      {LINKS.map((link) => (
        <Link key={link.to} className={`nav-chip ${pathname === link.to ? "nav-chip--active" : ""}`} href={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default TopNav;