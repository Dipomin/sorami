# 🎬 Fonctionnalité de Génération de Vidéos - Documentation Complète

## Vue d'ensemble

Cette documentation décrit la fonctionnalité complète de **génération de vidéos cinématographiques** utilisant le modèle **Gemini Veo 2.0** de Google. La fonctionnalité permet aux utilisateurs de créer des vidéos professionnelles de 5 à 8 secondes à partir de descriptions textuelles, avec support optionnel d'images de référence.

---

## 🎯 Fonctionnalités

### Génération de Vidéos
- **Modèle IA**: Gemini Veo 2.0 (Google)
- **Formats supportés**: MP4 Full HD
- **Ratios d'aspect**: 16:9 (1920x1080), 16:10 (1920x1200)
- **Durée**: 5 à 8 secondes par vidéo
- **Nombre de vidéos**: 1 à 4 vidéos par génération
- **Temps de génération**: 30 secondes à 2 minutes
- **Taille moyenne**: ~15 MB par vidéo de 8 secondes

### Options de Personnalisation
- **Description textuelle** (prompt): Description détaillée de la vidéo souhaitée
- **Image de référence** (optionnel): Upload d'image pour guider le style visuel
- **Ratio d'aspect**: Choix entre 16:9 et 16:10
- **Durée**: Sélection de 5 à 8 secondes
- **Nombre de vidéos**: 1 à 4 vidéos simultanées
- **Génération de personnes**: Autoriser ou interdire les personnes dans la vidéo

### Interface Utilisateur
- **Design moderne**: Interface gradient bleu-cyan professionnelle
- **Formulaire intuitif**: Saisie simple avec exemples et suggestions
- **Progression en temps réel**: Barre de progression avec statuts détaillés
- **Aperçu vidéo**: Lecteur vidéo intégré pour visualiser les résultats
- **Métadonnées complètes**: Affichage des informations techniques
- **Téléchargement**: Boutons de téléchargement pour chaque vidéo

---

## 📁 Structure des Fichiers

### Types TypeScript
```
src/types/video-api.ts (109 lignes)
```
**Contenu**: Définitions de types pour l'API vidéo
- `VideoAspectRatio`: Types de ratios d'aspect
- `PersonGeneration`: Options de génération de personnes
- `VideoStatus`: États de génération (pending, processing, generating, downloading, completed, failed)
- `VideoGenerationRequest`: Structure de requête
- `VideoJobResponse`: Réponse initiale de création
- `GeneratedVideo`: Structure d'une vidéo générée
- `VideoGenerationMetadata`: Métadonnées de génération
- `VideoStatusResponse`: Réponse de statut
- `VideoResultResponse`: Réponse de résultat final

### Hooks React
```
src/hooks/useVideoGeneration.ts (73 lignes)
```
**Contenu**: Hook personnalisé pour la génération de vidéos
- **État**: `isGenerating`, `currentStatus`, `result`, `error`, `progress`
- **Fonctions**: `generateVideo()`, `reset()`
- **Polling**: Automatique avec intervalle de 5 secondes (max 40 tentatives)

### Composants UI
```
src/components/VideoGenerationForm.tsx (274 lignes)
```
**Fonctionnalités**:
- Formulaire de saisie avec validation
- Upload d'image avec prévisualisation
- Options avancées repliables (ratios, durée, nombre, personnes)
- Exemples de prompts pré-définis
- Bouton de soumission avec état de chargement

```
src/components/VideoProgress.tsx (140 lignes)
```
**Fonctionnalités**:
- Affichage du statut avec icônes animées
- Barre de progression gradient
- Informations de job (ID, timestamps)
- Messages d'information contextuels
- Gestion des erreurs

```
src/components/VideoResults.tsx (221 lignes)
```
**Fonctionnalités**:
- Grille de vidéos responsive (1 ou 2 colonnes)
- Lecteur vidéo intégré avec contrôles
- Métadonnées détaillées (dimensions, durée, taille, format)
- Boutons de téléchargement individuels
- Affichage du prompt utilisé et de la configuration

### Page Principale
```
src/app/generate-videos/page.tsx (240 lignes)
```
**Structure**:
- Layout 2 colonnes (formulaire à gauche, résultats à droite)
- En-tête avec navigation et informations
- Bannière d'information
- Section d'exemples de prompts professionnels
- États: initial, génération, résultats, erreur

### API Client
```
src/lib/api-client.ts (+120 lignes ajoutées)
```
**Fonctions ajoutées**:
- `createVideoGeneration()`: Créer une génération
- `fetchVideoStatus()`: Récupérer le statut
- `fetchVideoResult()`: Récupérer les résultats
- `pollVideoGenerationStatus()`: Polling automatique

### Webhook Backend
```
src/app/api/webhooks/video-completion/route.ts (232 lignes)
```
**Fonctionnalités**:
- Réception des webhooks du backend CrewAI
- Validation du secret en production
- Idempotence avec cache de 5 minutes
- Gestion des statuts (completed, failed, intermédiaires)
- Logs structurés avec emojis
- Endpoint GET pour vérifier la santé

### Middleware
```
middleware.ts (+2 lignes modifiées)
```
**Modifications**:
- Ajout de `/generate-videos(.*)` aux routes protégées
- Ajout de `/api/webhooks/video-completion` aux routes publiques

### Dashboard
```
src/app/dashboard/page.tsx (+30 lignes ajoutées)
```
**Ajout**:
- Nouvelle carte "Générer des vidéos" avec gradient bleu-cyan
- Icône vidéo avec SVG
- Lien vers `/generate-videos`

---

## 🔧 Configuration Requise

### Backend (Python)
```bash
# Installation
pip install google-genai

# Variables d'environnement (.env)
GEMINI_API_KEY=votre_cle_api_google_gemini
GOOGLE_API_KEY=votre_cle_api_google  # Alternative

# Webhooks (optionnel)
WEBHOOK_URL_VIDEO=http://localhost:3000/api/webhooks/video-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

### Frontend (Next.js)
```bash
# Variables d'environnement (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:9006
WEBHOOK_SECRET=sorami-webhook-secret-key-2025  # Production uniquement
```

---

## 🚀 Utilisation

### 1. Démarrer les Services

**Backend**:
```bash
cd backend
python main.py
# Serveur sur http://localhost:9006
```

**Frontend**:
```bash
cd front
npm run dev
# Serveur sur http://localhost:3000
```

### 2. Accéder à l'Interface

Visitez: `http://localhost:3000/generate-videos`

Ou depuis le dashboard: Cliquer sur la carte "Générer des vidéos"

### 3. Générer une Vidéo

1. **Saisir une description**: Description détaillée et cinématographique
2. **Uploader une image** (optionnel): Image de référence pour le style
3. **Configurer les options**: Ratio, durée, nombre de vidéos
4. **Cliquer sur "Générer la vidéo"**
5. **Attendre**: 30 secondes à 2 minutes
6. **Télécharger**: Vidéos disponibles en téléchargement

---

## 📊 Flux de Données

### Génération de Vidéo
```
1. Utilisateur → Formulaire (VideoGenerationForm)
2. Hook (useVideoGeneration) → API Client (createVideoGeneration)
3. API Client → Backend CrewAI (POST /api/videos/generate)
4. Backend → Job créé (job_id retourné)
5. Polling (pollVideoGenerationStatus) → Backend (GET /api/videos/status/{job_id})
6. Backend → Statuts intermédiaires (pending → processing → generating → downloading)
7. Backend → Génération terminée (completed)
8. API Client → Récupération résultats (GET /api/videos/result/{job_id})
9. Composant → Affichage vidéos (VideoResults)
```

### Webhook (Optionnel)
```
1. Backend → Webhook envoyé (POST /api/webhooks/video-completion)
2. Frontend → Validation secret + payload
3. Frontend → Traitement idempotent
4. Frontend → TODO: Sauvegarde Prisma
5. Frontend → Réponse 200 OK
```

---

## 🎨 Exemples de Prompts

### Paysages Naturels
```
"Un lever de soleil cinématographique sur l'océan Pacifique, avec des vagues douces 
s'écrasant sur la plage, des mouettes volant dans le ciel orange et rose, mouvement 
de caméra fluide de gauche à droite, ambiance paisible et sereine"
```

### Science-Fiction
```
"Un chat astronaute flottant dans l'espace profond avec des étoiles scintillantes 
et une nébuleuse colorée en arrière-plan, mouvement lent et gracieux, éclairage 
spatial dramatique, style cinématographique futuriste"
```

### Nature Sauvage
```
"Une cascade majestueuse dans une forêt tropicale luxuriante, avec des oiseaux 
colorés volant entre les arbres, rayon de soleil perçant à travers la canopée, 
mouvement de caméra vertical ascendant, ambiance mystique et verdoyante"
```

### Détente Tropicale
```
"Un coucher de soleil vibrant sur une plage tropicale avec des palmiers se balançant 
doucement dans la brise, vagues calmes léchant le sable blanc, mouvement panoramique 
lent de droite à gauche, couleurs chaudes et dorées"
```

---

## 🧪 Tests

### Script de Test Automatisé
```bash
# Exécuter le script de test complet
./test-video-generation.sh

# Tests effectués:
# 1. Vérification de la santé de l'API
# 2. Création d'une génération de vidéo
# 3. Polling du statut (max 3 minutes)
# 4. Récupération des résultats
# 5. Vérification du webhook frontend
```

### Test Manuel
1. Démarrer backend et frontend
2. Visiter `/generate-videos`
3. Remplir le formulaire avec un prompt simple
4. Vérifier la progression en temps réel
5. Télécharger la vidéo générée

---

## 📝 TODO / Améliorations Futures

### Base de Données
- [ ] Créer modèle Prisma `VideoGeneration` avec relations User/Organization
- [ ] Implémenter la sauvegarde des vidéos dans Prisma
- [ ] Ajouter une page `/videos` pour lister toutes les vidéos générées
- [ ] Implémenter la pagination et le filtrage

### Fonctionnalités
- [ ] Support du stockage cloud (S3) pour les vidéos
- [ ] Génération de miniatures automatiques
- [ ] Partage de vidéos avec liens publics
- [ ] Export en différents formats (WebM, GIF)
- [ ] Éditeur de vidéo basique (trim, ajout de texte)

### Optimisations
- [ ] Cache des vidéos générées
- [ ] Compression automatique des vidéos
- [ ] Preview en basse qualité pendant la génération
- [ ] Retry automatique en cas d'échec

### UX/UI
- [ ] Historique des prompts utilisés
- [ ] Favoris et collections de vidéos
- [ ] Suggestions de prompts basées sur l'IA
- [ ] Mode sombre pour la page

---

## 🐛 Dépannage

### Erreur: "Module de génération de vidéos non disponible"
**Solution**: Installer `google-genai` dans le backend
```bash
pip install google-genai
```

### Erreur: "Clé API non configurée"
**Solution**: Ajouter `GEMINI_API_KEY` dans `.env` du backend
```bash
GEMINI_API_KEY=votre_cle_api
```

### Timeout lors de la génération
**Cause**: La génération peut prendre jusqu'à 2 minutes
**Solution**: Augmenter `maxAttempts` dans le polling (actuellement 40)

### Vidéo non téléchargeable
**Cause**: Endpoint proxy `/api/videos/download` non implémenté
**Solution**: Implémenter l'endpoint proxy ou utiliser `file_url` directement

### Webhook 404
**Cause**: Webhook URL incorrecte dans le backend
**Solution**: Vérifier `WEBHOOK_URL_VIDEO` dans `.env` du backend
```bash
WEBHOOK_URL_VIDEO=http://localhost:3000/api/webhooks/video-completion
```

---

## 📚 Références

- [Documentation API Backend](/docs-webhooks/VIDEO_GENERATION_API.md)
- [Gemini Veo 2.0 Documentation](https://ai.google.dev/gemini-api/docs/video)
- [Architecture Copilot Instructions](/.github/copilot-instructions.md)

---

**🎬 Génération de vidéos opérationnelle!**

*Dernière mise à jour: 22 octobre 2025*
