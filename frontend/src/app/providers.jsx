"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../context/AuthContext";

// Defensive references for lint stability
void ThemeProvider; void AuthProvider;

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export default Providers;