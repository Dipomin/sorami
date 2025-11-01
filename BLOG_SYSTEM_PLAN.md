# 📝 Plan d'Implémentation Complet - Système de Blog Sorami

## 🎯 Objectif

Créer un système de blog complet, moderne et sécurisé pour Sorami avec :
- Dashboard admin pour créer et gérer les articles
- Pages publiques pour afficher les articles
- Système de catégories et tags
- Optimisation SEO
- Gestion des commentaires
- Analytics basiques

## ✅ Déjà Fait

- ✅ Modèles Prisma créés (BlogPost, BlogComment, BlogCategory)
- ✅ Relations avec User configurées
- ✅ Base de données synchronisée
- ✅ Enums BlogPostStatus et CommentStatus

## 📋 Étapes d'Implémentation

### Phase 1 : API Backend (2-3h)

#### 1.1 API Articles (`/api/blog/posts`)
**Fichier** : `src/app/api/blog/posts/route.ts`

**Endpoints** :
```typescript
GET    /api/blog/posts           // Liste des articles (publics + admin)
POST   /api/blog/posts           // Créer un article (admin)
PUT    /api/blog/posts/[id]      // Mettre à jour (admin)
DELETE /api/blog/posts/[id]      // Supprimer (admin)
GET    /api/blog/posts/[slug]    // Récupérer par slug
```

**Fonctionnalités** :
- Filtrage par status, catégorie, auteur
- Pagination (10 articles par page)
- Recherche par titre/contenu
- Tri par date, vues, etc.
- Incrémentation automatique des vues
- Calcul du temps de lecture

#### 1.2 API Catégories (`/api/blog/categories`)
**Fichier** : `src/app/api/blog/categories/route.ts`

**Endpoints** :
```typescript
GET    /api/blog/categories      // Liste des catégories
POST   /api/blog/categories      // Créer (admin)
PUT    /api/blog/categories/[id] // Modifier (admin)
DELETE /api/blog/categories/[id] // Supprimer (admin)
```

#### 1.3 API Commentaires (`/api/blog/comments`)
**Fichier** : `src/app/api/blog/comments/route.ts`

**Endpoints** :
```typescript
GET    /api/blog/comments?postId=xxx  // Commentaires d'un article
POST   /api/blog/comments             // Ajouter un commentaire
PUT    /api/blog/comments/[id]        // Modérer (admin)
DELETE /api/blog/comments/[id]        // Supprimer (admin/auteur)
```

#### 1.4 API Upload Images (`/api/blog/upload`)
**Fichier** : `src/app/api/blog/upload/route.ts`

- Upload vers AWS S3 dans le bucket `sorami-generated-content-9872`
- Dossier : `blog/images/`
- Retourner l'URL publique
- Compression automatique avec Sharp

### Phase 2 : Dashboard Admin (3-4h)

#### 2.1 Layout Admin Blog
**Fichier** : `src/app/admin/blog/layout.tsx`

- Sidebar avec navigation :
  - 📄 Tous les articles
  - ➕ Nouvel article
  - 📂 Catégories
  - 💬 Commentaires
  - 📊 Statistiques

#### 2.2 Liste des Articles
**Fichier** : `src/app/admin/blog/page.tsx`

- Tableau avec : Titre, Statut, Catégorie, Auteur, Date, Vues, Actions
- Filtres : Statut, Catégorie, Auteur
- Recherche
- Actions : Modifier, Voir, Supprimer
- Pagination

#### 2.3 Éditeur d'Articles
**Fichier** : `src/app/admin/blog/editor/[[...id]]/page.tsx`

**Composants** :
```typescript
interface ArticleForm {
  title: string;
  slug: string; // Auto-généré depuis le titre
  excerpt: string;
  content: string; // Markdown
  coverImage: string; // URL
  category: string;
  tags: string[]; // Array
  status: BlogPostStatus;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}
```

**Éditeur Markdown** :
- Utiliser `@uiw/react-md-editor` (simple et efficace)
- Preview en temps réel
- Toolbar avec : Gras, Italic, Lien, Image, Code, etc.
- Upload d'images par drag & drop

**Champs SEO** :
- Meta title (60 caractères max)
- Meta description (160 caractères max)
- Meta keywords
- Aperçu Google

**Actions** :
- Sauvegarder en brouillon
- Publier
- Programmer
- Prévisualiser

#### 2.4 Gestion des Catégories
**Fichier** : `src/app/admin/blog/categories/page.tsx`

- Liste des catégories
- Créer/Modifier/Supprimer
- Champs : Nom, Slug, Description, Icône, Couleur
- Compteur d'articles par catégorie

#### 2.5 Mod

ération Commentaires
**Fichier** : `src/app/admin/blog/comments/page.tsx`

- Liste des commentaires avec filtres (Pending, Approved, Rejected)
- Actions : Approuver, Rejeter, Supprimer
- Voir l'article associé

#### 2.6 Statistiques
**Fichier** : `src/app/admin/blog/stats/page.tsx`

- Total d'articles (par statut)
- Total de commentaires (par statut)
- Articles les plus vus
- Catégories populaires
- Graphique des publications (par mois)

### Phase 3 : Pages Publiques (2-3h)

#### 3.1 Liste des Articles
**Fichier** : `src/app/blog/page.tsx`

**Layout** :
```
┌────────────────────────────────────────┐
│  🎨 Hero: "Blog Sorami"               │
├─────────┬──────────────────────────────┤
│ Sidebar │  Grid d'Articles (2-3 cols) │
│         │  ┌─────┬─────┬─────┐        │
│ 📂 Cat  │  │ Art │ Art │ Art │        │
│ 🔥 Pop  │  ├─────┼─────┼─────┤        │
│ 🏷️ Tags │  │ Art │ Art │ Art │        │
│         │  └─────┴─────┴─────┘        │
│         │  [Pagination]                │
└─────────┴──────────────────────────────┘
```

**Fonctionnalités** :
- 12 articles par page
- Filtrage par catégorie via URL : `/blog?category=tutorials`
- Recherche (optionnel)
- Tri : Plus récent, Plus vu

**Article Card** :
- Image de couverture
- Titre
- Excerpt (150 caractères)
- Catégorie (badge coloré)
- Auteur (nom + avatar)
- Date de publication
- Temps de lecture
- Nombre de vues
- Bouton "Lire la suite"

#### 3.2 Article Détaillé
**Fichier** : `src/app/blog/[slug]/page.tsx`

**Structure** :
```markdown
┌────────────────────────────────────────┐
│  Image de Couverture                   │
├────────────────────────────────────────┤
│  Titre                                 │
│  Auteur | Date | Temps lecture | Vues  │
├────────────────────────────────────────┤
│  Contenu Markdown                      │
│  (Styled avec Tailwind Typography)     │
├────────────────────────────────────────┤
│  Tags : #tag1 #tag2                    │
├────────────────────────────────────────┤
│  Partage Social                        │
│  [Twitter] [LinkedIn] [Facebook] [Copier]│
├────────────────────────────────────────┤
│  Articles Similaires (3 max)          │
├────────────────────────────────────────┤
│  Section Commentaires                  │
│  - Formulaire (si connecté)           │
│  - Liste des commentaires              │
└────────────────────────────────────────┘
```

**SEO** :
- Meta tags dynamiques (title, description, keywords)
- Open Graph (og:image, og:title, og:description)
- Twitter Cards
- JSON-LD Schema.org (Article)
- Canonical URL

**Partage Social** :
```typescript
const shareUrls = {
  twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
};
```

#### 3.3 Catégories
**Fichier** : `src/app/blog/category/[slug]/page.tsx`

- Liste des articles de la catégorie
- Utiliser le même layout que `/blog/page.tsx`
- Titre : "Articles dans {categoryName}"

### Phase 4 : Composants Réutilisables

#### 4.1 ArticleCard
**Fichier** : `src/components/blog/ArticleCard.tsx`

#### 4.2 CommentList
**Fichier** : `src/components/blog/CommentList.tsx`

#### 4.3 CommentForm
**Fichier** : `src/components/blog/CommentForm.tsx`

#### 4.4 CategoryBadge
**Fichier** : `src/components/blog/CategoryBadge.tsx`

#### 4.5 SocialShare
**Fichier** : `src/components/blog/SocialShare.tsx`

## 🔒 Sécurité et Permissions

### Middleware Protection
**Fichier** : `middleware.ts`

Ajouter les routes admin :
```typescript
const adminRoutes = [
  '/admin/blog',
];

// Vérifier que l'utilisateur a le rôle ADMIN
if (adminRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
  // Check if user.role === 'ADMIN'
}
```

### Helper Auth Admin
**Fichier** : `src/lib/auth-admin.ts`

```typescript
export async function requireAdmin() {
  const user = await requireAuth();
  
  // Récupérer le user complet depuis Prisma
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.userId },
    select: { role: true },
  });
  
  if (dbUser?.role !== 'ADMIN') {
    throw new Error('Accès non autorisé');
  }
  
  return dbUser;
}
```

## 📦 Dépendances à Installer

```bash
npm install @uiw/react-md-editor         # Éditeur Markdown
npm install sharp                        # Compression d'images
npm install slugify                      # Génération de slugs
npm install reading-time                 # Calcul temps de lecture
npm install date-fns                     # Formatage de dates
```

## 🎨 Design System

### Couleurs des Catégories
```typescript
const categoryColors = {
  tutorials: 'blue',
  news: 'green',
  tips: 'yellow',
  case-studies: 'purple',
  updates: 'pink',
};
```

### Icônes
- Utiliser Lucide React (déjà installé)
- Icônes par catégorie personnalisables

## 🚀 Ordre d'Implémentation Recommandé

### Jour 1 : Backend (4h)
1. ✅ Créer `/api/blog/posts` (1.5h)
2. ✅ Créer `/api/blog/categories` (0.5h)
3. ✅ Créer `/api/blog/comments` (1h)
4. ✅ Créer `/api/blog/upload` (1h)

### Jour 2 : Dashboard Admin (5h)
1. ✅ Layout et navigation (1h)
2. ✅ Liste des articles (1h)
3. ✅ Éditeur d'articles (2h)
4. ✅ Gestion catégories et commentaires (1h)

### Jour 3 : Pages Publiques (4h)
1. ✅ Page liste `/blog` (1.5h)
2. ✅ Page article `/blog/[slug]` (2h)
3. ✅ Composants réutilisables (0.5h)

### Jour 4 : Polish et Tests (3h)
1. ✅ SEO et métadonnées (1h)
2. ✅ Tests manuels (1h)
3. ✅ Corrections et optimisations (1h)

**Total estimé : 16h de développement**

## 📊 Métriques de Succès

- ✅ Créer un article en < 5 minutes
- ✅ Temps de chargement page < 2s
- ✅ Score SEO Lighthouse > 90
- ✅ Responsive sur tous les appareils
- ✅ Zéro erreur console

## 🔮 Fonctionnalités Futures (V2)

- Éditeur WYSIWYG avancé (TipTap)
- Versionning des articles
- Révisions et historique
- Brouillons collaboratifs
- Newsletter automatique
- RSS Feed
- Recherche full-text (Algolia)
- Analytics avancés (Google Analytics)
- Système de likes
- Bookmarks/favoris
- Export PDF
- Mode sombre/clair
- Multi-langue

## 📝 Scripts Utiles

### Créer des Catégories par Défaut
```typescript
// scripts/init-blog-categories.ts
const categories = [
  { name: 'Tutoriels', slug: 'tutorials', icon: '📚', color: '#3B82F6' },
  { name: 'Actualités', slug: 'news', icon: '📰', color: '#10B981' },
  { name: 'Astuces', slug: 'tips', icon: '💡', color: '#F59E0B' },
  { name: 'Études de Cas', slug: 'case-studies', icon: '📊', color: '#8B5CF6' },
  { name: 'Mises à Jour', slug: 'updates', icon: '🚀', color: '#EC4899' },
];
```

### Générer un Article de Demo
```typescript
// scripts/create-demo-post.ts
const demoPost = {
  title: 'Comment utiliser Sorami pour créer du contenu IA',
  slug: 'comment-utiliser-sorami',
  excerpt: 'Découvrez toutes les fonctionnalités de Sorami...',
  content: `# Introduction\n\nSorami est une plateforme...`,
  category: 'tutorials',
  tags: ['tutorial', 'getting-started', 'ai'],
  status: 'PUBLISHED',
};
```

## ✅ Checklist Finale

Avant de considérer le système complet :

### Backend
- [ ] Toutes les API routes fonctionnent
- [ ] Validation des données côté serveur
- [ ] Gestion des erreurs
- [ ] Permissions admin vérifiées
- [ ] Upload d'images fonctionne

### Dashboard
- [ ] Créer un article
- [ ] Modifier un article
- [ ] Supprimer un article
- [ ] Gérer les catégories
- [ ] Modérer les commentaires
- [ ] Voir les statistiques

### Pages Publiques
- [ ] Liste des articles s'affiche
- [ ] Article individuel s'affiche
- [ ] Commentaires fonctionnent
- [ ] Partage social fonctionne
- [ ] SEO configuré

### Tests
- [ ] Test sur mobile
- [ ] Test sur tablette
- [ ] Test sur desktop
- [ ] Test différents navigateurs
- [ ] Test avec/sans images

### Déploiement
- [ ] Build sans erreurs
- [ ] Deploy sur VPS
- [ ] Tester en production
- [ ] Vérifier les performances

---

**Date de création** : 1er novembre 2025  
**Estimé** : 16h de développement  
**Priorité** : Haute  
**Status** : 📋 Planifié
