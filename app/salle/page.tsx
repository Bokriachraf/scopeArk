"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Alphabet sans caractères ambigus (pas de i, l, o, 0, 1)
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export default function CreateRoomPage() {
  const [code, setCode] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<"prof" | "eleve" | null>(null);

  useEffect(() => {
    setCode(newCode());
    setOrigin(location.origin);
  }, []);

  const profUrl = `${origin}/salle/${code}?r=prof`;
  const eleveUrl = `${origin}/salle/${code}`;

  async function copy(which: "prof" | "eleve") {
    try {
      await navigator.clipboard.writeText(which === "prof" ? profUrl : eleveUrl);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!code) {
    return (
      <main className="page narrow">
        <p>Création de la salle…</p>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <h1>Séance avec tableau partagé</h1>
      <div className="subtitle">Prof et élève écrivent en même temps · aucun compte</div>

      <div className="note">
        Envoie le <strong>lien élève</strong> à l'élève et garde le <strong>lien prof</strong> pour
        toi. La salle n'est pas enregistrée : le tableau disparaît quand tout le monde quitte.
        Toute personne qui a le lien peut entrer, ne le partage donc qu'avec l'élève.
      </div>

      <label className="field">
        Lien prof (à garder)
        <input type="text" readOnly value={profUrl} onFocus={(e) => e.currentTarget.select()} />
      </label>
      <label className="field">
        Lien élève (à envoyer)
        <input type="text" readOnly value={eleveUrl} onFocus={(e) => e.currentTarget.select()} />
      </label>

      <div className="actions">
        <Link href={`/salle/${code}?r=prof`} className="btn-link primary">
          Entrer dans la salle (prof)
        </Link>
        <button className="secondary" onClick={() => copy("eleve")}>
          {copied === "eleve" ? "Lien élève copié ✔" : "Copier le lien élève"}
        </button>
        <button className="secondary" onClick={() => copy("prof")}>
          {copied === "prof" ? "Lien prof copié ✔" : "Copier le lien prof"}
        </button>
        <button className="secondary" onClick={() => setCode(newCode())}>
          Nouvelle salle
        </button>
      </div>
    </main>
  );
}
