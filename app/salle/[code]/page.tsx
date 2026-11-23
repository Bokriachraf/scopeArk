import { Suspense } from "react";
import RoomClient from "@/components/RoomClient";

export default async function SallePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <Suspense
      fallback={
        <main className="page narrow">
          <p>Chargement de la salle…</p>
        </main>
      }
    >
      <RoomClient code={code} />
    </Suspense>
  );
}
