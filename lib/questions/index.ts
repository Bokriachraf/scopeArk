import type { Band, PublicQuestion, Question } from "../types";
import { band1213 } from "./band-12-13";
import { band1415 } from "./band-14-15";
import { band1617 } from "./band-16-17";

const BANKS: Record<Band, Question[]> = {
  "12-13": band1213,
  "14-15": band1415,
  "16-17": band1617,
};

export function getQuestions(band: Band): Question[] {
  return BANKS[band];
}

/** Retire la bonne réponse et les étiquettes d'erreur avant l'envoi au navigateur. */
export function toPublic(q: Question): PublicQuestion {
  return {
    id: q.id,
    domain: q.domain,
    statement: q.statement,
    options: q.options.map((o) => ({ id: o.id, label: o.label })),
  };
}
