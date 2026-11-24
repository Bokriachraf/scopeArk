import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./room.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "ScopeArk · Diagnostic de mathématiques",
  description:
    "Diagnostic de positionnement en mathématiques (12 à 17 ans) avec rapport d'observation automatique et tableau partagé.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#157a68",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
