---
doc: prd
status: draft
---

# BuildProof — Product Requirements

Une application web monoutil qui relie des exigences produit à des contrôles exécutés et à des preuves consultables, pour un développeur qui doit juger une petite application web.

Source : `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > The POC Boundary`.

## The Core Journey

1. L'utilisateur ouvre le projet lié à une application web existante.
2. Il saisit, corrige ou archive une exigence produit (identifiant, énoncé, priorité, note d'acceptation).
3. Il demande des scénarios de vérification pour une exigence sélectionnée ; l'IA génère des candidats dont chaque étape respecte un schéma d'actions contrainte.
4. Il ouvre chaque candidat, en modifie les étapes si nécessaire, puis l'approuve ou le supprime explicitement. Aucun scénario non approuvé ne peut être exécuté.
5. Il lance un scénario approuvé en automatique. L'exécution passe par `queued`, puis `running`, et se termine par `succeeded`, `failed`, `blocked` ou `timeout`.
6. L'exécution enregistre ses preuves (étapes, résultat, diagnostic, URL cible, capture d'écran si disponible) liées à l'identifiant d'exécution.
7. Il ouvre le rapport, filtre les statuts, développe une exigence et inspecte la preuve associée.

Le résultat gagnant : aucun statut affiché ne peut provenir d'un texte généré, et une exigence non exécutée reste visiblement `not tested`.

## Screens and Layout

BuildProof occupe quatre écrans dans une navigation unique vers la gauche : `Exigences`, `Scénarios`, `Exécutions`, `Rapport`.

- **Exigences** — enregistrement rapide en haut, puis tableau dense.
- **Scénarios** — sélection d'une exigence, panneau principal de candidats avec étapes éditables, actions `Approuver`, `Éditer`, `Supprimer` ; message discret expliquant l'origine générée du contenu.
- **Exécutions** — suivi ligne à ligne ouvrant le détail d'une exécution en cours ou finalisée.
- **Rapport** — filtres en haut, résumé compact de statuts, puis lignes par exigence avec drill et ouverture de preuve.

Aucune vue n'est créée pour remplir la grille.

## Look and Feel

Direction non établie lors de l'entretien initial. Direction provisoire enregistrée : instrument de vérification pour développeurs, typographie claire et hiérarchisée, couleurs réservées aux statuts, densité utile, zéro animation décorative, libellé indiquant l'origine du contenu généré par l'IA.

Cette direction est provisoire ; elle doit être confirmée par l'apprenant avant le build et ne bloque pas le reste du plan.

## Features and Behavior

### Project workspace

- FR-1.1 Créer un projet avec un titre et l'URL de l'application cible.
- FR-1.2 Conserver les exigences, scénarios, exécutions et preuves au rechargement.
- AC-1.1 Un projet existant affiche ses données au retour sans nouvelle configuration.

### Requirement intake

- FR-2.1 Ajouter, modifier, archiver et lister une exigence.
- FR-2.2 Attribuer identifiant, énoncé, priorité et note d'acceptation.
- FR-2.3 Bloquer un énoncé vide ; le nombre d'exigences actives reste limité à un petit ensemble (environ trois pour la démonstration ; pas de quota arbitraire).
- AC-2.1 Un écran non vide exige un enregistrement complet.

### Scenario suggestion and approval

- FR-3.1 Générer des candidats de scénarios à partir d'une ou plusieurs exigences, via l'intégration IA spécifiée dans `spec.md > Scenario Generation Gate`.
- FR-3.2 Chaque candidat est un modèle éditable, avec étapes ordonnées respectant le schéma d'actions contrainte (`navigate`, `fill`, `click`, `assertVisible`, `assertText`, `assertUrl`).
- FR-3.3 Requérir une action d'approbation distincte pour tout scénario exécutable.
- FR-3.4 Interdire à la génération d'accéder à l'exécution, au résultat ou à la preuve.
- FR-3.5 Supprimer ou rejeter un candidat sans toucher à son exigence.
- AC-3.1 Une tentative d'exécution d'un candidat non approuvé est refusée.

### Scenario versioning

- FR-3.6 Une version de scénario approuvée est immuable.
- FR-3.7 Éditer un scénario approuvé crée un nouveau brouillon avec un nouveau numéro de version, nécessitant une nouvelle approbation explicite.
- FR-3.8 Une exécution (`Run`) référence de façon permanente la version exacte du scénario qu'elle a exécutée ; les exécutions historiques ne divergent jamais silencieusement du scénario associé à leurs preuves.
- AC-3.2 Une tentative d'exécution d'une version de scénario autre que celle approuvée est refusée.

### Executable checks

- FR-4.1 Lancer un scénario approuvé via l'exécuteur automatisé.
- FR-4.2 Afficher `queued`, `running`, puis `succeeded`, `failed`, `timeout` ou `blocked`.
- FR-4.3 Refuser toute double finalisation après un résultat enregistré.
- FR-4.4 Convertir navigation impossible, pointeur absent et délai écoulé en les catégories de diagnostic normalisées `selector`, `navigation`, `timeout`, `crash`, `unknown`.
- FR-4.5 Produire `blocked` pour une défaillance d'infrastructure (cible injoignable, navigateur absent) sans la présenter comme un défaut de l'application.
- AC-4.1 Une expiration bornée apparaît comme un résultat `timeout`, jamais comme un succès présumé.
- AC-4.2 L'état d'exécution (`queued`…`timeout`) est distinct du statut de vérification (`pass`, `fail`, etc.) calculé dans le rapport.

### Evidence capture

- FR-5.1 Écrire, pour un résultat lié à son exécution : run ID, scénario et version, exigence, statut, horodatages, durée, URL cible et étapes exécutées.
- FR-5.2 Ajouter captures d'écran, journal d'étapes, note manuelle et information de diagnostic à leur exécution.
- FR-5.3 Marquer toute preuve indisponible comme telle sans effacer le résultat ; une capture manquante n'efface pas un résultat.
- FR-5.4 Ne jamais rendre une preuve manquante comme une preuve de succès.
- AC-5.1 Chaque ligne `pass` ou `fail` ouvre une preuve provenant de la même exécution.
- AC-5.2 Chaque preuve est liée à l'exécution (`runId`) qui l'a produite ; les exécutions historiques sont préservées.

### Traceability report

- FR-6.1 Grouper chaque exigence active et ses scénarios, statuts, preuves et dernier résultat.
- FR-6.2 Attribuer `pass`, `fail`, `blocked`, `not tested` ou `needs review` selon le registre d'agrégation défini dans `spec.md > Report Dashboard`.
- FR-6.3 Ajouter `not tested` pour tout scénario approuvé sans résultat.
- FR-6.4 Produire chaque statut depuis un résultat finalisé, une absence ou un enregistrement incomplet.
- FR-6.5 Classer et sommer les lignes ; si une agrégation fiable au niveau de l'exigence s'avère trop complexe, afficher les résultats individuels des scénarios plutôt que de fabriquer un seul verdict d'exigence.
- AC-6.1 Un texte généré ne peut jamais fournir un statut affiché.
- AC-6.2 Un résultat devient obsolète (stale) lorsque l'exigence ou le scénario qu'il couvre a changé ; le rapport indique clairement ce qui a besoin d'être réexécuté.

## States and Boundaries

- **Première utilisation** — invite à créer un projet et ajouter une première exigence.
- **Espace de travail vide** — état vide sur chaque écran, sans faux contenu de démonstration présenté comme réel.
- **Limite d'exigences** — petit ensemble (environ trois pour la démonstration) ; pas de compteur `10 / 10`.
- **En attente de génération** — états vides, chargement et panne différenciés.
- **Exécution en cours** — progression et horodatage visibles, aucun résultat avant finalisation.
- **Échec ou expiration** — diagnostic affiché, liens vers l'édition du scénario ou l'exécution suivante.
- **Preuve indisponible** — contournement affiché, résultats existants préservés.
- **Persistance** — projet, exigences, scénarios, preuves et résultats survivent au rechargement.
- **Périmètre** — un seul utilisateur, pas de partage ni de permission fine.
- **Sécurité de navigation** — l'exécuteur navigue uniquement vers l'URL cible autorisée du projet ; les destinations non autorisées (localhost externe, réseaux privés, métadonnées cloud, fichiers locaux) sont bloquées.

## Product Decisions

- Décision du scope : un projet mono-cible, pour éviter que la sélection de projet ne devienne un second workflow.
- Décision du scope : petit ensemble d'exigences (environ trois pour la démo) ; pas de quota arbitraire de dix.
- Décision du scope : approbation explicite, pour maintenir la porte humaine qui distingue suggestion et certification.
- Décision du scope : exécution automatisée limitée au schéma d'actions Playwright, pour une démonstration fiable et circonscrite.
- Décision du scope : contrôle guidé manuel différé hors du MVP.
- Décision du scope : statuts fermés, pour que le rapport reste auditable et non rhétorique.

Toute hypothèse restante est signalée comme hypothèse avant approbation.

## What We're Building

- Projet local avec URL cible et persistance démarrage-partout.
- Enregistrement d'un petit ensemble d'exigences (environ trois pour la démonstration).
- Génération verrouillée de brouillons par l'IA, édition des étapes et approbation explicite.
- Versioning immuable des scénarios approuvés.
- Exécution automatisée bornée sur une application web avec progression et états terminaux.
- Captures, journaux d'étapes, diagnostics et notes par exécution, protégés contre l'effacement après finalisation.
- Rapport regroupant exigences, statuts, preuves, filtres et tiroir de preuve.

## Deferred From the POC

- Contrôle/exécution guidée manuelle.
- Systèmes de comptes derrière le partage des rapports, autres outils derrière les connecteurs.
- Historique et tendances avancés, import et export.
- Intégrations CI/CD, suites performance/accessibilité/sécurité, réparation autonome.
- Export de rapports.

## Possible Later Enhancements

- Comptes et équipes, API de journalisation, modèles de scénarios prédéfinis, exports HTML, intégrations CI, contrôle guidé.

## Non-Goals

- Pas de génération de code applicatif : BuildProof juge une application, il ne la construit pas.
- Pas d'exécution de code JavaScript ou d'instructions arbitraires générées par l'IA ; seules les actions validées du schéma contrainte sont exécutées.
- Pas de collaboration temps réel ni de propagation multi-projets dans l'ACP.
- Pas de suites performance, accessibilité, sécurité ou visite — elles introduiraient leurs propres critères et effondreraient la signification unique du statut.
- Pas de réparation autonome : elle contredirait le principe que rien n'est affiché sans preuve.
- Pas de certification depuis une promesse : un candidat généré n'est jamais une preuve.

## Open Questions

- Environnement navigateur fiable pour l'exécution locale (Playwright) — à vérifier en début de build.
- Fournisseur d'IA et comportement en cas d'indisponibilité — à préciser avant le build.
- Stratégie de persistence : SQLite ou JSON — à valider selon l'environnement.
- Application cible de démonstration et URL autorisée — à fixer avant le build.
- Plusieurs projets éditables — peut attendre après le MVP.
