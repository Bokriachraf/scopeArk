"use client";

import { useState } from "react";
import Link from "next/link";
import MathText from "./MathText";
import RadarChart from "./RadarChart";
import { BAND_INFO, DOMAIN_SHORT } from "@/lib/meta";
import { encodeReport } from "@/lib/share";
import type { Rating, Report } from "@/lib/types";

const RATING_CLASS: Record<Rating, string> = {
  Acquis: "chip-ok",
  Fragile: "chip-mid",
  "Non acquis": "chip-bad",
};
const VALUE_CLASS = { Oui: "chip-ok", Parfois: "chip-mid", Non: "chip-bad" } as const;
const BAR_CLASS: Record<Rating, string> = { Acquis: "ok", Fragile: "mid", "Non acquis": "bad" };

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

function ScoreRing({ percent, correct, total }: { percent: number; correct: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="ring" role="img" aria-label={`Score ${correct} sur ${total}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e3ebf1" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#157a68"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * c} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="70" textAnchor="middle" fontSize="30" fontWeight="800" fill="#14304a">
        {correct}/{total}
      </text>
      <text x="70" y="92" textAnchor="middle" fontSize="13" fill="#5d6b79">
        {percent} %
      </text>
    </svg>
  );
}

export default function ReportView({
  report,
  embedded = false,
}: {
  report: Report;
  embedded?: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [forces, setForces] = useState(report.parent.forces);
  const [priorites, setPriorites] = useState(report.parent.priorites);
  const [etape, setEtape] = useState(report.parent.prochaineEtape);
  const [status, setStatus] = useState("");

  async function copyLink() {
    try {
      const token = await encodeReport({
        ...report,
        parent: { forces, priorites, prochaineEtape: etape },
      });
      const url = `${location.origin}/rapport#r=${token}`;
      await navigator.clipboard.writeText(url);
      setStatus("Lien copié : il contient le rapport, rien n'est stocké sur un serveur.");
    } catch {
      setStatus("Impossible de copier le lien sur cet appareil.");
    }
  }

  function exportJson() {
    const data = { ...report, parent: { forces, priorites, prochaineEtape: etape }, notes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scopeark_rapport.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const info = BAND_INFO[report.band];

  return (
    <main className={embedded ? "page embedded" : "page"}>
      <h1>Rapport de diagnostic</h1>
      <div className="subtitle">
        Mathématiques · Programme québécois · {info.label}
      </div>

      <section className="meta">
        <div>
          <strong>Élève</strong>
          {report.name || "—"}
        </div>
        <div>
          <strong>Date</strong>
          {new Date(report.generatedAt).toLocaleDateString("fr-CA")}
        </div>
        <div>
          <strong>Âge / niveau</strong>
          {report.age} ans · {info.label}
        </div>
        <div>
          <strong>Durée</strong>
          {fmtDuration(report.durationSec)}
        </div>
      </section>

      <section className="summary">
        <div className="score">
          <ScoreRing
            percent={report.score.percent}
            correct={report.score.correct}
            total={report.score.total}
          />
          <div className="score-label">{report.levelLabel}</div>
        </div>
        <RadarChart
          data={report.domains.map((d) => ({ label: DOMAIN_SHORT[d.domain], value: d.percent }))}
        />
      </section>

      <div className="dbars">
        {report.domains.map((d) => (
          <div className="dbar" key={d.domain}>
            <div className="dbar-top">
              <span>{d.label}</span>
              <span>
                {d.correct}/{d.total}
              </span>
            </div>
            <div className="dbar-track">
              <div
                className={`dbar-fill ${BAR_CLASS[d.rating]}`}
                style={{ width: `${Math.max(d.percent, 4)}%` }}
              />
            </div>
            <span className={`chip ${RATING_CLASS[d.rating]}`}>{d.rating}</span>
          </div>
        ))}
      </div>

      <div className="note">
        <strong>À lire :</strong> ce rapport est calculé automatiquement à partir des réponses du
        QCM. Une erreur isolée ne suffit pas à conclure à une lacune : une erreur n'est dite
        « observée » qu'à partir de deux occurrences.
      </div>

      {/* 1 */}
      <h2>1. Observations par exercice</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ex.</th>
              <th>Compétence observée</th>
              <th className="center">Appréciation</th>
              <th>Réponse de l'élève</th>
            </tr>
          </thead>
          <tbody>
            {report.results.map((r, i) => (
              <tr key={r.id}>
                <td>
                  <strong>{i + 1}</strong>
                </td>
                <td>{r.competency}</td>
                <td className="center">
                  <span className={`chip ${RATING_CLASS[r.rating]}`}>{r.rating}</span>
                </td>
                <td>
                  {r.correct ? (
                    <span className="small">
                      {r.changes >= 2 ? "Correcte, mais réponse changée plusieurs fois" : "Correcte"}
                    </span>
                  ) : r.skipped ? (
                    <span className="small">« Je ne sais pas »</span>
                  ) : (
                    <span>
                      <MathText text={r.chosenLabel ?? ""} />
                      <span className="small"> · attendu : </span>
                      <MathText text={r.correctLabel} className="small" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2 */}
      <h2>2. Stratégies et autonomie</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Comportement observé</th>
              <th className="center">Résultat</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {report.strategies.map((s) => (
              <tr key={s.key}>
                <td>{s.label}</td>
                <td className="center">
                  <span className={`chip ${VALUE_CLASS[s.value]}`}>{s.value}</span>
                </td>
                <td className="small">{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">
        Indicateurs approchés à partir du comportement pendant le QCM. « Explique son
        raisonnement » ou « choisit une méthode adaptée » demandent une observation en direct.
      </p>

      {/* 3 */}
      <h2>3. Types d'erreurs repérés</h2>
      {report.errors.length === 0 ? (
        <p>Aucune erreur type repérée : toutes les réponses sont correctes ou sans étiquette.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type d'erreur</th>
                <th className="center">Statut</th>
                <th>Exemples (n° d'exercice : réponse choisie)</th>
              </tr>
            </thead>
            <tbody>
              {report.errors.map((e) => (
                <tr key={e.tag}>
                  <td>{e.label}</td>
                  <td className="center">
                    {e.status === "observée" ? (
                      <span className="chip chip-bad">Observée ×{e.count}</span>
                    ) : (
                      <span className="chip chip-mid">Isolée</span>
                    )}
                  </td>
                  <td>
                    {e.examples.map((x, i) => (
                      <span key={i} className="example">
                        Ex. {x.n} : <MathText text={x.answer} />
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4 */}
      <h2>4. Synthèse des acquis</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Domaine</th>
              <th>Points forts / acquis</th>
              <th>À consolider</th>
              <th className="center">Priorité</th>
            </tr>
          </thead>
          <tbody>
            {report.domains.map((d) => (
              <tr key={d.domain}>
                <td>
                  <strong>{d.label}</strong>
                  <div className="small">
                    {d.correct}/{d.total} · {d.rating}
                  </div>
                </td>
                <td>{d.strengths.join(" ; ") || "—"}</td>
                <td>{d.toConsolidate.join(" ; ") || "—"}</td>
                <td className="center">
                  <span className={`chip chip-${d.priority}`}>{d.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5 */}
      <h2>5. Observations et exemples précis</h2>
      <label className="field">
        Notes du tuteur (facultatif, non enregistré sur un serveur)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex. : comprend l'idée de l'équation mais effectue les opérations sur un seul membre..."
        />
      </label>

      {/* 6 */}
      <h2>6. Plan de remédiation proposé</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Notion à travailler</th>
              <th>Objectif / indicateur de progrès</th>
            </tr>
          </thead>
          <tbody>
            {report.plan.map((p) => (
              <tr key={p.order}>
                <td>
                  <strong>{p.order}</strong>
                </td>
                <td>{p.notion}</td>
                <td>{p.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 7 */}
      <h2>7. Retour à faire au parent</h2>
      <label className="field">
        Forces observées
        <textarea value={forces} onChange={(e) => setForces(e.target.value)} />
      </label>
      <label className="field">
        Priorités de travail
        <textarea value={priorites} onChange={(e) => setPriorites(e.target.value)} />
      </label>
      <label className="field">
        Prochaine étape / fréquence proposée
        <textarea value={etape} onChange={(e) => setEtape(e.target.value)} />
      </label>

      <div className="note">
        <strong>Rappel :</strong> ce rapport oriente l'accompagnement ; il ne constitue pas un
        diagnostic définitif. Tenir compte de l'année scolaire, des notions déjà étudiées et des
        conditions de passation.
      </div>

      <div className="actions no-print">
        <button className="primary" onClick={() => window.print()}>
          Imprimer / Enregistrer en PDF
        </button>
        <button className="secondary" onClick={copyLink}>
          Copier le lien du rapport
        </button>
        <button className="secondary" onClick={exportJson}>
          Exporter (.json)
        </button>
        {!embedded && (
          <Link href="/" className="btn-link">
            Nouveau test
          </Link>
        )}
        <span className="status">{status}</span>
      </div>
    </main>
  );
}
