"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import TestRunner from "./TestRunner";
import type { Profile } from "./TestRunner";
import ReportView from "./ReportView";
import { BAND_INFO, bandForAge } from "@/lib/meta";
import type { LiveProgress, Report } from "@/lib/types";
import type { RoomApi } from "@/lib/useRoomChannel";

const AGES = [12, 13, 14, 15, 16, 17];

export default function StudentPanel({ code, room }: { code: string; room: RoomApi }) {
  const prefix = `scopeark:room:${code}`;
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const lastProgress = useRef<LiveProgress | null>(null);
  const reportRef = useRef<Report | null>(null);

  // Restaure l'état après un rafraîchissement
  useEffect(() => {
    try {
      const p = sessionStorage.getItem(`${prefix}:profile`);
      if (p) setProfile(JSON.parse(p) as Profile);
      const r = sessionStorage.getItem(`${prefix}:report`);
      if (r) {
        const parsed = JSON.parse(r) as Report;
        reportRef.current = parsed;
        setReport(parsed);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [prefix]);

  // Le prof qui arrive en retard demande l'état : on le lui renvoie
  useEffect(
    () =>
      room.subscribe("status-request", () => {
        if (lastProgress.current) room.send("progress", lastProgress.current);
        if (reportRef.current) room.send("report", { report: reportRef.current });
      }),
    [room.subscribe, room.send]
  );

  function start(e: FormEvent) {
    e.preventDefault();
    if (!age) return;
    const p = { name: name.trim(), age };
    sessionStorage.setItem(`${prefix}:profile`, JSON.stringify(p));
    setProfile(p);
  }

  function handleProgress(p: LiveProgress) {
    lastProgress.current = p;
    room.send("progress", p);
  }

  function handleFinish(r: Report) {
    sessionStorage.setItem(`${prefix}:report`, JSON.stringify(r));
    reportRef.current = r;
    setReport(r);
    room.send("report", { report: r });
    if (profile) {
      const done: LiveProgress = {
        ...(lastProgress.current ?? {
          name: profile.name || undefined,
          age: profile.age,
          index: r.score.total - 1,
          total: r.score.total,
          statement: "",
          answered: r.score.total,
        }),
        finished: true,
      };
      lastProgress.current = done;
      room.send("progress", done);
    }
  }

  if (!ready) return <p>Chargement…</p>;

  if (!profile) {
    const band = age ? bandForAge(age) : null;
    return (
      <form onSubmit={start}>
        <h2 style={{ marginTop: 0 }}>Bienvenue !</h2>
        <p>
          Tu peux écrire sur le tableau pendant le test : ton prof voit ce que tu écris en direct.
        </p>
        <label className="field">
          Prénom
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
          {band && <div className="small">Niveau du test : {BAND_INFO[band].label}</div>}
        </div>
        <div className="actions">
          <button className="primary" type="submit" disabled={!age}>
            Commencer le test
          </button>
        </div>
      </form>
    );
  }

  if (report) {
    return (
      <div>
        <div className="note">Test terminé. Ton prof voit aussi ce rapport.</div>
        <ReportView report={report} embedded />
      </div>
    );
  }

  return (
    <TestRunner
      profile={profile}
      storagePrefix={prefix}
      onProgress={handleProgress}
      onFinish={handleFinish}
    />
  );
}
