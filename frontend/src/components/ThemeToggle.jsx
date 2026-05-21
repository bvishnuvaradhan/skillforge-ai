"use client";

import { useTheme } from "next-themes";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { auth, saveProfile } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const current = activeTheme || auth.user?.profile.theme || "system";

  async function toggleTheme() {
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (auth.token) {
      try {
        await saveProfile({ theme: nextTheme });
      } catch {
        // Keep the local theme change even if persistence fails.
      }
    }
  }

  if (!mounted) {
    return (
      <button type="button" className="nav-chip" aria-label="Toggle theme">
        Theme: ...
      </button>
    );
  }

  return (
    <button type="button" className="nav-chip" onClick={toggleTheme} aria-label="Toggle theme">
      {`Theme: ${current}`}
    </button>
  );
}
