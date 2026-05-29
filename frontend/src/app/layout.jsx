import { Layout as Shell } from "../components/Layout";
import Providers from "./providers";
import "./globals.css";

// Mark imports as used to satisfy incremental linting (intentionally no-op)
void Shell;
void Providers;

export const metadata = {
  title: "SkillForge AI",
  description: "Futuristic AI SaaS foundation for SkillForge AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}