"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReportView from "@/components/ReportView";
import { decodeReport } from "@/lib/share";
import type { Report } from "@/lib/types";

export default function RapportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    async function load() {
      // 1) Lien partagé : /rapport#r=...
      const m = location.hash.match(/^#r=(.+)$/);
      if (m) {
        const shared = await decodeReport(m[1]);
        if (shared) {
          setReport(shared);
          setState("ready");
          return;
        }
      }
      // 2) Rapport du test qui vient d'être passé
      try {
        const raw = sessionStorage.getItem("scopeark:report");
        if (raw) {
          setReport(JSON.parse(raw) as Report);
          setState("ready");
          return;
        }
      } catch {
        /* ignore */
      }
      setState("missing");
    }
    load();
  }, []);

  if (state === "loading") {
    return (
      <main className="page narrow">
        <p>Chargement du rapport…</p>
      </main>
    );
  }
  if (state === "missing" || !report) {
    return (
      <main className="page narrow">
        <h1>Aucun rapport</h1>
        <p>Passe d'abord le test, ou ouvre un lien de rapport partagé.</p>
        <div className="actions">
          <Link href="/" className="btn-link primary">
            Commencer le test
          </Link>
        </div>
      </main>
    );
  }
  return <ReportView report={report} />;
}
