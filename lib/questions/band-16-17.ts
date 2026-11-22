import type { Question } from "../types";

/** 16–17 ans · Secondaire 4–5 */
export const band1617: Question[] = [
  // ---------- Calcul numérique ----------
  {
    id: "16-N1",
    domain: "calcul_numerique",
    competency: "Calcule avec des exposants négatifs",
    statement: "Calcule : $2^{-3}$",
    options: [
      { id: "a", label: "$-8$", errorTag: "puissances" },
      { id: "b", label: "$-6$", errorTag: "puissances" },
      { id: "c", label: "$\\frac{1}{8}$", correct: true },
      { id: "d", label: "$8$", errorTag: "puissances" },
    ],
  },
  {
    id: "16-N2",
    domain: "calcul_numerique",
    competency: "Enchaîne des pourcentages (rabais puis taxe)",
    statement:
      "Un article à 80 \\$ subit un rabais de 25 %, puis une taxe de 15 % est ajoutée au prix réduit. Quel est le prix final ?",
    options: [
      { id: "a", label: "72 \\$", errorTag: "pourcentages" },
      { id: "b", label: "69 \\$", correct: true },
      { id: "c", label: "70 \\$", errorTag: "pourcentages" },
      { id: "d", label: "60 \\$", errorTag: "erreur_calcul" },
    ],
  },

  // ---------- Calcul littéral ----------
  {
    id: "16-L1",
    domain: "calcul_litteral",
    competency: "Factorise un trinôme",
    statement: "Factorise : $x^2 - 5x + 6$",
    options: [
      { id: "a", label: "$(x + 2)(x + 3)$", errorTag: "erreur_signe" },
      { id: "b", label: "$(x - 1)(x - 6)$", errorTag: "factorisation" },
      { id: "c", label: "$(x - 2)(x - 3)$", correct: true },
      { id: "d", label: "$(x - 5)(x - 1)$", errorTag: "factorisation" },
    ],
  },
  {
    id: "16-L2",
    domain: "calcul_litteral",
    competency: "Développe un carré de binôme",
    statement: "Développe : $(2x - 3)^2$",
    options: [
      { id: "a", label: "$4x^2 - 9$", errorTag: "factorisation" },
      { id: "b", label: "$4x^2 - 6x + 9$", errorTag: "distributivite_incomplete" },
      { id: "c", label: "$4x^2 - 12x - 9$", errorTag: "erreur_signe" },
      { id: "d", label: "$4x^2 - 12x + 9$", correct: true },
    ],
  },

  // ---------- Équations ----------
  {
    id: "16-E1",
    domain: "equations",
    competency: "Résout une inéquation (sens de l'inégalité)",
    statement: "Résous : $-2x + 7 > 3$",
    options: [
      { id: "a", label: "$x > 2$", errorTag: "inequation" },
      { id: "b", label: "$x < 2$", correct: true },
      { id: "c", label: "$x < -2$", errorTag: "erreur_signe" },
      { id: "d", label: "$x > 5$", errorTag: "isoler_inconnue" },
    ],
  },
  {
    id: "16-E2",
    domain: "equations",
    competency: "Résout un système et vérifie dans les deux équations",
    statement: "Résous le système : $x + y = 7$ et $x - y = 3$.",
    options: [
      { id: "a", label: "$x = 4$ et $y = 3$", errorTag: "verification" },
      { id: "b", label: "$x = 2$ et $y = 5$", errorTag: "substitution_calcul" },
      { id: "c", label: "$x = 5$ et $y = 2$", correct: true },
      { id: "d", label: "$x = 10$ et $y = -3$", errorTag: "isoler_inconnue" },
    ],
  },

  // ---------- Fonctions / tableaux ----------
  {
    id: "16-F1",
    domain: "fonctions",
    competency: "Calcule une image avec une fonction du second degré",
    statement: "Soit $f(x) = 2x^2 - 3x + 1$. Calcule $f(3)$.",
    options: [
      { id: "a", label: "$28$", errorTag: "puissances" },
      { id: "b", label: "$-2$", errorTag: "substitution_calcul" },
      { id: "c", label: "$10$", correct: true },
      { id: "d", label: "$8$", errorTag: "erreur_signe" },
    ],
  },
  {
    id: "16-F2",
    domain: "fonctions",
    competency: "Retrouve la règle d'une fonction affine à partir de deux images",
    statement: "Une fonction affine $f$ vérifie $f(1) = 5$ et $f(4) = 14$. Quelle est sa règle ?",
    options: [
      { id: "a", label: "$f(x) = 3x + 5$", errorTag: "confusion_image_antecedent" },
      { id: "b", label: "$f(x) = 3x + 2$", correct: true },
      { id: "c", label: "$f(x) = 4x + 1$", errorTag: "verification" },
      { id: "d", label: "$f(x) = \\frac{1}{3}x + 2$", errorTag: "lecture_graphique" },
    ],
  },

  // ---------- Graphiques / problèmes ----------
  {
    id: "16-P1",
    domain: "problemes",
    competency: "Traduit une situation en équation et résout",
    statement:
      "Forfait A : 30 \\$ plus 5 \\$ par séance. Forfait B : 10 \\$ plus 9 \\$ par séance. Après combien de séances $n$ les deux forfaits coûtent-ils le même montant ?",
    options: [
      { id: "a", label: "$n = 20$", errorTag: "isoler_inconnue" },
      { id: "b", label: "$n = \\frac{10}{7}$", errorTag: "modelisation" },
      { id: "c", label: "$n = 5$", correct: true },
      { id: "d", label: "$n = 10$", errorTag: "erreur_signe" },
    ],
  },
  {
    id: "16-P2",
    domain: "problemes",
    competency: "Interprète l'intersection d'une droite avec les axes",
    statement: "En quel point la droite $y = -2x + 6$ coupe-t-elle l'axe des $x$ ?",
    options: [
      { id: "a", label: "$(0, 6)$", errorTag: "lecture_graphique" },
      { id: "b", label: "$(-3, 0)$", errorTag: "erreur_signe" },
      { id: "c", label: "$(3, 0)$", correct: true },
      { id: "d", label: "$(6, 0)$", errorTag: "isoler_inconnue" },
    ],
  },
];
