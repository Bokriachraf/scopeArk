import type { Band, Domain, ErrorTag } from "./types";

export const DOMAIN_ORDER: Domain[] = [
  "calcul_numerique",
  "calcul_litteral",
  "equations",
  "fonctions",
  "problemes",
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  calcul_numerique: "Calcul numérique",
  calcul_litteral: "Calcul littéral",
  equations: "Équations",
  fonctions: "Fonctions / tableaux",
  problemes: "Graphiques / problèmes",
};

export const DOMAIN_SHORT: Record<Domain, string> = {
  calcul_numerique: "Numérique",
  calcul_litteral: "Littéral",
  equations: "Équations",
  fonctions: "Fonctions",
  problemes: "Problèmes",
};

export const DOMAIN_REMEDIATION: Record<Domain, { notion: string; goal: string }> = {
  calcul_numerique: {
    notion: "Calcul numérique : priorité des opérations, signes, fractions et pourcentages",
    goal: "Réussir 4 calculs sur 5 en expliquant chaque étape à voix haute",
  },
  calcul_litteral: {
    notion: "Calcul littéral : réduire, développer et factoriser des expressions",
    goal: "Réduire et développer 5 expressions sans erreur de signe",
  },
  equations: {
    notion: "Équations : isoler l'inconnue en gardant l'égalité équilibrée",
    goal: "Résoudre 5 équations et vérifier chaque solution par substitution",
  },
  fonctions: {
    notion: "Fonctions : image, antécédent et tableaux de valeurs",
    goal: "Calculer une image et retrouver un antécédent sans confusion",
  },
  problemes: {
    notion: "Problèmes : traduire une situation en équation ou en fonction, lire un graphique",
    goal: "Modéliser 3 situations différentes, résoudre puis valider la réponse",
  },
};

export const ERROR_LABELS: Record<ErrorTag, string> = {
  erreur_signe: "Erreurs de signes (+ / −)",
  termes_semblables: "Confusion entre termes semblables et non semblables",
  distributivite_incomplete: "Distributivité incomplète",
  operation_un_membre: "Opération appliquée à un seul membre de l'équation",
  isoler_inconnue: "Difficulté à isoler l'inconnue",
  confusion_image_antecedent: "Confusion entre f(x), image et antécédent",
  substitution_calcul: "Erreur de substitution ou de calcul d'image",
  modelisation: "Difficulté à traduire un énoncé en formule",
  priorite_operations: "Priorité des opérations non respectée",
  fractions: "Erreur dans les opérations sur les fractions",
  puissances: "Confusion dans les exposants et les puissances",
  pourcentages: "Erreur dans les pourcentages successifs",
  factorisation: "Difficulté en factorisation / identités remarquables",
  inequation: "Sens de l'inégalité non renversé (inéquations)",
  verification: "Solution non vérifiée (satisfait une seule condition)",
  lecture_graphique: "Difficulté à interpréter points, pente ou graphique",
  erreur_calcul: "Erreur de calcul courante",
};

export const ERROR_REMEDIATION: Record<ErrorTag, { notion: string; goal: string }> = {
  erreur_signe: {
    notion: "Règle des signes (addition, soustraction, multiplication de nombres relatifs)",
    goal: "Réussir 8 calculs sur 10 avec des nombres négatifs",
  },
  termes_semblables: {
    notion: "Termes semblables : reconnaître et regrouper ce qui peut l'être",
    goal: "Réduire 5 expressions en justifiant chaque regroupement",
  },
  distributivite_incomplete: {
    notion: "Distributivité : multiplier chaque terme de la parenthèse",
    goal: "Développer 6 expressions en flèchant chaque multiplication",
  },
  operation_un_membre: {
    notion: "Équilibre d'une égalité : la même opération des deux côtés",
    goal: "Résoudre 5 équations en écrivant l'opération appliquée aux deux membres",
  },
  isoler_inconnue: {
    notion: "Isoler l'inconnue : opérations inverses dans le bon ordre",
    goal: "Résoudre 5 équations à deux étapes avec vérification",
  },
  confusion_image_antecedent: {
    notion: "Vocabulaire des fonctions : image (sortie) et antécédent (entrée)",
    goal: "Distinguer et calculer image et antécédent sur 5 exemples",
  },
  substitution_calcul: {
    notion: "Substitution : remplacer x par une valeur (parenthèses, puissances)",
    goal: "Calculer 6 images sans erreur en réécrivant l'expression avec parenthèses",
  },
  modelisation: {
    notion: "Modélisation : traduire un énoncé en expression ou en équation",
    goal: "Identifier la quantité fixe et la quantité variable dans 4 situations",
  },
  priorite_operations: {
    notion: "Priorité des opérations (multiplication avant addition, parenthèses)",
    goal: "Réussir 5 calculs à plusieurs opérations en soulignant l'opération prioritaire",
  },
  fractions: {
    notion: "Opérations sur les fractions : dénominateur commun",
    goal: "Additionner et soustraire 5 fractions avec dénominateurs différents",
  },
  puissances: {
    notion: "Exposants : puissances de nombres négatifs et exposants négatifs",
    goal: "Calculer 6 puissances en expliquant la règle utilisée",
  },
  pourcentages: {
    notion: "Pourcentages successifs : rabais et taxes par coefficient multiplicateur",
    goal: "Résoudre 4 problèmes de rabais puis taxes avec la méthode du coefficient",
  },
  factorisation: {
    notion: "Factorisation et identités remarquables : trinômes, carrés parfaits",
    goal: "Factoriser 5 trinômes et vérifier en redéveloppant",
  },
  inequation: {
    notion: "Inéquations : renverser le sens en multipliant ou divisant par un négatif",
    goal: "Résoudre 5 inéquations et tester une valeur de la solution",
  },
  verification: {
    notion: "Vérification d'une solution : tester dans toutes les conditions",
    goal: "Vérifier systématiquement 5 solutions par substitution",
  },
  lecture_graphique: {
    notion: "Lecture de la droite : points, pente et ordonnée à l'origine",
    goal: "Retrouver l'équation d'une droite à partir de 2 points, 4 fois sur 5",
  },
  erreur_calcul: {
    notion: "Fluidité de calcul : méthode, étapes écrites et relecture",
    goal: "Réussir une série de 10 calculs mixtes avec relecture",
  },
};

export type BandInfo = { label: string; ages: string };

export const BAND_INFO: Record<Band, BandInfo> = {
  "12-13": { label: "Secondaire 1–2", ages: "12–13 ans" },
  "14-15": { label: "Secondaire 3", ages: "14–15 ans" },
  "16-17": { label: "Secondaire 4–5", ages: "16–17 ans" },
};

export function bandForAge(age: number): Band | null {
  if (!Number.isInteger(age)) return null;
  if (age >= 12 && age <= 13) return "12-13";
  if (age >= 14 && age <= 15) return "14-15";
  if (age >= 16 && age <= 17) return "16-17";
  return null;
}
