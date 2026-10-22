---
doc: spec
status: draft
---

# BuildProof — Technical Specification

## How This Works, In Plain Language

BuildProof tourne comme une petite application web locale. L'interface envoie une intention — créer une exigence, générer un candidat de scénario, approuver, lancer, finaliser — et un service d'application contrôle l'état. Un dépôt garde tout, un générateur séparé ne fait que proposer des scénarios, et un exécuteur ne sait agir que sur un scénario déjà approuvé.

L'exécuteur automatisé parcourt l'application web cible, action après action, dans un délai borné, prend des notes et une capture, puis dépose un résultat finalisé et ses preuves. Le rapport ne lit que le dépôt : il ne peut ni produire un statut depuis un candidat, ni réparer un résultat.

Cette forme reste volontairement plate parce qu'une preuve lisible importe plus qu'une architecture impressionnante. Une seule source de vérité, une seule porte d'entrée par exécution, aucune boucle où un texte proposé devient un verdict.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. L'utilisateur ouvre l'application → la vue `Exigences` charge le projet courant.
2. Il saisit `REQ-01`, un énoncé et une priorité → validation domaine → dépôt → rechargement de la liste.
3. Il demande des scénarios pour `REQ-01` → génération IA séparée → candidats en brouillon dans le panneau.
4. Il lit les étapes → requiert approbation explicite → champ `approved` et version figée en base.
5. Sur `Exécutions`, il lance le scénario → `Run` passe `queued` → `running` dans le dépôt.
6. L'exécuteur automatisé parcourt les étapes, prend une capture, capture les journaux → le coordinateur libère `Result` et `Evidence` une fois seulement, de façon atomique.
7. Sur `Rapport`, la ligne de `REQ-01` affiche `pass` → tiroir → même `runId` que la capture et les journaux.

Si le pas 6 est interrompu par un délai, la ligne montre `timeout` et `needs review`, jamais un `pass` prématuré.

## Stack

Candidat à proposer pour décision de l'apprenant (non encore approuvé) :

- Frontend : React + Vite, TypeScript, composants HTML/CSS/SVG maison.
- Backend : petit service HTTP Node.js/TypeScript avec dépôt local.
- Persistence : SQLite (préférée, via `better-sqlite3`) ou stockage JSON avec écritures atomiques — stratégie à valider selon l'environnement ; les captures d'écran sont stockées séparément des données structurées.
- Exécution : Playwright, parce qu'il apporte navigation, sélecteurs, captures et journaux avec un seul cadre.
- Tests : Vitest pour l'unité et Playwright pour les parcours de spécification.

Raison : tout tient en local, sans clé ni quota, ce qui protège la démonstration. Le compromis : ajout d'un service local au lieu d'une page seulement statique, nécessaire pour interdire les faux chemins d'exécution.

Non vérifié : versions, installation des binaires et images de navigateur Playwright dans l'environnement de build — défaut à prévoir si l'installation ne fonctionne pas proprement.

Documentation à poser après acceptation : liens React/Vite, Node.js, Playwright, Vitest, SQLite/better-sqlite3.

## Where It Runs and How Someone Tries It

Runtime : application locale et navigateur local, sans clé d'API et sans service externe pendant l'enregistrement. Toute clé d'IA nécessaire reste côté backend et n'est jamais exposée au frontend.

Commande exacte à définir après l'accord du stack et de la persistence. Plan de vérification : démarrer le service puis le frontend, ouvrir l'URL locale, dérouler les trois exigences de la démonstration sur l'application cible locale ; les captures de preuve s'ouvrent depuis le rapport.

Submission exige deux livrables : une vidéo de démo courte et un dépôt GitHub public. Le déploiement est facultatif et ne remplace aucun des deux. Les contraintes exactes de durée de vidéo dépendent du formulaire de soumission Devpost actuel et n'ont pas été vérifiées localement.

## Look and Feel

Repris de `prd.md > Look and Feel` : direction provisoire (instrument de vérification, densité terminal, base claire ou sombre selon préférence, accents réservés aux statuts, zéro animation de victoire prématurée, libellé indiquant d'où vient le contenu proposé). À confirmer par l'apprenant.

Si leur stack limite la typographie ou la densité, cette limite est explicitement reportée ici.

## Components

### Workspace / Requirements

Route `Exigences`. Crée, édite et archive les exigences, affiche états vide/chargement/erreur/indisponible.
PRD ref: `prd.md > Requirement intake`.

### Scenario Generation Gate

Route `Scénarios`. Met en attente, présente, édite et refuse aux candidats l'exécution, l'approbation ou toute écriture de statut.
PRD ref: `prd.md > Scenario suggestion and approval`.

Intégration IA :
- Le fournisseur d'IA est une décision ouverte (pas de présomption sur le prestataire).
- L'IA reçoit l'énoncé de l'exigence et retourne une sortie structurée conforme au schéma d'actions contrainte : `navigate`, `fill`, `click`, `assertVisible`, `assertText`, `assertUrl`, avec paramètres typés.
- L'IA ne génère jamais de JavaScript exécutable ni d'arbitraire code pour le test runner.
- Chaque action et paramètre est validé côté serveur avant exécution (URL dans l'allowlist de l'origine cible, sélecteurs sûrs uniquement).
- En cas d'indisponibilité de l'IA, le système affiche un état d'erreur et permet la saisie manuelle des étapes ; il ne simule jamais une génération IA.
- Frontière : le contenu généré reste un brouillon (`draft`) jusqu'à approbation humaine explicite ; il ne peut pas produire un état d'exécution ni un résultat.

### Approval Workflow

Commandes `request_generation`, `save_scenario`, `approve_scenario`. Persiste l'état `draft` ou `approved` avec un numéro de version ; refuse toute transition de `run` depuis `draft` ; journalise l'acteur et le temps. Une édition post-approbation crée une nouvelle version de brouillon.
PRD ref: `prd.md > Scenario suggestion and approval`, `prd.md > Scenario versioning`.

### Execution Coordinator

Gère `queued → running → succeeded / failed / blocked / timeout`, interdit la double finalisation, ordonne les erreurs vers les catégories de diagnostic, associe capture, journal et note au même `runId`. Timeouts bornés pour chaque exécution.
PRD ref: `prd.md > Executable checks`.

### Browser Automation Adapter

Fonctionne sur l'URL cible autorisée, applique pas à pas sous délai borné, capture screenshots, logs, temps et points de rupture, et normalise `navigation`, `timeout`, `selector` ou `crash`.
Sécurité : navigation autorisée uniquement vers l'URL cible du projet ; les destinations non autorisées (services localhost non liés à la démo, adresses de réseaux privés, points de terminaison de métadonnées cloud, fichiers locaux `file://`, toute autre destination non autorisée) sont bloquées. La validation ne repose pas uniquement sur une chaîne d'URL : l'URL est parsée, le hostname vérifié, les plages d'adresses interdites rejetées, et les redirections suivies uniquement vers des origines autorisées. Aucun code issu de l'IA n'est exécuté.
PRD ref: `prd.md > Executable checks`, `prd.md > Evidence capture`.

### Evidence Viewer

Lit et affiche screenshot, logs, URL et durée par exécution ; implémente `evidence unavailable` pour donnée absente, corrompue ou effacée hors règles.
PRD ref: `prd.md > Evidence capture`.

### Report Dashboard

Route `Rapport`. Regroupe par exigence, calcule `pass`, `fail`, `blocked`, `not tested`, `needs review` uniquement depuis résultats finalisés ou absence ; expose somme, filtres, drill et ouverture de preuve. Marque les résultats obsolètes (stale) quand l'exigence ou le scénario a changé.
PRD ref: `prd.md > Traceability report`.

## Data Model

Tables à identifiants stables : `Project`, `Requirement`, `Scenario`, `Run`, `Result`, `Evidence`.

- `Project` porte `id`, `title`, `targetUrl`.
- `Requirement` appartient à `Project` et porte `code`, `statement`, `priority`, `note`, `archivedAt`, `createdAt`, `updatedAt`.
- `Scenario` appartient à `Requirement` et porte `mode` (`browser` | `guided` — `guided` différé hors MVP), `state` (`draft` | `approved`), `approvedAt`, `currentVersion`.
- Une version de scénario porte `scenarioId`, `versionNumber` (immuable une fois approuvée), `steps[]` conforme au schéma d'actions, `approvedAt`, `approvedBy`. Une édition post-approbation incrémente `versionNumber` et repasse l'état en `draft`.
- `Run` appartient exclusivement à une version de scénario, avec `runId`, `scenarioId`, `scenarioVersion` (instantané figé), `requirementId`, `state` de `queued` à terminal unique, `startedAt`, `finishedAt`, `durationMs`, `targetUrl`.
- `Result` appartient à `Run`, obligatoirement unique, porte `status` (`succeeded` | `failed` | `blocked` | `timeout`), `summary`, `diagnosticCode` (`selector` | `navigation` | `timeout` | `crash` | `unknown`), `executedSteps[]`.
- `Evidence` appartient à `Run`, plusieurs par exécution, avec `kind` (`screenshot` | `step-log` | `manual-note` | `diagnostic`), `state` (`available` | `unavailable`), `createdAt`, `uri`. Les captures d'écran sont stockées séparément des données structurées et référencées par leur `uri`.

Chaque table garde statut et timestamps déplaçables seulement par frontière serveur. Écritures conditionnelles : un candidat `draft` ne peut engendrer `Run` ; une version approuvée est immuable ; la finalisation écrit `Result` et `Evidence` de façon atomique ; une seconde tentative de finalisation est rejetée (`conflict`).

## File Structure

Arbre proposé, à ajuster avec le choix du stack et de la persistence :

```
buildproof/
├── src/
│   ├── domain/
│   │   ├── validation.ts
│   │   └── status.ts
│   ├── application/
│   │   ├── requirements/
│   │   ├── scenarios/
│   │   ├── runs/
│   │   └── report/
│   ├── server/
│   │   ├── routes/
│   │   ├── repository/
│   │   └── execution/
│   │       ├── coordinator.ts
│   │       ├── browser.ts
│   │       └── ai.ts
│   ├── ui/
│   │   ├── requirements/
│   │   ├── scenarios/
│   │   ├── runs/
│   │   ├── report/
│   │   └── shared/
│   ├── fixtures/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── devpost/         # Devpost learning workspace
├── data/            # dépôt local (SQLite ou JSON) et captures, hors commits
└── ...
```

## External Services and Dependencies

Aucune API externe, base de données distante, hébergement, coût ou quota pendant l'ACP. Dépendances locales avec version, lien documentaire et commandes d'installation ; Playwright car il fournit navigateur, sélecteurs, captures et journaux. Son binaire et ses images constituent la dépendance difficile à vérifier en priorité.

Si un fournisseur d'IA est utilisé : clé stockée côté backend uniquement, jamais envoyée au frontend ; aucun appel IA depuis le navigateur de l'utilisateur.

Impossible d'exiger des clés utilisateur dans l'ACP.

## Important Failure Modes

- **Cible injoignable ou binaire navigateur absent** → `blocked`, diagnostic `navigation`, action de réessayer et chemin disponible ; ne jamais mettre à jour le statut d'exigence.
- **Double finalisation ou réponse tardive** → première réponse reste, seconde est rejetée comme `conflict` ; le rapport n'est jamais recalculé vers un statut trompeur.
- **Preuve perdue ou corrompue** → `evidence unavailable` sur l'exécution, sans effacer `Result`.
- **Indisponibilité de l'IA** → état d'erreur d'affichage, génération indisponible, saisie manuelle possible ; jamais de simulation d'IA.

## What Was Simplified and Why

- **Dépôt local (SQLite ou JSON)** au lieu de base de données distante : un projet démontable suffit.
- **Un projet actif** au lieu de portefeuille : le noyau est lisible.
- **Un seul exécuteur automatisé** au lieu de plateformes : automation propre sur le cas nominal ; le contrôle guidé manuel est différé.
- **Aucune couche historique** : une exécution traçable sert mieux l'objectif de fiabilité qu'une tendance précipitée.
- **Pas de contrôle guidé dans le MVP** : les vérifications exigeant un jugement humain restent non testées jusqu'à une itération ultérieure.

## Decisions and Open Issues

- **Choix de l'apprenant : stack** — non approuvé ; candidat posé ci-dessus avec raison et compromis, à accepter ou changer.
- **Choix de l'apprenant : persistence** — recommandation SQLite, à valider selon l'environnement et la complexité d'implémentation.
- **Choix de l'apprenant : direction Look and Feel** — provisoire, reprise de `prd.md > Look and Feel`, à confirmer.
- **Choix de l'apprenant : cible de démonstration et URL autorisée** — à fixer avant le build.
- **Choix de l'apprenant : fournisseur d'IA et comportement en cas d'indisponibilité** — à préciser ; aucune clé côté frontend.
- **Inconnu utile : exécution navigateur en local** — l'environnement, les versions et l'accès aux images n'ont jamais été vérifiés. Dès le début du build : installer Playwright, charger la fixture, lancer un parcours qui laisse URL, capture et journaux, et noter ce qui est prêt ou bloqué.
- Questions reportées de `prd.md > Open Questions` : plusieurs projets éditables peuvent attendre après le MVP.
