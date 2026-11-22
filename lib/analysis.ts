import type {
  DomainSummary,
  ErrorSummary,
  ErrorTag,
  EvaluateRequest,
  QuestionResult,
  Rating,
  RemediationItem,
  Report,
  StrategyIndicator,
} from "./types";
import {
  BAND_INFO,
  DOMAIN_LABELS,
  DOMAIN_ORDER,
  DOMAIN_REMEDIATION,
  ERROR_LABELS,
  ERROR_REMEDIATION,
  bandForAge,
} from "./meta";
import { getQuestions } from "./questions";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function levelLabel(percent: number): string {
  if (percent >= 85) return "Bonne maîtrise du niveau";
  if (percent >= 60) return "Maîtrise partielle";
  if (percent >= 40) return "Maîtrise fragile";
  return "Bases à reconstruire";
}

/**
 * Transforme les réponses brutes en rapport complet.
 * Reprend les 7 sections de la grille d'observation papier.
 */
export function buildReport(req: EvaluateRequest): Report {
  const band = bandForAge(req.age);
  if (!band) throw new Error("Âge non pris en charge");

  const questions = getQuestions(band);
  const byId = new Map(req.answers.map((a) => [a.questionId, a]));

  // ---------- 1. Observations par exercice ----------
  const results: QuestionResult[] = questions.map((q) => {
    const a = byId.get(q.id);
    const chosen = a?.optionId ? q.options.find((o) => o.id === a.optionId) : undefined;
    const expected = q.options.find((o) => o.correct)!;
    const changes = clamp(a?.changes ?? 0, 0, 20);
    const ms = clamp(a?.ms ?? 0, 0, 10 * 60 * 1000);
    const correct = !!chosen?.correct;
    // Bonne réponse mais hésitante (réponse changée 2 fois ou plus) => fragile
    const rating: Rating = correct ? (changes >= 2 ? "Fragile" : "Acquis") : "Non acquis";
    return {
      id: q.id,
      domain: q.domain,
      competency: q.competency,
      statement: q.statement,
      chosenLabel: chosen?.label ?? null,
      correctLabel: expected.label,
      correct,
      skipped: !chosen,
      errorTag: chosen && !chosen.correct ? chosen.errorTag : undefined,
      rating,
      ms,
      changes,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percent = Math.round((100 * correctCount) / total);

  // ---------- 4. Synthèse par domaine ----------
  const domains: DomainSummary[] = DOMAIN_ORDER.map((domain) => {
    const rs = results.filter((r) => r.domain === domain);
    const correct = rs.filter((r) => r.correct).length;
    const t = rs.length;
    const rating: Rating = correct === t ? "Acquis" : correct === 0 ? "Non acquis" : "Fragile";
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      correct,
      total: t,
      percent: t ? Math.round((100 * correct) / t) : 0,
      rating,
      priority: rating === "Non acquis" ? "Haute" : rating === "Fragile" ? "Moyenne" : "Basse",
      strengths: rs.filter((r) => r.correct).map((r) => r.competency),
      toConsolidate: rs.filter((r) => !r.correct).map((r) => r.competency),
    };
  });

  // ---------- 3. Types d'erreurs ----------
  // Une erreur est « observée » à partir de 2 occurrences : une erreur isolée ne suffit pas.
  const tagMap = new Map<ErrorTag, ErrorSummary>();
  results.forEach((r, i) => {
    if (!r.errorTag) return;
    const e: ErrorSummary = tagMap.get(r.errorTag) ?? {
      tag: r.errorTag,
      label: ERROR_LABELS[r.errorTag],
      count: 0,
      status: "isolée",
      examples: [],
    };
    e.count += 1;
    e.examples.push({ n: i + 1, answer: r.chosenLabel ?? "" });
    e.status = e.count >= 2 ? "observée" : "isolée";
    tagMap.set(r.errorTag, e);
  });
  const errors = [...tagMap.values()].sort((a, b) => b.count - a.count);

  // ---------- 2. Stratégies et autonomie (indicateurs approchés) ----------
  const skipped = results.filter((r) => r.skipped).length;
  const hasty = results.filter((r) => !r.correct && !r.skipped && r.ms < 4000).length;
  const totalChanges = results.reduce((s, r) => s + r.changes, 0);

  const strategies: StrategyIndicator[] = [
    {
      key: "perseverance",
      label: "Persévère lorsqu'il rencontre une difficulté",
      value: skipped <= 1 ? "Oui" : skipped <= 3 ? "Parfois" : "Non",
      detail: `${skipped} question(s) laissée(s) avec « Je ne sais pas ».`,
    },
    {
      key: "lecture",
      label: "Lit attentivement les consignes avant de répondre",
      value: hasty === 0 ? "Oui" : hasty <= 2 ? "Parfois" : "Non",
      detail: `${hasty} mauvaise(s) réponse(s) donnée(s) en moins de 4 secondes.`,
    },
    {
      key: "revision",
      label: "Révise ses réponses avant de valider",
      value: totalChanges >= 2 ? "Oui" : totalChanges === 1 ? "Parfois" : "Non",
      detail: `${totalChanges} changement(s) de réponse pendant le test.`,
    },
  ];

  // ---------- 6. Plan de remédiation ----------
  const plan: RemediationItem[] = [];
  const used = new Set<string>();
  const push = (notion: string, goal: string) => {
    if (plan.length >= 4 || used.has(notion)) return;
    used.add(notion);
    plan.push({ order: plan.length + 1, notion, goal });
  };

  const weak = domains
    .filter((d) => d.rating !== "Acquis")
    .sort((a, b) => a.percent - b.percent);

  for (const d of weak) {
    const counts = new Map<ErrorTag, number>();
    results
      .filter((r) => r.domain === d.domain && r.errorTag)
      .forEach((r) => counts.set(r.errorTag!, (counts.get(r.errorTag!) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const rem = top ? ERROR_REMEDIATION[top] : DOMAIN_REMEDIATION[d.domain];
    push(rem.notion, rem.goal);
  }
  for (const e of errors.filter((x) => x.status === "observée")) {
    push(ERROR_REMEDIATION[e.tag].notion, ERROR_REMEDIATION[e.tag].goal);
  }
  if (plan.length === 0) {
    push(
      "Consolidation et enrichissement : problèmes à plusieurs étapes du niveau supérieur",
      "Réussir des problèmes complexes en justifiant chaque démarche"
    );
  }

  // ---------- 7. Retour au parent (brouillon) ----------
  const who = req.name?.trim() || "L'élève";
  const strongLabels = domains
    .filter((d) => d.rating === "Acquis")
    .map((d) => DOMAIN_LABELS[d.domain].toLowerCase());
  const persevered = strategies[0].value === "Oui";

  const forces = strongLabels.length
    ? `${who} montre de bonnes bases en ${joinList(strongLabels)}.${
        persevered ? " La persévérance observée pendant le test est aussi un point d'appui." : ""
      }`
    : `${who} a pris le test au sérieux${
        persevered ? " et a persévéré jusqu'au bout" : ""
      } ; plusieurs notions sont partiellement comprises et serviront de point de départ.`;

  const priorites = weak.length
    ? `Priorités de travail : ${plan
        .slice(0, 2)
        .map((p, i) => `${i + 1}) ${p.notion}`)
        .join(" ; ")}.`
    : "Aucune lacune majeure repérée : l'objectif est de consolider et d'aller vers des problèmes plus complexes.";

  const prochaineEtape =
    weak.length >= 3
      ? "Proposition : une séance de 60 minutes par semaine pendant 4 à 6 semaines, puis un nouveau diagnostic pour mesurer les progrès."
      : weak.length >= 1
      ? "Proposition : une séance de 45 à 60 minutes par semaine pendant 3 à 4 semaines ciblées sur les priorités, puis un court retest."
      : "Proposition : une séance d'enrichissement toutes les deux semaines et un retest dans un mois.";

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    name: req.name?.trim() || undefined,
    age: req.age,
    band,
    levelLabel: `${levelLabel(percent)} (${BAND_INFO[band].label})`,
    durationSec: Math.round(results.reduce((s, r) => s + r.ms, 0) / 1000),
    score: { correct: correctCount, total, percent },
    results,
    domains,
    errors,
    strategies,
    plan,
    parent: { forces, priorites, prochaineEtape },
  };
}
