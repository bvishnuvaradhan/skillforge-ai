"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BrandMark from "./BrandMark";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { ThemeToggle } from "./ThemeToggle";
import Modal from "./ui/Modal";
import { useUiStore } from "../store/uiStore";

export function Layout({ children }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = usePathname();
  const showWorkspaceShell = ["/dashboard", "/settings"].includes(pathname ?? "");
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const toggleMobileNav = useUiStore((state) => state.toggleMobileNav);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);

  return (
    <div className={`app-shell ${showWorkspaceShell ? "app-shell--workspace" : "app-shell--landing"}`}>
      <header className="sf-card shell-header">
        <BrandMark />
        <div className="header-actions">
          <TopNav />
          {showWorkspaceShell ? (
            <button type="button" className="nav-chip shell-header__menu" onClick={toggleMobileNav}>
              {mobileNavOpen ? "Close menu" : "Menu"}
            </button>
          ) : null}
          <button type="button" className="nav-chip" onClick={() => setHelpOpen(true)}>
            Quick tips
          </button>
          <ThemeToggle />
        </div>
      </header>
      <div className={`shell-body ${showWorkspaceShell ? "shell-body--workspace" : "shell-body--landing"}`}>
        {showWorkspaceShell ? <Sidebar open={mobileNavOpen} onNavigate={closeMobileNav} /> : null}
        <main className="sf-card shell-content">
          {children}
        </main>
      </div>
      <Modal open={helpOpen} title="Phase 1 foundation" onClose={() => setHelpOpen(false)}>
        <p className="page-text">Branding, layout, theme system, reusable components, and the basic 3D foundation are fixed now.</p>
        <p className="page-text">Use this as the stable base for later analytics, insights, and intelligence features.</p>
      </Modal>
    </div>
  );
}
