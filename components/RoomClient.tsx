"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Whiteboard from "./Whiteboard";
import TeacherPanel from "./TeacherPanel";
import StudentPanel from "./StudentPanel";
import { realtimeConfigured } from "@/lib/realtime";
import { useRoomChannel } from "@/lib/useRoomChannel";
import type { Role } from "@/lib/useRoomChannel";

type View = "both" | "board" | "side";

const STATUS_LABEL = {
  connecting: "Connexion…",
  connected: "Connecté",
  error: "Hors ligne",
} as const;

export default function RoomClient({ code }: { code: string }) {
  const valid = /^[a-z0-9]{6,32}$/i.test(code);
  if (!valid) {
    return (
      <main className="page narrow">
        <h1>Salle introuvable</h1>
        <p>Le code de salle n'est pas valide. Demande un nouveau lien à ton prof.</p>
        <div className="actions">
          <Link href="/" className="btn-link">
            Accueil
          </Link>
        </div>
      </main>
    );
  }
  if (!realtimeConfigured()) {
    return (
      <main className="page narrow">
        <h1>Tableau partagé non configuré</h1>
        <p>
          Le service temps réel (Supabase, gratuit) n'est pas configuré. Ajoute{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans{" "}
          <code>.env.local</code> (voir <code>.env.example</code>), puis redémarre l'application.
        </p>
      </main>
    );
  }
  return <Room code={code} />;
}

function Room({ code }: { code: string }) {
  const role: Role = useSearchParams().get("r") === "prof" ? "prof" : "eleve";
  const room = useRoomChannel(code, role);
  const [view, setView] = useState<View>("both");

  return (
    <div className="room">
      <header className="room-bar">
        <strong>ScopeArk · Salle {code}</strong>
        <span className="badge">{role === "prof" ? "Prof" : "Élève"}</span>
        <span>
          <span className={`dot ${room.status}`} />
          {STATUS_LABEL[room.status]}
        </span>
        <span className="small">
          Prof : {room.peers.prof > 0 ? "en ligne" : "absent"} · Élève :{" "}
          {room.peers.eleve > 0 ? "en ligne" : "absent"}
        </span>
        <span className="spacer" />
        <button className={`tool ${view === "board" ? "selected" : ""}`} onClick={() => setView("board")}>
          Tableau
        </button>
        <button className={`tool ${view === "both" ? "selected" : ""}`} onClick={() => setView("both")}>
          Les deux
        </button>
        <button className={`tool ${view === "side" ? "selected" : ""}`} onClick={() => setView("side")}>
          {role === "prof" ? "Suivi" : "Test"}
        </button>
      </header>

      {room.status === "error" && (
        <div className="note" style={{ margin: "12px 14px" }}>
          Connexion impossible au service temps réel. Vérifie ta connexion et la configuration
          Supabase (Realtime : accès public aux canaux activé), puis recharge la page.
        </div>
      )}

      <div className={`room-grid view-${view}`}>
        <section className="pane board-pane">
          <Whiteboard room={room} role={role} code={code} />
        </section>
        <section className="pane side-pane">
          {role === "prof" ? (
            <TeacherPanel room={room} />
          ) : (
            <StudentPanel code={code} room={room} />
          )}
        </section>
      </div>
    </div>
  );
}
