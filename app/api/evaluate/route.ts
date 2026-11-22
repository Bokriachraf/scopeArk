import { buildReport } from "@/lib/analysis";
import type { AnswerInput } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/evaluate : corrige et analyse les réponses.
 * Rien n'est stocké : le rapport est calculé puis renvoyé.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const b = body as { age?: unknown; name?: unknown; answers?: unknown };
  if (typeof b.age !== "number" || !Array.isArray(b.answers) || b.answers.length > 50) {
    return Response.json({ error: "Données invalides." }, { status: 400 });
  }

  const answers: AnswerInput[] = b.answers.map((a: Record<string, unknown>) => ({
    questionId: String(a?.questionId ?? ""),
    optionId: typeof a?.optionId === "string" ? a.optionId : null,
    ms: Number(a?.ms) || 0,
    changes: Number(a?.changes) || 0,
  }));

  try {
    const report = buildReport({
      age: b.age,
      name: typeof b.name === "string" ? b.name.slice(0, 60) : undefined,
      answers,
    });
    return Response.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Âge non pris en charge." }, { status: 400 });
  }
}
