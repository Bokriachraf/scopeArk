"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  // La salle (/salle/CODE) a sa propre barre d'outils
  if (pathname.startsWith("/salle/")) return null;

  return (
    <header className="site-header no-print">
      <Link href="/" className="brand">
        <span className="logo" aria-hidden="true">
          ∑
        </span>
        <span>ScopeArk</span>
      </Link>
      <nav>
        <Link href="/salle" className="nav-link">
          Séance avec un prof
        </Link>
      </nav>
    </header>
  );
}
