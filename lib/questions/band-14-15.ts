import type { Question } from "../types";

/** 14–15 ans · Secondaire 3 */
export const band1415: Question[] = [
  // ---------- Calcul numérique ----------
  {
    id: "14-N1",
    domain: "calcul_numerique",
    competency: "Additionne des fractions (dénominateur commun)",
    statement: "Calcule : $\\frac{3}{4} + \\frac{1}{6}$",
    options: [
      { id: "a", label: "$\\frac{4}{10}$", errorTag: "fractions" },
      { id: "b", label: "$\\frac{3}{24}$", errorTag: "fractions" },
      { id: "c", label: "$\\frac{11}{12}$", correct: true },
      { id: "d", label: "$\\frac{7}{12}$", errorTag: "erreur_calcul" },
    ],
  },
  {
    id: "14-N2",
    domain: "calcul_numerique",
    competency: "Calcule avec puissances et nombres négatifs",
    statement: "Calcule : $(-2)^3 + 5 \\times (-1)$",
    options: [
      { id: "a", label: "$-3$", errorTag: "erreur_signe" },
      { id: "b", label: "$-13$", correct: true },
      { id: "c", label: "$3$", errorTag: "puissances" },
      { id: "d", label: "$-11$", errorTag: "puissances" },
    ],
  },

  // ---------- Calcul littéral ----------
  {
    id: "14-L1",
    domain: "calcul_litteral",
    competency: "Développe puis réduit une expression (double distributivité)",
    statement: "Développe et réduis : $(x + 3)(x - 2)$",
    options: [
      { id: "a", label: "$x^2 - 6$", errorTag: "distributivite_incomplete" },
      { id: "b", label: "$x^2 + x - 6$", correct: true },
      { id: "c", label: "$x^2 + 5x - 6$", errorTag: "erreur_signe" },
      { id: "d", label: "$x^2 + x + 6$", errorTag: "erreur_signe" },
    ],
  },
  {
    id: "14-L2",
    domain: "calcul_litteral",
    competency: "Distributivité avec un signe négatif devant la parenthèse",
    statement: "Réduis : $2(3x - 4) - (x - 5)$",
    options: [
      { id: "a", label: "$5x - 13$", errorTag: "erreur_signe" },
      { id: "b", label: "$7x - 13$", errorTag: "erreur_signe" },
      { id: "c", label: "$5x - 8$", errorTag: "distributivite_incomplete" },
      { id: "d", label: "$5x - 3$", correct: true },
    ],
  },

  // ---------- Équations ----------
  {
    id: "14-E1",
    domain: "equations",
    competency: "Résout une équation avec x des deux côtés",
    statement: "Résous : $5x - 3 = 2x + 9$",
    options: [
      { id: "a", label: "$x = 4$", correct: true },
      { id: "b", label: "$x = 2$", errorTag: "erreur_signe" },
      { id: "c", label: "$x = \\frac{12}{7}$", errorTag: "isoler_inconnue" },
      { id: "d", label: "$x = 3$", errorTag: "isoler_inconnue" },
    ],
  },
  {
    id: "14-E2",
    domain: "equations",
    competency: "Applique la même opération aux deux membres",
    statement: "Résous : $\\frac{x}{3} + 2 = 5$",
    options: [
      { id: "a", label: "$x = 13$", errorTag: "operation_un_membre" },
      { id: "b", label: "$x = 21$", errorTag: "erreur_signe" },
      { id: "c", label: "$x = 9$", correct: true },
      { id: "d", label: "$x = 1$", errorTag: "isoler_inconnue" },
    ],
  },

  // ---------- Fonctions / tableaux ----------
  {
    id: "14-F1",
    domain: "fonctions",
    competency: "Calcule une image en remplaçant x (nombre négatif)",
    statement: "Soit $f(x) = x^2 - 3x$. Calcule $f(-2)$.",
    options: [
      { id: "a", label: "$2$", errorTag: "substitution_calcul" },
      { id: "b", label: "$-2$", errorTag: "erreur_signe" },
      { id: "c", label: "$10$", correct: true },
      { id: "d", label: "$-10$", errorTag: "erreur_signe" },
    ],
  },
  {
    id: "14-F2",
    domain: "fonctions",
    competency: "Distingue image et antécédent",
    statement: "Soit $f(x) = 2x - 3$. Pour quelle valeur de $x$ a-t-on $f(x) = 9$ ?",
    options: [
      { id: "a", label: "$x = 15$", errorTag: "confusion_image_antecedent" },
      { id: "b", label: "$x = 3$", errorTag: "erreur_signe" },
      { id: "c", label: "$x = 1{,}5$", errorTag: "isoler_inconnue" },
      { id: "d", label: "$x = 6$", correct: true },
    ],
  },

  // ---------- Graphiques / problèmes ----------
  {
    id: "14-P1",
    domain: "problemes",
    competency: "Traduit une situation en équation puis résout",
    statement:
      "Léa loue un vélo : 12 \\$ de frais de base, plus 4 \\$ par heure. Elle paie 40 \\$ au total. Pendant combien d'heures a-t-elle loué le vélo ?",
    options: [
      { id: "a", label: "$13$ heures", errorTag: "erreur_signe" },
      { id: "b", label: "$7$ heures", correct: true },
      { id: "c", label: "$10$ heures", errorTag: "modelisation" },
      { id: "d", label: "$28$ heures", errorTag: "isoler_inconnue" },
    ],
  },
  {
    id: "14-P2",
    domain: "problemes",
    competency: "Interprète des points et la pente d'une droite",
    statement: "Une droite passe par les points $(0, 2)$ et $(3, 8)$. Quelle est son équation ?",
    options: [
      { id: "a", label: "$y = 3x + 2$", errorTag: "lecture_graphique" },
      { id: "b", label: "$y = 2x + 3$", errorTag: "lecture_graphique" },
      { id: "c", label: "$y = 2x + 2$", correct: true },
      { id: "d", label: "$y = 6x + 2$", errorTag: "lecture_graphique" },
    ],
  },
];
