import { Layout as Shell } from "../components/Layout";
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "SkillForge AI",
  description: "Futuristic AI SaaS foundation for SkillForge AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}