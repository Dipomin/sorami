# 🌟 Sorami Platform - AI Content Generation SaaS

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-ff69b4?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat-square)](https://clerk.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

> **Plateforme SaaS multi-tenant** de génération de contenu IA : images, vidéos, articles de blog et livres complets.

---

## ✨ Fonctionnalités Principales

### 🎨 **Génération d'Images**
- Génération d'images via IA (Gemini/DALL-E)
- Styles personnalisables (photorealistic, artistic, etc.)
- Multiples résolutions (256x256 → 1024x1024)
- Stockage AWS S3 avec URLs signées

### 🎥 **Génération de Vidéos**
- Création de vidéos à partir de prompts textuels
- Choix de durée et résolution
- Audio background optionnel
- Player intégré avec controls

### 📝 **Articles de Blog**
- Génération d'articles SEO-optimisés
- Contrôle du nombre de mots (800-5000)
- Tracking de progression en temps réel
- Structuration automatique (titre, sections, conclusion)

### 📚 **Livres Complets**
- Génération de livres avec chapitres structurés
- Table des matières interactive
- Reader immersif avec navigation
- Export multi-formats (PDF, EPUB, DOCX)

---

## 🎨 Design System

### Thème Dark Moderne
- **Primary** : Violet (#8b5cf6)
- **Accent** : Indigo (#6366f1)
- **Background** : Navy (#0f172a → #020617)
- **Glassmorphism** : backdrop-blur-sm avec transparence

### Animations Fluides
- **Framer Motion** : Animations professionnelles (stagger, parallax, morphing)
- **Micro-interactions** : Hover effects, loading states, transitions
- **Performance** : GPU-accelerated avec transform
- **Accessibility** : Support reduced motion

### Responsive Design
- **Mobile-first** : Tailwind CSS breakpoints (sm, md, lg, xl, 2xl)
- **Touch-friendly** : Boutons 44x44px minimum
- **Adaptive layouts** : Grids 1/2/3/4 colonnes selon device

---

## 🚀 Quick Start

### Prérequis
- Node.js 18+ et npm
- Base de données MySQL
- Compte Clerk (authentification)
- Compte AWS S3 (stockage fichiers)
- Backends IA (CrewAI + Flask) sur port 9006

### Installation

```bash
# Cloner le repository
git clone https://github.com/Dipomin/sorami.git
cd sorami/front

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés (voir section Configuration)

# Générer le client Prisma
npx prisma generate

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Configuration

Créer un fichier `.env.local` avec :

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend APIs
CREWAI_API_URL=http://localhost:9006
NEXT_PUBLIC_API_URL=http://localhost:9006

# Webhooks
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks
WEBHOOK_SECRET=your-secret-key-here

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1

# Database (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/sorami"
```

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement (port 3000)
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # ESLint check
npm run type-check   # TypeScript check (si configuré)
npx prisma studio    # Interface admin base de données
npx prisma generate  # Générer le client Prisma après modification schema
```

---

## 📁 Structure du Projet

```
sorami/front/
├── src/
│   ├── app/                          # Pages Next.js 15 (App Router)
│   │   ├── page.tsx                  # Landing page
│   │   ├── dashboard/                # Dashboard et stats
│   │   ├── generation-images/        # Génération d'images
│   │   ├── generation-videos/        # Génération de vidéos
│   │   ├── blog/                     # Système de blog (listing, detail, create)
│   │   ├── books/                    # Système de livres (listing, reader)
│   │   ├── profile/                  # Profil utilisateur
│   │   ├── settings/                 # Paramètres
│   │   ├── privacy/                  # Page confidentialité
│   │   ├── terms/                    # CGU
│   │   ├── mentions-legales/         # Mentions légales
│   │   └── api/                      # API routes
│   │       ├── blog/                 # Blog endpoints
│   │       ├── images/               # Images endpoints
│   │       ├── videos/               # Videos endpoints
│   │       ├── books/                # Books endpoints
│   │       └── webhooks/             # Webhooks (completions)
│   ├── components/                   # Composants React
│   │   ├── ui/                       # UI primitives (Button, Card, Skeleton)
│   │   ├── animations/               # Animation wrappers
│   │   ├── dashboard/                # DashboardLayout
│   │   ├── BlogCreationForm.tsx      # Formulaire blog
│   │   └── BlogProgress.tsx          # Progress tracker
│   ├── hooks/                        # Custom hooks
│   │   ├── useBlogs.ts               # Hook blogs
│   │   ├── useImageGeneration.ts     # Hook images
│   │   ├── useVideoGeneration.ts     # Hook vidéos
│   │   ├── useBooks.ts               # Hook books
│   │   ├── useParallax.ts            # Hook parallax
│   │   └── useAnimations.ts          # Hook animations
│   ├── lib/                          # Utilities et configurations
│   │   ├── api-client.ts             # API client-side
│   │   ├── api-server.ts             # API server-side
│   │   ├── auth.ts                   # Helpers auth (requireAuth)
│   │   ├── prisma.ts                 # Prisma client
│   │   ├── s3-storage.ts             # AWS S3 helper
│   │   └── utils.ts                  # Utilities (cn function)
│   └── types/                        # TypeScript types
│       ├── book-api.ts               # Types API books
│       ├── blog-api.ts               # Types API blog
│       ├── image-api.ts              # Types API images
│       └── video-api.ts              # Types API vidéos
├── prisma/
│   └── schema.prisma                 # Prisma schema (MySQL)
├── public/                           # Assets statiques
├── docs/                             # Documentation complète (7 guides)
│   ├── README_INDEX.md               # Index de la documentation
│   ├── FINAL_RECAP_UI_TRANSFORMATION.md
│   ├── API_INTEGRATION_REPORT.md
│   ├── MOBILE_RESPONSIVE_GUIDE.md
│   ├── ADVANCED_ANIMATIONS_GUIDE.md
│   └── TESTING_GUIDE.md
├── middleware.ts                     # Middleware Clerk (protection routes)
├── tailwind.config.js                # Configuration Tailwind CSS
├── next.config.js                    # Configuration Next.js
├── tsconfig.json                     # Configuration TypeScript
├── CHANGELOG.md                      # Historique des changements
├── package.json                      # Dépendances npm
└── README.md                         # Ce fichier
```

---

## 🏗️ Architecture

### Frontend (Next.js 15)
- **App Router** : Routing moderne avec layouts imbriqués
- **Server Components** : SSR par défaut pour performance
- **Client Components** : Interactivité avec "use client"
- **API Routes** : Endpoints sécurisés avec Clerk auth

### Backend IA
- **CrewAI** (Python) : Génération de contenu textuel (blog, books)
- **Flask** (Python) : Génération d'images et vidéos
- **Webhooks** : Callbacks asynchrones pour notifier completions

### Base de Données
- **Prisma ORM** : Type-safe database access
- **MySQL** : Stockage relationnel avec multi-tenancy
- **Relations** : Users, Organizations, Books, Blogs, Images, Videos

### Stockage
- **AWS S3** : Stockage sécurisé des fichiers générés
- **Presigned URLs** : Accès temporaire sécurisé

---

## 🔐 Authentification & Sécurité

### Clerk Integration
- **Sign In/Sign Up** : Modals customisées dark theme
- **Middleware** : Protection automatique des routes
- **JWT Tokens** : Envoyés aux backends IA
- **Multi-organization** : Support des équipes

### API Security
- **requireAuth()** : Vérification côté serveur
- **CORS** : Configuration stricte
- **Webhooks** : Validation via secret partagé
- **Rate Limiting** : À implémenter (recommandé)

---

## 📊 Features Techniques

### Performance
- ✅ **Next.js Image** : Optimisation automatique des images
- ✅ **Code Splitting** : Chargement par page
- ✅ **Lazy Loading** : Composants à la demande
- ✅ **GPU Animations** : Transform au lieu de position
- ✅ **Caching** : Headers appropriés sur assets

### Accessibility
- ✅ **Semantic HTML** : Structure correcte (nav, main, footer)
- ✅ **ARIA Labels** : Support screen readers
- ✅ **Keyboard Navigation** : Tab order logique
- ✅ **Reduced Motion** : Respect préférence utilisateur
- ✅ **Contrast Ratios** : WCAG AA compliant

### SEO
- ✅ **Metadata API** : Titres et descriptions dynamiques
- ✅ **Sitemap** : Génération automatique (à configurer)
- ✅ **Robots.txt** : Configuration crawlers
- ✅ **Structured Data** : JSON-LD pour rich snippets

---

## 📚 Documentation

### Guides Disponibles (dans `/docs`)
1. **[Index Général](./docs/README_INDEX.md)** - Navigation complète
2. **[Récapitulatif Final](./docs/FINAL_RECAP_UI_TRANSFORMATION.md)** - Vue d'ensemble de la transformation UI
3. **[API Integration](./docs/API_INTEGRATION_REPORT.md)** - Hooks, routes, webhooks
4. **[Responsive Design](./docs/MOBILE_RESPONSIVE_GUIDE.md)** - Patterns mobile-first
5. **[Animations Avancées](./docs/ADVANCED_ANIMATIONS_GUIDE.md)** - Framer Motion best practices
6. **[Guide de Tests](./docs/TESTING_GUIDE.md)** - Checklist complète de tests
7. **[CHANGELOG](./CHANGELOG.md)** - Historique des versions

### Code Examples

#### Créer un article de blog
```typescript
import { useBlogCreation } from '@/hooks/useBlogCreation';

function BlogForm() {
  const { createBlog, isLoading, error } = useBlogCreation();

  const handleSubmit = async (data: BlogRequest) => {
    try {
      const result = await createBlog(data);
      console.log('Job ID:', result.job_id);
    } catch (err) {
      console.error(err);
    }
  };
}
```

#### Générer une image
```typescript
import { useImageGeneration } from '@/hooks/useImageGeneration';

function ImageGenerator() {
  const { generateImage, isGenerating, progress } = useImageGeneration();

  const handleGenerate = async () => {
    try {
      const result = await generateImage({
        prompt: 'Sunset on the beach',
        size: '1024x1024',
        style: 'photorealistic',
      });
      console.log('Image URL:', result.images[0].url);
    } catch (err) {
      console.error(err);
    }
  };
}
```

---

## 🧪 Tests

### Tests Manuels
Voir [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) pour la checklist complète (120+ points).

### Tests Automatisés (À implémenter)
```bash
# Tests unitaires (Jest + React Testing Library)
npm run test

# Tests E2E (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Production
vercel --prod
```

### Variables d'Environnement
Configurer toutes les variables dans Vercel Dashboard :
- Clerk keys
- AWS S3 credentials
- Database URL
- Webhook secret
- Backend URLs

### Build Production
```bash
npm run build
npm run start
```

---

## 🤝 Contribution

### Workflow Git
```bash
# Créer une branche feature
git checkout -b feature/my-feature

# Commit avec message descriptif
git commit -m "feat: add new feature"

# Push et créer PR
git push origin feature/my-feature
```

### Conventions
- **Commits** : Conventional Commits (feat, fix, docs, style, refactor, test, chore)
- **TypeScript** : Typage strict activé
- **ESLint** : 0 errors avant commit
- **Prettier** : Format automatique (si configuré)

---

## 📝 Roadmap

### Version 1.1 (Q1 2026)
- [ ] Tests automatisés (Jest + Playwright)
- [ ] Monitoring (Sentry pour errors)
- [ ] Analytics (Google Analytics / Plausible)
- [ ] Performance optimizations (SWR cache)

### Version 1.2 (Q2 2026)
- [ ] Light theme toggle
- [ ] Multi-langue (i18n)
- [ ] Export batch (PDF, EPUB, DOCX)
- [ ] Real-time collaboration

### Version 2.0 (Q3 2026)
- [ ] Mobile apps (React Native)
- [ ] API publique (REST + GraphQL)
- [ ] Marketplace de templates
- [ ] AI fine-tuning personnalisé

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache Next.js
rm -rf .next

# Réinstaller dépendances
rm -rf node_modules
npm install

# Régénérer Prisma client
npx prisma generate
```

### Runtime Errors

**Clerk Auth Errors**
- Vérifier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`
- Vérifier les redirects URLs dans Clerk Dashboard

**API Call Errors**
- Vérifier `CREWAI_API_URL` et `NEXT_PUBLIC_API_URL`
- S'assurer que les backends IA sont running sur port 9006
- Vérifier les CORS headers

**S3 Upload Errors**
- Vérifier credentials AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Vérifier bucket name et région
- Vérifier les permissions IAM

**Database Errors**
- Vérifier `DATABASE_URL` format MySQL
- S'assurer que MySQL est running
- Run `npx prisma db push` pour synchroniser schema

---

## 📄 License

Ce projet est la propriété de **Sorami Platform**.  
Tous droits réservés © 2025 Sorami.

---

## 👥 Équipe

- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend IA** : CrewAI + Flask (Python)
- **Design** : Dark theme moderne avec Framer Motion
- **Auth** : Clerk
- **Database** : Prisma + MySQL
- **Storage** : AWS S3

---

## 📞 Support

- **Documentation** : [/docs](./docs/)
- **Issues** : [GitHub Issues](https://github.com/Dipomin/sorami/issues)
- **Email** : support@sorami.com

---

## 🎉 Remerciements

- **Next.js Team** - Framework exceptionnel
- **Vercel** - Hébergement et tooling
- **Clerk** - Authentification simple et sécurisée
- **Framer** - Librairie d'animations professionnelle
- **Tailwind Labs** - CSS utility-first

---

**Status** : ✅ Production Ready  
**Version** : 1.0.0  
**Dernière mise à jour** : 23 octobre 2025

---

<div align="center">

**Créé avec ❤️ par l'équipe Sorami**

[🌐 Website](https://sorami.com) • [📚 Documentation](./docs/README_INDEX.md) • [🐦 Twitter](https://twitter.com/sorami)

</div>
