"use client";

import { useEffect, useState } from "react";
import MathText from "./MathText";
import ReportView from "./ReportView";
import { BAND_INFO, bandForAge } from "@/lib/meta";
import type { LiveProgress, Report } from "@/lib/types";
import type { RoomApi } from "@/lib/useRoomChannel";

export default function TeacherPanel({ room }: { room: RoomApi }) {
  const [progress, setProgress] = useState<LiveProgress | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const offs = [
      room.subscribe("progress", (p: LiveProgress) => setProgress(p)),
      room.subscribe("report", (p: { report: Report }) => setReport(p.report)),
    ];
    return () => offs.forEach((off) => off());
  }, [room.subscribe]);

  // Récupère l'état courant à l'arrivée du prof, ou quand l'élève (re)connecte
  useEffect(() => {
    if (room.status === "connected") room.send("status-request");
  }, [room.status, room.send, room.peers.eleve]);

  if (!progress && !report) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Suivi de l'élève</h2>
        <p>
          {room.peers.eleve > 0
            ? "L'élève est connecté et n'a pas encore commencé le test."
            : "En attente de l'élève… Envoie-lui le lien de la salle."}
        </p>
        <p className="small">
          Pendant ce temps, vous pouvez déjà écrire ensemble sur le tableau.
        </p>
      </div>
    );
  }

  const band = progress ? bandForAge(progress.age) : null;

  return (
    <div>
      {progress && (
        <div className="live-card">
          <h2 style={{ marginTop: 0 }}>
            {progress.name || "Élève"}{" "}
            <span className="small">
              · {progress.age} ans{band ? ` · ${BAND_INFO[band].label}` : ""}
            </span>
          </h2>

          <div className="progress" aria-label="Progression de l'élève">
            <div
              className="progress-bar"
              style={{ width: `${(progress.answered / progress.total) * 100}%` }}
            />
          </div>

          {progress.finished ? (
            <p>
              <strong>Test terminé.</strong> Le rapport est affiché ci-dessous.
            </p>
          ) : (
            <>
              <div className="small">
                Question {progress.index + 1} sur {progress.total} · {progress.answered} réponse(s)
                donnée(s)
              </div>
              <p className="live-statement">
                <MathText text={progress.statement} />
              </p>
              <p>
                <strong>Réponse choisie : </strong>
                {progress.chosen === undefined ? (
                  <span className="small">pas encore de réponse</span>
                ) : progress.chosen === null ? (
                  <span>« Je ne sais pas »</span>
                ) : (
                  <MathText text={progress.chosen} />
                )}
              </p>
              <p className="small">
                La correction n'est pas affichée en direct : le rapport arrive à la fin du test.
              </p>
            </>
          )}
        </div>
      )}

      {report && <ReportView report={report} embedded />}
    </div>
  );
}
