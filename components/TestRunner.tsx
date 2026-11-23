"use client";

import { useEffect, useRef, useState } from "react";
import MathText from "./MathText";
import type { LiveProgress, PublicQuestion, Report } from "@/lib/types";

export type Profile = { name: string; age: number };
type AnswerState = { optionId?: string | null; ms: number; changes: number };
type Progress = {
  index: number;
  answers: Record<string, AnswerState>;
  order: Record<string, string[]>;
};

const MAX_MS_PER_STEP = 5 * 60 * 1000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  profile: Profile;
  /** Préfixe des clés sessionStorage ("scopeark" en solo, "scopeark:room:CODE" en salle). */
  storagePrefix: string;
  /** Appelé à chaque changement (question, réponse) : utilisé pour le suivi en salle. */
  onProgress?: (p: LiveProgress) => void;
  onFinish: (report: Report) => void;
}

export default function TestRunner({ profile, storagePrefix, onProgress, onFinish }: Props) {
  const progressKey = `${storagePrefix}:progress`;
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const enteredAt = useRef<number>(Date.now());
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Chargement des questions de la tranche d'âge
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/questions?age=${profile.age}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((qs: PublicQuestion[]) => {
        if (cancelled) return;
        let saved: Progress | null = null;
        try {
          saved = JSON.parse(sessionStorage.getItem(progressKey) ?? "null");
        } catch {
          saved = null;
        }
        const ordered = qs.map((q) => {
          const ids = saved?.order?.[q.id];
          const restored = ids
            ? (ids
                .map((id) => q.options.find((o) => o.id === id))
                .filter(Boolean) as PublicQuestion["options"])
            : [];
          return {
            ...q,
            options: restored.length === q.options.length ? restored : shuffle(q.options),
          };
        });
        setQuestions(ordered);
        if (saved) {
          setAnswers(saved.answers ?? {});
          setIndex(Math.min(Math.max(saved.index ?? 0, 0), qs.length - 1));
        }
        enteredAt.current = Date.now();
      })
      .catch(() => {
        if (!cancelled) setLoadError("Impossible de charger les questions. Recharge la page.");
      });
    return () => {
      cancelled = true;
    };
  }, [profile.age, progressKey]);

  // Sauvegarde de la progression (survit à un rafraîchissement de la page)
  useEffect(() => {
    if (!questions.length) return;
    const order = Object.fromEntries(questions.map((q) => [q.id, q.options.map((o) => o.id)]));
    const progress: Progress = { index, answers, order };
    sessionStorage.setItem(progressKey, JSON.stringify(progress));
  }, [questions, index, answers, progressKey]);

  // Suivi en direct (prof)
  useEffect(() => {
    if (!questions.length || !onProgressRef.current) return;
    const q = questions[index];
    const a = answers[q.id];
    const chosen =
      a?.optionId === undefined
        ? undefined
        : a.optionId === null
        ? null
        : q.options.find((o) => o.id === a.optionId)?.label ?? null;
    const answered = questions.filter((qq) => answers[qq.id]?.optionId !== undefined).length;
    onProgressRef.current({
      name: profile.name || undefined,
      age: profile.age,
      index,
      total: questions.length,
      statement: q.statement,
      chosen,
      answered,
    });
  }, [questions, index, answers, profile.name, profile.age]);

  /** Ajoute le temps écoulé à la question courante puis applique la modification. */
  function touch(qid: string, patch: (a: AnswerState) => AnswerState) {
    const now = Date.now();
    const elapsed = Math.min(now - enteredAt.current, MAX_MS_PER_STEP);
    enteredAt.current = now;
    setAnswers((prev) => {
      const cur = prev[qid] ?? { ms: 0, changes: 0 };
      return { ...prev, [qid]: patch({ ...cur, ms: cur.ms + elapsed }) };
    });
  }

  function choose(qid: string, optionId: string | null) {
    touch(qid, (a) => ({
      ...a,
      optionId,
      changes: a.optionId !== undefined && a.optionId !== optionId ? a.changes + 1 : a.changes,
    }));
  }

  function go(delta: number) {
    const q = questions[index];
    touch(q.id, (a) => a);
    setIndex((i) => i + delta);
  }

  async function finish() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const q = questions[index];
    const cur = answers[q.id] ?? { ms: 0, changes: 0 };
    const finalAnswers: Record<string, AnswerState> = {
      ...answers,
      [q.id]: {
        ...cur,
        ms: cur.ms + Math.min(Date.now() - enteredAt.current, MAX_MS_PER_STEP),
      },
    };

    const payload = {
      age: profile.age,
      name: profile.name,
      answers: questions.map((qq) => ({
        questionId: qq.id,
        optionId: finalAnswers[qq.id]?.optionId ?? null,
        ms: finalAnswers[qq.id]?.ms ?? 0,
        changes: finalAnswers[qq.id]?.changes ?? 0,
      })),
    };

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const report = (await res.json()) as Report;
      sessionStorage.removeItem(progressKey);
      onFinish(report);
    } catch {
      setSubmitError("Impossible de calculer le rapport. Réessaie.");
      setSubmitting(false);
    }
  }

  if (loadError) return <p className="bad">{loadError}</p>;
  if (questions.length === 0) return <p>Chargement…</p>;

  const q = questions[index];
  const a = answers[q.id];
  const answered = a?.optionId !== undefined;
  const isLast = index === questions.length - 1;
  const answeredCount = questions.filter((qq) => answers[qq.id]?.optionId !== undefined).length;

  return (
    <div>
      <div className="progress" aria-label="Progression">
        <div
          className="progress-bar"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>
      <div className="small">
        Question {index + 1} sur {questions.length}
      </div>

      <h2 className="question">
        <MathText text={q.statement} />
      </h2>

      <div className="options" role="radiogroup">
        {q.options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={a?.optionId === o.id}
            className={`option ${a?.optionId === o.id ? "selected" : ""}`}
            onClick={() => choose(q.id, o.id)}
          >
            <span className="letter">{String.fromCharCode(65 + i)}</span>
            <MathText text={o.label} />
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={a?.optionId === null}
          className={`option idk ${a?.optionId === null ? "selected" : ""}`}
          onClick={() => choose(q.id, null)}
        >
          Je ne sais pas
        </button>
      </div>

      {submitError && <p className="bad">{submitError}</p>}

      <div className="actions">
        <button className="secondary" onClick={() => go(-1)} disabled={index === 0 || submitting}>
          Précédent
        </button>
        {isLast ? (
          <button className="primary" onClick={finish} disabled={!answered || submitting}>
            {submitting ? "Analyse en cours…" : "Terminer et voir le rapport"}
          </button>
        ) : (
          <button className="primary" onClick={() => go(1)} disabled={!answered}>
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
