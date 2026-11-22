// ---------- Banque de questions ----------

export type Band = "12-13" | "14-15" | "16-17";

export type Domain =
  | "calcul_numerique"
  | "calcul_litteral"
  | "equations"
  | "fonctions"
  | "problemes";

/** Types d'erreurs repérés (reprend la grille d'observation + quelques ajouts). */
export type ErrorTag =
  | "erreur_signe"
  | "termes_semblables"
  | "distributivite_incomplete"
  | "operation_un_membre"
  | "isoler_inconnue"
  | "confusion_image_antecedent"
  | "substitution_calcul"
  | "modelisation"
  | "priorite_operations"
  | "fractions"
  | "puissances"
  | "pourcentages"
  | "factorisation"
  | "inequation"
  | "verification"
  | "lecture_graphique"
  | "erreur_calcul";

export interface Option {
  id: string;
  label: string;
  correct?: boolean;
  /** Erreur typique que cette mauvaise réponse révèle. */
  errorTag?: ErrorTag;
}

export interface Question {
  id: string;
  domain: Domain;
  /** Compétence observée (reprend le vocabulaire de la grille). */
  competency: string;
  statement: string;
  options: Option[];
}

/** Version envoyée au navigateur : sans bonne réponse ni étiquette d'erreur. */
export interface PublicQuestion {
  id: string;
  domain: Domain;
  statement: string;
  options: { id: string; label: string }[];
}

// ---------- Réponses & rapport ----------

export interface AnswerInput {
  questionId: string;
  /** null = « Je ne sais pas » */
  optionId: string | null;
  /** temps passé sur la question (ms) */
  ms: number;
  /** nombre de changements de réponse */
  changes: number;
}

export interface EvaluateRequest {
  age: number;
  name?: string;
  answers: AnswerInput[];
}

export type Rating = "Acquis" | "Fragile" | "Non acquis";
export type Priority = "Haute" | "Moyenne" | "Basse";

export interface QuestionResult {
  id: string;
  domain: Domain;
  competency: string;
  statement: string;
  chosenLabel: string | null;
  correctLabel: string;
  correct: boolean;
  skipped: boolean;
  errorTag?: ErrorTag;
  rating: Rating;
  ms: number;
  changes: number;
}

export interface DomainSummary {
  domain: Domain;
  label: string;
  correct: number;
  total: number;
  percent: number;
  rating: Rating;
  priority: Priority;
  strengths: string[];
  toConsolidate: string[];
}

export interface ErrorSummary {
  tag: ErrorTag;
  label: string;
  count: number;
  status: "observée" | "isolée";
  examples: { n: number; answer: string }[];
}

export interface StrategyIndicator {
  key: string;
  label: string;
  value: "Oui" | "Parfois" | "Non";
  detail: string;
}

export interface RemediationItem {
  order: number;
  notion: string;
  goal: string;
}

export interface Report {
  version: 1;
  generatedAt: string;
  name?: string;
  age: number;
  band: Band;
  levelLabel: string;
  durationSec: number;
  score: { correct: number; total: number; percent: number };
  results: QuestionResult[];
  domains: DomainSummary[];
  errors: ErrorSummary[];
  strategies: StrategyIndicator[];
  plan: RemediationItem[];
  parent: { forces: string; priorites: string; prochaineEtape: string };
}
