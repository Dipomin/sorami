# sorami-frontend

## Description
sorami-frontend est une application web construite avec Next.js qui permet aux utilisateurs de créer, visualiser et gérer des livres. L'application utilise une architecture moderne et réactive pour offrir une expérience utilisateur fluide.

## Fonctionnalités
- **Liste des livres** : Affiche tous les livres disponibles dans l'application.
- **Détails du livre** : Permet aux utilisateurs de consulter les détails d'un livre spécifique.
- **Création de livres** : Fournit un formulaire pour créer de nouveaux livres.
- **Génération de contenu** : Intègre des fonctionnalités pour générer du contenu de livre, comme des chapitres.

## Structure du projet
Le projet est organisé comme suit :

```
sorami-frontend
├── src
│   ├── app
│   │   ├── layout.tsx          # Mise en page principale de l'application
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── books                # Dossier pour les pages liées aux livres
│   │   │   ├── page.tsx        # Liste des livres
│   │   │   └── [id]             # Dossier pour les détails d'un livre spécifique
│   │   │       └── page.tsx    # Détails du livre
│   │   ├── create               # Dossier pour la création de livres
│   │   │   └── page.tsx        # Formulaire de création de livre
│   │   └── api                  # Dossier pour les routes API
│   │       ├── books            # Dossier pour les routes liées aux livres
│   │       │   └── route.ts    # Gestion des requêtes API pour les livres
│   │       └── generate         # Dossier pour la génération de contenu
│   │           └── route.ts    # Gestion des requêtes API pour la génération
│   ├── components               # Dossier pour les composants réutilisables
│   │   ├── ui                   # Dossier pour les composants UI
│   │   │   ├── button.tsx       # Composant de bouton
│   │   │   ├── input.tsx        # Composant d'entrée
│   │   │   ├── card.tsx         # Composant de carte
│   │   │   └── progress.tsx     # Composant de barre de progression
│   │   ├── BookForm.tsx         # Composant pour le formulaire de livre
│   │   ├── BookList.tsx         # Composant pour la liste des livres
│   │   ├── ChapterViewer.tsx     # Composant pour visualiser un chapitre
│   │   └── BookProgress.tsx      # Composant pour afficher la progression d'un livre
│   ├── lib                      # Dossier pour les bibliothèques utilitaires
│   │   ├── utils.ts             # Fonctions utilitaires
│   │   ├── api.ts               # Gestion des appels API
│   │   └── types.ts             # Types TypeScript
│   └── hooks                    # Dossier pour les hooks personnalisés
│       ├── useBooks.ts          # Hook pour gérer l'état des livres
│       └── useBookGeneration.ts  # Hook pour gérer la génération de livres
├── public                       # Dossier pour les fichiers publics
│   └── favicon.ico              # Icône de la page web
├── package.json                 # Configuration npm
├── next.config.js               # Configuration Next.js
├── tailwind.config.js           # Configuration Tailwind CSS
├── tsconfig.json                # Configuration TypeScript
└── README.md                    # Documentation du projet
```

## Installation
Pour installer les dépendances du projet, exécutez la commande suivante :

```
npm install
```

## Démarrage
Pour démarrer l'application en mode développement, utilisez la commande :

```
npm run dev
```

## Contribuer
Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction de bogue.

## License
Ce projet est sous licence MIT.# sorami
