import type { NextRequest } from "next/server";
import { bandForAge } from "@/lib/meta";
import { getQuestions, toPublic } from "@/lib/questions";

export const dynamic = "force-dynamic";

/** GET /api/questions?age=14 : questions de la tranche d'âge, sans les corrigés. */
export function GET(req: NextRequest) {
  const age = Number(req.nextUrl.searchParams.get("age"));
  const band = bandForAge(age);
  if (!band) {
    return Response.json({ error: "Âge non pris en charge (12 à 17 ans)." }, { status: 400 });
  }
  return Response.json(getQuestions(band).map(toPublic), {
    headers: { "Cache-Control": "no-store" },
  });
}
