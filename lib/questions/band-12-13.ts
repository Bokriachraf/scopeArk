import type { Question } from "../types";

/** 12–13 ans · Secondaire 1–2 */
export const band1213: Question[] = [
  // ---------- Calcul numérique ----------
  {
    id: "12-N1",
    domain: "calcul_numerique",
    competency: "Respecte la priorité des opérations",
    statement: "Calcule : $8 + 3 \\times 4$",
    options: [
      { id: "a", label: "$44$", errorTag: "priorite_operations" },
      { id: "b", label: "$20$", correct: true },
      { id: "c", label: "$15$", errorTag: "erreur_calcul" },
      { id: "d", label: "$96$", errorTag: "erreur_calcul" },
    ],
  },
  {
    id: "12-N2",
    domain: "calcul_numerique",
    competency: "Opère sur les nombres entiers (règle des signes)",
    statement: "Calcule : $-5 - (-3)$",
    options: [
      { id: "a", label: "$-8$", errorTag: "erreur_signe" },
      { id: "b", label: "$8$", errorTag: "erreur_signe" },
      { id: "c", label: "$2$", errorTag: "erreur_signe" },
      { id: "d", label: "$-2$", correct: true },
    ],
  },

  // ---------- Calcul littéral ----------
  {
    id: "12-L1",
    domain: "calcul_litteral",
    competency: "Réduction : regroupe les termes de même nature",
    statement: "Réduis : $4x + 3 + 2x - 5$",
    options: [
      { id: "a", label: "$6x^2 - 2$", errorTag: "termes_semblables" },
      { id: "b", label: "$6x + 8$", errorTag: "erreur_signe" },
      { id: "c", label: "$6x - 2$", correct: true },
      { id: "d", label: "$9x$", errorTag: "termes_semblables" },
    ],
  },
  {
    id: "12-L2",
    domain: "calcul_litteral",
    competency: "Distributivité : multiplie chaque terme",
    statement: "Développe : $3(x + 4)$",
    options: [
      { id: "a", label: "$3x + 4$", errorTag: "distributivite_incomplete" },
      { id: "b", label: "$7x$", errorTag: "termes_semblables" },
      { id: "c", label: "$x + 12$", errorTag: "distributivite_incomplete" },
      { id: "d", label: "$3x + 12$", correct: true },
    ],
  },

  // ---------- Équations ----------
  {
    id: "12-E1",
    domain: "equations",
    competency: "Résout une équation simple et isole x",
    statement: "Résous : $2x + 5 = 17$",
    options: [
      { id: "a", label: "$x = 11$", errorTag: "erreur_signe" },
      { id: "b", label: "$x = 6$", correct: true },
      { id: "c", label: "$x = 12$", errorTag: "isoler_inconnue" },
      { id: "d", label: "$x = 3{,}5$", errorTag: "operation_un_membre" },
    ],
  },
  {
    id: "12-E2",
    domain: "equations",
    competency: "Gère les parenthèses et vérifie la solution",
    statement: "Résous : $3(x - 2) = 12$",
    options: [
      { id: "a", label: "$x = 2$", errorTag: "erreur_signe" },
      { id: "b", label: "$x = \\frac{14}{3}$", errorTag: "distributivite_incomplete" },
      { id: "c", label: "$x = 14$", errorTag: "isoler_inconnue" },
      { id: "d", label: "$x = 6$", correct: true },
    ],
  },

  // ---------- Fonctions / tableaux ----------
  {
    id: "12-F1",
    domain: "fonctions",
    competency: "Calcule une image en remplaçant x",
    statement: "Une règle est donnée par $y = 2x + 1$. Quelle est la valeur de $y$ quand $x = 4$ ?",
    options: [
      { id: "a", label: "$8$", errorTag: "substitution_calcul" },
      { id: "b", label: "$9$", correct: true },
      { id: "c", label: "$10$", errorTag: "substitution_calcul" },
      { id: "d", label: "$5$", errorTag: "substitution_calcul" },
    ],
  },
  {
    id: "12-F2",
    domain: "fonctions",
    competency: "Distingue image et antécédent",
    statement: "Pour la règle $y = 3x$, quelle valeur de $x$ donne $y = 12$ ?",
    options: [
      { id: "a", label: "$36$", errorTag: "confusion_image_antecedent" },
      { id: "b", label: "$9$", errorTag: "isoler_inconnue" },
      { id: "c", label: "$15$", errorTag: "isoler_inconnue" },
      { id: "d", label: "$4$", correct: true },
    ],
  },

  // ---------- Graphiques / problèmes ----------
  {
    id: "12-P1",
    domain: "problemes",
    competency: "Traduit une situation en expression",
    statement:
      "Un abonnement coûte 20 \\$ d'inscription, puis 15 \\$ par mois. Quelle expression donne le coût total $C$ après $m$ mois ?",
    options: [
      { id: "a", label: "$C = 20m + 15$", errorTag: "modelisation" },
      { id: "b", label: "$C = 35m$", errorTag: "modelisation" },
      { id: "c", label: "$C = 15 + 20 + m$", errorTag: "modelisation" },
      { id: "d", label: "$C = 15m + 20$", correct: true },
    ],
  },
  {
    id: "12-P2",
    domain: "problemes",
    competency: "Interprète des points d'une droite",
    statement: "Quel point appartient à la droite d'équation $y = x + 2$ ?",
    options: [
      { id: "a", label: "$(5, 3)$", errorTag: "lecture_graphique" },
      { id: "b", label: "$(3, 5)$", correct: true },
      { id: "c", label: "$(3, 6)$", errorTag: "substitution_calcul" },
      { id: "d", label: "$(2, 2)$", errorTag: "substitution_calcul" },
    ],
  },
];
