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
    <main className="home">
      <section className="hero">
        <h1>Diagnostic de mathématiques</h1>
        <p>
          Un court test adapté à ton âge pour repérer tes points forts et les notions à travailler.
          Programme québécois, secondaire.
        </p>
        <ul className="pills">
          <li>10 questions à choix</li>
          <li>15 à 25 minutes</li>
          <li>Sans compte</li>
          <li>Rien n'est enregistré</li>
        </ul>
      </section>

      <div className="cards">
        <form className="card" onSubmit={start}>
          <h2>Passer le test seul</h2>

          <label className="field">
            Prénom (facultatif)
            <input
              type="text"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom"
              autoComplete="given-name"
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
              <div className="small" style={{ marginTop: 8 }}>
                Niveau du test : {BAND_INFO[band].label} ({BAND_INFO[band].ages})
              </div>
            )}
          </div>

          <div className="note">
            Choisis la réponse qui te semble juste, ou « Je ne sais pas » si tu n'es pas sûr :
            c'est utile pour comprendre où t'aider.
          </div>

          <div className="actions">
            <button className="primary" type="submit" disabled={!age}>
              Commencer le test
            </button>
          </div>
        </form>

        <aside className="card card-side">
          <h2>Séance avec un prof</h2>
          <p>Travaillez ensemble sur un tableau partagé, en direct.</p>
          <ul>
            <li>Le prof et l'élève écrivent en même temps</li>
            <li>Le prof suit le test question par question</li>
            <li>Le rapport arrive chez le prof dès la fin</li>
          </ul>
          <Link href="/salle" className="btn-link">
            Créer une salle
          </Link>
        </aside>
      </div>
    </main>
  );
}
