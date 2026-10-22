---
doc: scope
status: draft
---

# BuildProof

Une application web légère qui aide les développeurs à vérifier si une petite application web respecte ses exigences produit.

## The Unique Kernel

Un statut n'a de valeur que s'il est traçable jusqu'à une exigence, un scénario approuvé et une preuve d'exécution réelle. BuildProof sépare les propositions générées par l'IA des vérifications effectivement exécutées, afin qu'un développeur voie ce qui est prouvé, échoué, bloqué ou simplement non testé.

Cette exigence de preuve est le produit ; elle est plus distinctive qu'un simple générateur de scénarios ou rapporteur de tests.

## Who It's For

Un développeur qui doit répondre, avant une démo, une livraison ou une relecture, à cette question : « Ma petite application web respecte-t-elle ses exigences, et puis-je le montrer ? »

Aujourd'hui, il oublie ses critères dans un ticket, une page ou une mémoire, ou fait confiance à un résumé générique. Il veut une trace courte qui indique ce qui passe, ce qui échoue et ce qui n'a jamais été exécuté.

## The Core Loop

1. Ouvrir le projet lié à une application web cible.
2. Ajouter une exigence produit (identifiant, énoncé, priorité, note d'acceptation).
3. Demander des scénarios de vérification générés par l'IA.
4. Revoir, éditer et approuver explicitement un scénario avant toute exécution.
5. Lancer l'exécution automatisée et consulter le résultat réel.
6. Ouvrir le rapport, filtrer un statut et consulter la preuve liée à l'exécution.
7. Corriger l'échec, relancer, revenir au rapport.

Cette boucle se répète tant qu'une exigence reste sans preuve convaincante.

## Inspiration & Identity

La direction visuelle n'a pas encore été établie par l'apprenant. À ce stade, l'application doit avoir l'air d'un instrument de vérification pour développeurs : sobre, dense quand il faut lire des critères et des journaux, immédiatement lisible quand un statut change.

Cette direction est enregistrée comme provisoire dans `prd.md > Look and Feel` et `spec.md > Look and Feel` ; elle doit être confirmée (ou ajustée) par l'apprenant avant le build. Elle ne bloque pas le reste du plan.

## Why This Matters to the Learner

Priorité explicite : privilégier des résultats de test fiables et observables aux affirmations générées par l'IA. Le projet transforme cette priorité en critère de conception : toute affirmation générée reste séparée d'un résultat exécuté et d'une preuve ouvrable.

## What "Working" Looks Like

À partir d'une petite application web locale de démonstration et d'un projet contenant environ trois exigences, je génère des scénarios candidats, j'en approuve un petit nombre, je lance l'un des contrôles automatisés, puis j'ouvre le rapport. Le rapport affiche `pass` avec capture, `fail` avec diagnostic, et `not tested` avec une action de lancement. Chaque ligne `pass` ou `fail` ouvre sa preuve provenant de la même exécution.

Le moment probant est l'échec visible et traçable : un scénario cassé produit un diagnostic réel, jamais un succès fabriqué.

## The POC Boundary

Inclus dans le MVP :

- Un seul projet local, lié à une URL d'application cible unique et contrôlée.
- Un petit ensemble d'exigences (environ trois pour la démonstration), chacune avec identifiant, énoncé, priorité et note d'acceptation.
- Création, édition et archivage d'exigences.
- Génération de scénarios de vérification par l'IA, contrainte à un schéma d'actions défini (`navigate`, `fill`, `click`, `assertVisible`, `assertText`, `assertUrl`).
- Édition humaine des scénarios et approbation obligatoire avant exécution.
- Versions de scénarios immuables une fois approuvées ; toute édition crée un nouveau brouillon nécessitant une nouvelle approbation.
- Un seul exécuteur d'automatisation basé sur Playwright, avec un jeu d'actions limité et des timeouts bornés.
- États d'exécution : `queued`, `running`, `succeeded`, `failed`, `blocked`, `timeout`.
- Résultats réels uniquement : un succès ne peut être enregistré que si toutes les assertions ont réellement passé.
- Capture de preuve par exécution (horodatage, URL cible, étapes, résultat, diagnostic, référence de capture si disponible).
- Un rapport en lecture seule reliant exigence, scénario, dernier résultat et preuve.
- Persistance fiable (côté serveur, fichier local) survivant au rechargement.
- États de chargement, vide, erreur et d'échec clairement affichés.
- Une démonstration reproductible avant la date limite du 26 octobre 2026.

Un seul exécuteur automatique, pas de plateforme de tests multiples.

## Later

- Contrôle/exécution guidée manuelle.
- Plusieurs projets éditables.
- Comptes, authentification, collaboration.
- Historique avancé, tendances, export.
- Intégrations CI/CD, suites performance, accessibilité, sécurité.
- Réparation autonome.

## Explicitly Cut

- Contrôle guidé manuel dans le MVP : les vérifications nécessitant un jugement humain sont différées ; seules les exécutions automatisées limitées au schéma d'actions sont prouvées pour la démonstration.
- Multi-projets et collaboration : aucun partage ne prouve le noyau ; chaque rôle ajouterait états, permissions et tests.
- Intégrations Jira, GitHub, TestRail ou CI : le rapport peut rester traçable sans configurer un écosystème.
- Historique, tendances et comparaison de versions : ils multiplient les modèles alors que la boucle initiale doit prouver une exécution.
- Performance, accessibilité, sécurité et régression visuelle : chaque couche ajouterait ses propres seuils et preuves.
- Réparation autonome ou locators auto-réparables : ils peuvent transformer un échec en affirmation invérifiable.
- Tests mobiles, API ou génération de code applicatif : ils sortent du flux web unique demandé.
- Export de rapports et génération de code JavaScript exécutable par l'IA : un candidat généré n'est jamais exécuté directement.

Ce qui ne peut pas être coupé : approuver un scénario avant exécution, représenter honnêtement les échecs et rendre chaque résultat ouvrable jusqu'à sa preuve.

## Open Questions

- Choix de la stack technique (candidat : React + Vite, TypeScript, Node.js, Playwright, Vitest) — à convenir avec l'apprenant avant le build.
- Cible exacte de l'application de démonstration et URL autorisée — à fixer avant le build.
- Stratégie de persistence : SQLite (préférée) ou stockage JSON avec écritures sécurisées — à valider selon l'environnement.
- Fournisseur d'IA pour la génération de scénarios et comportement en cas d'indisponibilité — à préciser ; aucune clé API ne sera exposée au frontend.
- Direction visuelle finale — provisoire, à confirmer par l'apprenant.

Ce document est une proposition de travail révisée le 2026-10-22, enregistrée comme brouillon pour revue. Il n'est pas approuvé tant que l'apprenant n'a pas formulé un accord explicite sur le plan affiché.
