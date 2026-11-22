# ScopeArk · Diagnostic de mathématiques (12 à 17 ans)

Application Next.js **sans compte et sans base de données**. L'élève répond à un QCM adapté à
son âge ; le rapport d'observation (grille pédagogique en 7 sections) est généré automatiquement
à partir de ses réponses.

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Fonctionnement

1. **Accueil** : prénom (facultatif) + âge → tranche `12-13`, `14-15` ou `16-17`.
2. **Test** : 10 questions (2 par domaine) servies par `GET /api/questions?age=…`
   **sans les corrigés** (les bonnes réponses restent côté serveur).
3. **Analyse** : `POST /api/evaluate` calcule le rapport (`lib/analysis.ts`) et le renvoie.
   Rien n'est stocké.
4. **Rapport** : `/rapport` affiche la grille remplie, imprimable en PDF. Le bouton
   « Copier le lien » encode le rapport dans le fragment d'URL (`#r=…`), jamais envoyé au serveur.

## Comment l'observation est automatisée

| Section de la grille | Source |
|---|---|
| 1. Observations par exercice | bonne réponse = Acquis ; changée 2 fois ou plus = Fragile ; sinon Non acquis |
| 2. Stratégies et autonomie | indicateurs approchés : « Je ne sais pas », réponses très rapides et fausses, changements de réponse |
| 3. Types d'erreurs | chaque mauvaise réponse porte un `errorTag` ; « observée » à partir de 2 occurrences |
| 4. Synthèse par domaine | 2/2 Acquis, 1/2 Fragile, 0/2 Non acquis → priorité Basse / Moyenne / Haute |
| 5. Observations libres | champ de notes pour le tuteur (non enregistré) |
| 6. Plan de remédiation | règles dans `lib/meta.ts` (`ERROR_REMEDIATION`, `DOMAIN_REMEDIATION`) |
| 7. Retour au parent | brouillon généré, modifiable |

## Modifier ou ajouter des questions

Les banques sont dans `lib/questions/` (un fichier par tranche d'âge). Une question :

```ts
{
  id: "12-L2",
  domain: "calcul_litteral",
  competency: "Distributivité : multiplie chaque terme",
  statement: "Développe : $3(x + 4)$",
  options: [
    { id: "a", label: "$3x + 4$", errorTag: "distributivite_incomplete" },
    { id: "b", label: "$3x + 12$", correct: true },
    ...
  ],
}
```

- Formules avec KaTeX : `$...$`. Pour un dollar littéral, écrire `\\$` (ex. `20 \\$`).
- Chaque mauvaise réponse devrait porter un `errorTag` (voir `lib/types.ts`).
- Les options sont mélangées à l'affichage.
- Garder 2 questions par domaine pour que la notation 2/2 – 1/2 – 0/2 reste valide.

## Structure

```
app/
  page.tsx               accueil (âge)
  test/page.tsx          QCM
  rapport/page.tsx       rapport (session ou lien partagé)
  api/questions/route.ts questions sans corrigé
  api/evaluate/route.ts  correction + analyse
components/              MathText (KaTeX), RadarChart (SVG), ReportView
lib/
  questions/             banques par tranche d'âge
  analysis.ts            moteur d'observation automatique
  meta.ts                libellés, règles de remédiation, tranches d'âge
  share.ts               encodage du rapport dans l'URL
  types.ts
```

## Limites connues

- Un QCM permet de deviner : l'option « Je ne sais pas » et les distracteurs plausibles limitent
  ce biais, mais le rapport reste une aide à l'orientation, pas un diagnostic définitif.
- Les comportements comme « explique son raisonnement » nécessitent une observation en direct.
- Les questions sont une première proposition à valider avec le programme et les exercices
  de `feuille_diagnostic_mathematiques.pdf`.
