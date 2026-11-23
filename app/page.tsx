"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { BAND_INFO, bandForAge } from "@/lib/meta";

const AGES = [12, 13, 14, 15, 16, 17];

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);

  function start(e: FormEvent) {
    e.preventDefault();
    if (!age) return;
    sessionStorage.setItem("scopeark:profile", JSON.stringify({ name: name.trim(), age }));
    sessionStorage.removeItem("scopeark:progress");
    sessionStorage.removeItem("scopeark:report");
    router.push("/test");
  }

  const band = age ? bandForAge(age) : null;

  return (
    <main className="page narrow">
      <h1>Diagnostic de mathématiques</h1>
      <div className="subtitle">Programme québécois · Secondaire · 12 à 17 ans</div>

      <div className="note">
        10 questions à choix multiples, environ 15 à 25 minutes. Aucun compte n'est nécessaire et
        rien n'est enregistré sur un serveur. Choisis la réponse qui te semble juste, ou « Je ne
        sais pas » si tu n'es pas sûr : c'est utile pour comprendre où t'aider.
      </div>

      <form onSubmit={start}>
        <label className="field">
          Prénom (facultatif)
          <input
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
          />
        </label>

        <div className="field">
          Ton âge
          <div className="age-grid">
            {AGES.map((a) => (
              <button
                type="button"
                key={a}
                className={`age ${age === a ? "selected" : ""}`}
                onClick={() => setAge(a)}
                aria-pressed={age === a}
              >
                {a} ans
              </button>
            ))}
          </div>
          {band && (
            <div className="small">
              Niveau du test : {BAND_INFO[band].label} ({BAND_INFO[band].ages})
            </div>
          )}
        </div>

        <div className="actions">
          <button className="primary" type="submit" disabled={!age}>
            Commencer le test
          </button>
          <Link href="/salle" className="btn-link">
            Séance avec un prof (tableau partagé)
          </Link>
        </div>
      </form>
    </main>
  );
}
