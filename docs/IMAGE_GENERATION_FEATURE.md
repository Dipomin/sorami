# Documentation - Génération d'Images IA

## Vue d'ensemble

La fonctionnalité de **Génération d'Images IA** permet aux utilisateurs de créer des images uniques en utilisant l'intelligence artificielle **Google Gemini 2.0 Flash Experimental**. Les utilisateurs peuvent générer des images à partir de descriptions textuelles et/ou d'images sources.

## Architecture

### Structure des fichiers

```
src/
├── app/
│   └── generate-images/
│       └── page.tsx                    # Page principale
├── components/
│   ├── ImageGenerationForm.tsx        # Formulaire de génération
│   ├── ImageProgress.tsx              # Indicateur de progression
│   └── ImageResults.tsx               # Affichage des résultats
├── hooks/
│   └── useImageGeneration.ts          # Hook de génération
├── lib/
│   └── api-client.ts                  # Client API (étendu)
└── types/
    └── image-api.ts                   # Types TypeScript
```

### Composants principaux

#### 1. **ImageGenerationForm** (`src/components/ImageGenerationForm.tsx`)
Formulaire complet avec :
- Champ de description (prompt) requis
- URL d'image source optionnelle avec prévisualisation
- Options avancées : nombre d'images, dimensions, style, qualité, format
- Design moderne avec dégradés purple/pink
- Validation en temps réel

#### 2. **ImageProgress** (`src/components/ImageProgress.tsx`)
Affiche le statut de génération :
- Indicateurs visuels pour chaque état (PENDING, INITIALIZING, GENERATING, SAVING, COMPLETED, FAILED)
- Barre de progression animée
- Timestamps de création et mise à jour
- ID du job pour le debugging

#### 3. **ImageResults** (`src/components/ImageResults.tsx`)
Présentation des résultats :
- Grille responsive d'images (1 ou 2 colonnes)
- Métadonnées de génération (modèle, temps, tokens, taille)
- Bouton de téléchargement au survol
- Informations techniques par image (format, dimensions, poids)

#### 4. **useImageGeneration** (`src/hooks/useImageGeneration.ts`)
Hook custom pour gérer :
- Création de la tâche de génération
- Polling automatique du statut
- Gestion de l'état (loading, error, progress)
- Fonction de reset

### API Client

Nouvelles fonctions dans `src/lib/api-client.ts` :

```typescript
// Créer une génération d'images
createImageGeneration(data: ImageGenerationRequest): Promise<ImageGenerationJobResponse>

// Vérifier le statut
fetchImageStatus(jobId: string): Promise<ImageStatusResponse>

// Récupérer les résultats
fetchImageResult(jobId: string): Promise<ImageResultResponse>

// Polling automatique jusqu'à complétion
pollImageGenerationStatus(
  jobId: string,
  onProgress?: (status: ImageStatusResponse) => void,
  maxAttempts?: number,
  intervalMs?: number
): Promise<ImageResultResponse>
```

### Types TypeScript (`src/types/image-api.ts`)

```typescript
interface ImageGenerationRequest {
  prompt: string;                    // Description de l'image
  input_image_url?: string;          // Image source optionnelle
  num_images?: number;               // 1-4 images
  size?: '512x512' | '1024x1024' | '1792x1024';
  format?: 'PNG' | 'JPEG' | 'WEBP';
  style?: 'photorealistic' | 'artistic' | 'illustration' | '3d-render';
  quality?: 'standard' | 'high' | 'ultra';
}

type ImageJobStatus = 
  | 'PENDING'      // En attente
  | 'INITIALIZING' // Initialisation du modèle
  | 'GENERATING'   // Génération en cours
  | 'SAVING'       // Sauvegarde des fichiers
  | 'COMPLETED'    // Terminé avec succès
  | 'FAILED';      // Échec

interface GeneratedImage {
  file_path: string;      // Chemin serveur
  url: string;            // URL accessible
  description: string;    // Description utilisée
  format: string;         // Format du fichier
  size_bytes: number;     // Taille en octets
  dimensions: string;     // Ex: "1024x1024"
}

interface ImageResultResponse {
  job_id: string;
  status: ImageJobStatus;
  message: string;
  images?: GeneratedImage[];
  metadata?: ImageGenerationMetadata;
  errors?: string[];
}
```

## Fonctionnalités

### 1. Génération texte vers image
- Description textuelle détaillée
- Personnalisation du style et de la qualité
- Génération jusqu'à 4 images simultanément

### 2. Génération multimodale (texte + image)
- Utilisation d'une image source via URL
- Prévisualisation de l'image source
- Variations créatives basées sur l'image

### 3. Options avancées
- **Dimensions** : 512x512, 1024x1024, 1792x1024
- **Styles** : Photoréaliste, Artistique, Illustration, Rendu 3D
- **Qualité** : Standard, Haute, Ultra
- **Formats** : PNG, JPEG, WebP

### 4. Suivi en temps réel
- États de progression détaillés
- Barre de progression visuelle
- Messages informatifs

### 5. Résultats professionnels
- Affichage en grille responsive
- Métadonnées complètes
- Téléchargement direct des images
- Informations techniques

## Workflow utilisateur

```mermaid
graph TD
    A[Dashboard] --> B[Cliquer sur "Générer des images"]
    B --> C[Remplir le formulaire]
    C --> D[Soumettre]
    D --> E[Création du job]
    E --> F[Polling du statut]
    F --> G{Statut?}
    G -->|COMPLETED| H[Afficher les résultats]
    G -->|FAILED| I[Afficher l'erreur]
    G -->|En cours| F
    H --> J[Télécharger les images]
    J --> K[Nouvelle génération]
```

## Intégration backend

L'API communique avec le backend CrewAI via les endpoints :

```bash
# Créer une génération
POST http://localhost:9006/api/images/generate

# Vérifier le statut
GET http://localhost:9006/api/images/status/{job_id}

# Récupérer les résultats
GET http://localhost:9006/api/images/result/{job_id}
```

Configuration dans `.env.local` :
```bash
NEXT_PUBLIC_API_URL=http://localhost:9006
```

## Sécurité

- Routes protégées via Clerk middleware
- Validation des URLs d'images sources
- Gestion des erreurs côté client et serveur
- Timeout de 60 secondes pour éviter les requêtes infinies

## UX/UI

### Design System
- **Palette** : Dégradés purple (#8B5CF6) vers pink (#EC4899)
- **Composants** : Cards blanches avec shadow-md
- **Icons** : Lucide React (Sparkles, ImageIcon, Loader2)
- **Responsive** : Mobile-first avec breakpoints Tailwind

### États visuels
- **Placeholder initial** : Illustration + guide d'utilisation
- **Loading** : Animations de spinner et barre de progression
- **Success** : Grille d'images avec effets au survol
- **Error** : Banner rouge avec icône AlertCircle

### Exemples de prompts
La page inclut 3 exemples pré-remplis :
1. Paysage naturel
2. Art conceptuel cyberpunk
3. Portrait créatif

## Performance

- **Polling intelligent** : Intervalle de 2 secondes
- **Timeout** : Maximum 30 tentatives (60 secondes)
- **Lazy loading** : Images chargées progressivement
- **Optimisation** : Pas de re-render inutile grâce aux hooks

## Tests

### Test manuel rapide
```bash
# 1. Démarrer le backend
cd backend && python main.py

# 2. Démarrer le frontend
npm run dev

# 3. Accéder à http://localhost:3000/generate-images

# 4. Tester avec un prompt simple :
"Un chat astronaute dans l'espace"
```

### Cas de test
1. ✅ Génération simple (texte seul)
2. ✅ Génération multimodale (texte + image)
3. ✅ Plusieurs images (2-4)
4. ✅ Différentes dimensions
5. ✅ Différents styles et qualités
6. ✅ Gestion d'erreur (prompt vide, URL invalide)
7. ✅ Reset et nouvelle génération

## Améliorations futures

### Fonctionnalités
- [ ] Historique des générations
- [ ] Sauvegarde dans la base de données
- [ ] Galerie d'images générées
- [ ] Partage social
- [ ] Édition d'images (crop, resize)
- [ ] Templates de prompts prédéfinis
- [ ] Variations d'une image existante

### Technique
- [ ] Upload d'images locales (au lieu d'URL)
- [ ] Websockets pour notifications en temps réel
- [ ] Cache des résultats
- [ ] Pagination de l'historique
- [ ] Export en batch

## Support

Pour toute question :
- Documentation API : `/docs-webhooks/IMAGE_GENERATION_API.md`
- Code source : `/src/app/generate-images/`
- Issues : [GitHub Issues](https://github.com/Dipomin/sorami/issues)

---

**Version** : 1.0.0  
**Date** : 21 octobre 2025  
**Auteur** : GitHub Copilot
