# Documentation complète - Articles de Blog SEO

## Vue d'ensemble

Cette documentation décrit l'implémentation complète de la fonctionnalité d'articles de blog SEO dans l'application Sorami, suivant la même architecture que les livres.

## Architecture mise en place

### 1. Schéma de base de données (Prisma)

#### Modèles créés

**BlogArticle**
- Informations de base : title, topic, goal
- Contenu SEO : metaDescription, introduction, conclusion, fullContent
- Métriques : seoScore, wordCount, readabilityScore, targetWordCount
- SEO : tags[], mainKeywords[], sections[]
- Statut : status (DRAFT, GENERATING, REVIEW, PUBLISHED)
- Visibilité : visibility (PRIVATE, PUBLIC, UNLISTED)
- Relations : author (User), organization (Organization)

**BlogFormat**
- Formats d'export : MARKDOWN, PDF, EPUB, DOCX, HTML
- Stockage : LOCAL, AWS_S3, etc.
- Relations : blogArticle

**BlogJob**
- Gestion des jobs de génération
- Statuts : PENDING, GENERATING_OUTLINE, WRITING_CHAPTERS, FINALIZING, COMPLETED, FAILED
- Relations : user, organization, blogArticle
- Tracking : progress, currentStep, message

#### Enums ajoutés
- `BlogStatus` : DRAFT, GENERATING, REVIEW, PUBLISHED
- `BlogVisibility` : PRIVATE, PUBLIC, UNLISTED
- `BlogJobType` : BLOG_GENERATION, BLOG_OPTIMIZATION, BLOG_TRANSLATION
- `BlogJobStatus` : PENDING, GENERATING_OUTLINE, WRITING_CHAPTERS, FINALIZING, COMPLETED, FAILED

### 2. Types TypeScript

**`src/types/blog-api.ts`**
```typescript
interface BlogRequest {
  topic: string;
  goal?: string;
  target_word_count?: number;
}

interface BlogArticleResult {
  job_id: string;
  title: string;
  meta_description: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  tags: string[];
  main_keywords: string[];
  seo_score: number;
  word_count: number;
  readability_score: string;
  full_content: string;
  generated_at: string;
  completed_at: string;
}
```

### 3. API Client

**`src/lib/api-blog.ts`**

Fonctions principales :
- `fetchBlogArticles(organizationId?)` - Liste des articles
- `fetchBlogArticleById(id)` - Détail d'un article
- `generateBlogContent(data)` - Démarrer la génération
- `pollBlogJobStatus(jobId)` - Polling du statut
- `fetchBlogJobResult(jobId)` - Résultat final
- `updateBlogArticle(id, data)` - Mise à jour
- `deleteBlogArticle(id)` - Suppression
- `publishBlogArticle(id)` - Publication

### 4. Hooks React

**`src/hooks/useBlogCreation.ts`**
- Gestion de la création d'articles
- États : isLoading, error, jobId
- Méthodes : createBlog, clearError, reset

**`src/hooks/useBlogs.ts`**
- Récupération de la liste des articles
- Auto-refresh
- États : blogs, loading, error
- Méthode : refetch

**`src/hooks/useBlogJob.ts`**
- Polling automatique du statut
- Récupération du résultat
- États : status, result, loading, error
- Méthodes : pollJob, stopPolling

### 5. Composants React

**`src/components/BlogCreationForm.tsx`**
- Formulaire de création
- Validation des champs
- Boutons presets pour nombre de mots (Court, Standard, Long)
- Informations sur ce qui sera généré

**`src/components/BlogList.tsx`**
- Affichage en grille des articles
- Badges de statut colorés
- Score SEO visible
- Métadonnées (mots, date)
- Tags preview

**`src/components/BlogProgress.tsx`**
- Barre de progression animée
- 4 étapes visuelles
- Messages contextuels
- Icônes par statut
- Alertes pour completed/failed

### 6. Pages Next.js

**`/blog/page.tsx`**
- Liste tous les articles
- Bouton "Nouvel article"
- Gestion des erreurs
- Bouton refetch

**`/blog/create/page.tsx`**
- Formulaire de création
- Affichage de la progression
- Affichage du résultat
- Redirection automatique vers /blog

**`/blog/[id]/page.tsx`**
- Détail complet de l'article
- Métriques SEO (4 cartes)
- Affichage structuré : intro, sections, conclusion
- Actions : Éditer, Publier, Supprimer
- Mots-clés et tags

### 7. Routes API

#### Génération
**POST `/api/blog/generate`**
- Input : { topic, goal?, target_word_count? }
- Crée un BlogJob en DB
- Appelle CrewAI backend
- Retourne : { job_id, status, message }

#### Statut du Job
**GET `/api/blog/jobs/[jobId]/status`**
- Récupère le statut depuis CrewAI
- Met à jour le BlogJob en DB
- Retourne : { status, message, progress }

#### Résultat du Job
**GET `/api/blog/jobs/[jobId]/result`**
- Récupère le résultat complet depuis CrewAI
- Retourne : BlogArticleResult

#### Liste des articles
**GET `/api/blog`**
- Query param : organizationId (optionnel)
- Filtre par authorId automatiquement
- Retourne : BlogArticle[]

#### Détail d'un article
**GET `/api/blog/[id]`**
- Récupère un article par ID
- Vérification d'accès (authorId)
- Include author info

**PUT `/api/blog/[id]`**
- Met à jour un article
- Vérification d'accès
- Body : données à mettre à jour

**DELETE `/api/blog/[id]`**
- Supprime un article
- Vérification d'accès
- Cascade sur formats et jobs

### 8. Webhook

**POST `/api/webhooks/blog-completion`**

Fonctionnalités :
- ✅ Vérification du secret (production)
- ✅ Idempotence (Map avec window de 5 min)
- ✅ Logs structurés avec emojis
- ✅ Transaction Prisma atomique
- ✅ Gestion des erreurs complète
- ✅ Performance < 30 secondes

Payload attendu :
```json
{
  "job_id": "uuid",
  "status": "completed",
  "timestamp": "ISO8601",
  "environment": "development",
  "blog_data": {
    "title": "...",
    "meta_description": "...",
    "introduction": "...",
    "sections": [...],
    "conclusion": "...",
    "tags": [...],
    "main_keywords": [...],
    "seo_score": 92.5,
    "word_count": 2487,
    "readability_score": "...",
    "full_content": "..."
  }
}
```

Actions du webhook :
1. Vérifie le secret et l'idempotence
2. Récupère le BlogJob
3. Crée le BlogArticle en transaction
4. Met à jour le BlogJob (status COMPLETED)
5. Retourne success avec article_id

### 9. Middleware

Routes protégées ajoutées :
- `/blog(.*)`

Routes publiques (webhooks) :
- `/api/webhooks/blog-completion`

### 10. Variables d'environnement

```env
CREWAI_API_URL=http://localhost:9006
WEBHOOK_SECRET=your-secret-key
NODE_ENV=development|production
```

## Workflow complet

### Création d'un article

1. **Utilisateur** remplit le formulaire (`/blog/create`)
   - Sujet (requis)
   - Goal (optionnel)
   - Nombre de mots (800-5000)

2. **Frontend** appelle `POST /api/blog/generate`
   - Hook `useBlogCreation` gère l'état
   - Validation des données

3. **API Route** `/api/blog/generate`
   - Vérifie auth (requireAuth)
   - Crée BlogJob en DB
   - Appelle CrewAI backend
   - Retourne job_id

4. **Polling automatique** (hook `useBlogJob`)
   - Appelle `/api/blog/jobs/[jobId]/status` toutes les 2s
   - Met à jour la barre de progression
   - Affiche les messages de statut

5. **Backend CrewAI** génère l'article
   - Étape 1 : Recherche SEO + Plan (BlogOutlineCrew)
   - Étape 2 : Rédaction (WriteBlogArticleCrew)
   - Étape 3 : Optimisation SEO + Scoring

6. **Webhook** `/api/webhooks/blog-completion`
   - Reçoit l'article terminé
   - Crée BlogArticle en DB
   - Met à jour BlogJob

7. **Frontend** détecte la complétion
   - Affiche les métriques
   - Redirection vers `/blog`

### Consultation d'un article

1. Liste : `/blog` affiche tous les articles avec BlogList
2. Clic sur un article → `/blog/[id]`
3. Affichage complet avec métriques SEO
4. Actions : Éditer, Publier, Supprimer

## Points clés de l'implémentation

### Sécurité
- ✅ Authentification Clerk sur toutes les routes
- ✅ Vérification d'accès (authorId)
- ✅ Webhook secret en production
- ✅ Validation des inputs

### Performance
- ✅ Polling optimisé (2s interval)
- ✅ Idempotence webhook (Map)
- ✅ Transactions Prisma
- ✅ Index sur externalJobId

### UX
- ✅ Feedback visuel (progression, états)
- ✅ Gestion d'erreurs complète
- ✅ Redirection automatique
- ✅ Prévisualisation des résultats

### Maintenabilité
- ✅ Architecture cohérente avec books
- ✅ Types TypeScript stricts
- ✅ Séparation client/server
- ✅ Logs structurés

## Différences avec les Livres

1. **Pas de chapitres** : Structure en sections (flat)
2. **Métriques SEO** : seoScore, readabilityScore, tags, keywords
3. **Meta-description** : Optimisée pour le web
4. **Nombre de mots** : Configurable (800-5000)
5. **Visibilité** : PRIVATE, PUBLIC, UNLISTED (vs livres)

## Tests recommandés

### Tests unitaires
- [ ] Hooks (useBlogCreation, useBlogs, useBlogJob)
- [ ] API routes (mocks de Prisma)
- [ ] Webhook (idempotence, transactions)

### Tests d'intégration
- [ ] Workflow complet création → webhook → affichage
- [ ] Gestion d'erreurs (CrewAI down, DB down)
- [ ] Polling (timeout, retry)

### Tests E2E
- [ ] Créer un article via UI
- [ ] Voir la progression
- [ ] Consulter l'article généré
- [ ] Publier/supprimer

## Commandes utiles

```bash
# Générer le client Prisma après modifications schema
npx prisma generate

# Créer une migration
npx prisma migrate dev --name add_blog_models

# Ouvrir Prisma Studio
npx prisma studio

# Tester le webhook localement
curl -X POST http://localhost:3000/api/webhooks/blog-completion \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d @webhook-payload.json
```

## URLs importantes

- Page création : `http://localhost:3000/blog/create`
- Liste articles : `http://localhost:3000/blog`
- Détail article : `http://localhost:3000/blog/[id]`
- API génération : `http://localhost:3000/api/blog/generate`
- Webhook : `http://localhost:3000/api/webhooks/blog-completion`

## Backend CrewAI

L'API backend doit être configurée pour envoyer le webhook à :
```
WEBHOOK_URL=http://localhost:3000/api/webhooks/blog-completion
WEBHOOK_SECRET=your-secret-key
```

## Prochaines étapes possibles

1. **Export formats** : PDF, DOCX, HTML optimisé
2. **Planification** : Scheduler pour publication future
3. **Collaboration** : Commentaires, révisions
4. **Analytics** : Vues, temps de lecture, engagement
5. **SEO avancé** : Schema.org, Open Graph, Twitter Cards
6. **Optimisations** : Images suggérées, liens internes

---

**Version** : 1.0.0  
**Date** : 20 octobre 2025  
**Auteur** : Sorami Development Team
