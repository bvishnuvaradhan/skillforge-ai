import { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/useAuth";

function ThemeSync() {
  const { theme, setTheme } = useTheme();
  const { auth } = useAuth();

  useEffect(() => {
    const preferredTheme = auth.user?.profile.theme;
    if (!auth.ready || !preferredTheme) {
      return;
    }

    if (theme !== preferredTheme) {
      setTheme(preferredTheme);
    }
  }, [auth.ready, auth.user?.profile.theme, setTheme, theme]);

  return null;
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ThemeSync />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
