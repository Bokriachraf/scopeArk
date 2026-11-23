import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./room.css";

export const metadata: Metadata = {
  title: "ScopeArk · Diagnostic de mathématiques",
  description:
    "Diagnostic de positionnement en mathématiques (12 à 17 ans) avec rapport d'observation automatique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
