# 🌟 Sorami - Plateforme de Création de Contenu IA

<div align="center">

![Sorami Logo](https://via.placeholder.com/200x100?text=SORAMI)

**Créez. Imaginez. Innovez avec l'IA.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

[Documentation](#-documentation) • [Déploiement](#-déploiement) • [Support](#-support)

</div>

---

## 🎯 Vue d'ensemble

Sorami est une plateforme SaaS multi-tenant pour la génération de contenu avec l'intelligence artificielle. Créez des images, vidéos, articles de blog et ebooks grâce à des modèles IA de pointe.

### ✨ Fonctionnalités principales

- 🎨 **Génération d'images** - Créez des visuels époustouflants avec l'IA
- 🎬 **Génération de vidéos** - Transformez vos idées en vidéos captivantes
- 📝 **Articles de blog** - Rédigez des articles optimisés SEO en un clic
- 📚 **Création d'ebooks** - Générez des livres numériques complets
- 💳 **Système de crédits** - Gestion flexible des abonnements
- 🔐 **Authentification Clerk** - SSO et gestion multi-organisation
- 💰 **Paiements Paystack** - Intégration complète des paiements
- ☁️ **Stockage AWS S3** - Stockage sécurisé et scalable

## 🏗️ Architecture technique

### Stack principal

```
Frontend (ce repo)
├── Next.js 15 (App Router)
├── TypeScript
├── Tailwind CSS + Framer Motion
├── Prisma ORM (MySQL)
├── Clerk Auth
├── AWS S3 SDK
└── Paystack Integration

Backend (api.sorami.app)
└── CrewAI + FastAPI
```

### Architecture système

```
┌──────────────────────────────────────────┐
│            Cloudflare / CDN              │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────┐              ┌─────────┐
│ Frontend│              │ Backend │
│ Next.js │◄────────────►│ CrewAI  │
│  (VPS)  │   Webhooks   │   API   │
└────┬────┘              └─────────┘
     │
     ├──────► MySQL (Base de données)
     ├──────► AWS S3 (Stockage)
     ├──────► Clerk (Auth)
     └──────► Paystack (Paiements)
```

## 🚀 Installation locale

### Prérequis

- Node.js 20 LTS
- MySQL 8.0+
- Compte Clerk
- Compte Paystack
- Bucket AWS S3

### Configuration

```bash
# 1. Cloner le repository
git clone https://github.com/Dipomin/sorami.git
cd sorami

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# 4. Configurer Prisma
npx prisma generate
npx prisma migrate dev

# 5. Lancer en développement
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📚 Documentation

### Documentation générale

- 📖 [**Documentation principale**](./docs/README.md) - Index complet de la documentation
- 🏗️ [**Architecture**](./.github/copilot-instructions.md) - Architecture détaillée du projet
- 🔧 [**Configuration**](./docs/CONFIGURATION_CLERK.md) - Guide de configuration

### Documentation de déploiement

| Document | Description | Niveau |
|----------|-------------|--------|
| [**DEPLOYMENT-OVERVIEW.md**](./DEPLOYMENT-OVERVIEW.md) | Vue d'ensemble complète | 📋 Débutant |
| [**QUICKSTART-DEPLOY.md**](./QUICKSTART-DEPLOY.md) | Guide rapide (25 min) | ⚡ Débutant |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | Documentation complète | 📖 Intermédiaire |
| [**README-DEPLOY.md**](./README-DEPLOY.md) | Usage des scripts | 🔧 Avancé |
| [**MONITORING.md**](./MONITORING.md) | Monitoring et maintenance | 📊 Avancé |

### Scripts de déploiement

- `setup-vps.sh` - Configuration initiale du VPS
- `deploy.sh` - Déploiement automatique
- `ecosystem.config.js` - Configuration PM2
- `nginx-sorami.conf` - Configuration Nginx
- `.github/workflows/deploy.yml` - Pipeline CI/CD

### Documentation fonctionnelle

- 📚 [Système de livres](./docs/BOOKS_PAGE_DOCUMENTATION.md)
- 📝 [Système de blog](./docs/BLOG_FEATURE_DOCUMENTATION.md)
- 🎨 [Génération d'images](./docs/IMAGE_GENERATION_FIX_SUMMARY.md)
- 🎬 [Génération de vidéos](./docs/CUSTOM_VIDEOS_DOCUMENTATION.md)
- 💳 [Système de paiement](./docs/PAYMENT_FIXES_COMPLETE.md)
- 📊 [Dashboard](./docs/DASHBOARD_REAL_DATA_DOCUMENTATION.md)

## 🚀 Déploiement

### Option 1 : Déploiement rapide VPS

```bash
# Sur votre VPS
wget https://raw.githubusercontent.com/Dipomin/sorami/main/setup-vps.sh
sudo bash setup-vps.sh

# Puis suivez QUICKSTART-DEPLOY.md
```

### Option 2 : CI/CD avec GitHub Actions

1. Configurez les secrets GitHub (voir [README-DEPLOY.md](./README-DEPLOY.md))
2. Push sur `main` → déploiement automatique ✨

### Option 3 : Docker

```bash
docker-compose up -d
```

**→ Guide complet** : [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Développement

### Structure du projet

```
sorami/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Pages dashboard
│   │   └── ...
│   ├── components/         # Composants React
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitaires
│   │   ├── auth.ts         # Helpers auth (requireAuth)
│   │   ├── prisma.ts       # Client Prisma
│   │   ├── s3-storage.ts   # Gestion S3
│   │   └── api-*.ts        # Clients API
│   └── types/              # Types TypeScript
├── prisma/
│   └── schema.prisma       # Schéma de base de données
├── public/                 # Assets statiques
└── docs/                   # Documentation
```

### Patterns importants

```typescript
// Server-side API avec auth
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await requireAuth(); // Authentification obligatoire
  // ...
}

// Multi-tenancy pattern
const books = await prisma.book.findMany({
  where: { organizationId: user.currentOrganizationId }
});

// Webhooks avec idempotency
const idempotencyKey = `${jobId}-${status}`;
if (processedWebhooks.has(idempotencyKey)) {
  return NextResponse.json({ message: 'Already processed' });
}
```

### Commandes utiles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run lint         # ESLint
npx prisma studio    # Interface DB
npx prisma generate  # Générer client Prisma
```

## 🧪 Tests

```bash
# Tests unitaires (à venir)
npm run test

# Tester les webhooks localement
./test-blog-webhook-fixed.sh
```

## 🔐 Sécurité

- ✅ Authentification via Clerk (SSO, MFA)
- ✅ Multi-tenancy avec isolation des données
- ✅ Variables d'environnement pour tous les secrets
- ✅ Rate limiting sur les API
- ✅ SSL/TLS obligatoire en production
- ✅ Headers de sécurité (CSP, HSTS, etc.)
- ✅ Validation des webhooks avec secrets

## 📊 Monitoring

### En production

```bash
# Status PM2
pm2 status
pm2 monit

# Logs
pm2 logs sorami-frontend
sudo tail -f /var/log/nginx/sorami_access.log

# Health check
curl https://sorami.app/api/health
```

**→ Guide complet** : [MONITORING.md](./MONITORING.md)

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche de feature
git checkout -b feature/ma-fonctionnalite

# Commit avec message conventionnel
git commit -m "feat: ajout de la fonctionnalité X"

# Push et créer une PR
git push origin feature/ma-fonctionnalite
```

### Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
- **Code** : ESLint + Prettier
- **Types** : TypeScript strict mode
- **Tests** : Obligatoires pour les nouvelles features

## 📈 Roadmap

- [x] Génération de livres
- [x] Génération de blogs
- [x] Génération d'images
- [x] Génération de vidéos
- [x] Système de crédits
- [x] Paiements Paystack
- [x] Dashboard analytics
- [ ] Tests E2E
- [ ] PWA support
- [ ] Internationalisation (i18n)
- [ ] API publique
- [ ] Mobile app

## 🆘 Support

### Documentation

- 📖 [Documentation complète](./docs/README.md)
- 🚀 [Guide de déploiement](./DEPLOYMENT.md)
- 📊 [Guide de monitoring](./MONITORING.md)

### Contact

- **Email** : support@sorami.app
- **GitHub Issues** : [Issues](https://github.com/Dipomin/sorami/issues)
- **Documentation** : [Docs](./docs/)

## 📝 Licence

Ce projet est sous licence propriétaire. Tous droits réservés © 2025 Sorami.

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Clerk](https://clerk.com/) - Authentification
- [Prisma](https://www.prisma.io/) - ORM
- [Paystack](https://paystack.com/) - Paiements
- [AWS S3](https://aws.amazon.com/s3/) - Stockage
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

<div align="center">

**[🌐 Site Web](https://sorami.app)** • **[📖 Documentation](./docs/)** • **[🚀 Déploiement](./DEPLOYMENT.md)**

Fait avec ❤️ par l'équipe Sorami

</div>
