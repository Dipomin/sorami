# Schéma de Base de Données Prisma - SaaS de Génération de Livres IA

## 📋 Vue d'Ensemble

Ce schéma Prisma conçoit une architecture complète pour un **SaaS multi-tenant** de génération de livres avec IA, intégrant toutes les fonctionnalités nécessaires pour un service professionnel.

## 🏗️ Architecture Multi-Tenant

### Modèle de Tenancy
- **Organisations** comme entités principales
- **Utilisateurs** peuvent appartenir à plusieurs organisations
- **Rôles et permissions** granulaires
- **Isolation des données** par organisation

### Gestion des Utilisateurs
```prisma
User ← OrganizationMember → Organization
```
- Authentification OAuth et email/password
- Profils utilisateur complets
- Gestion des sessions et tokens

## 📚 Système de Livres

### Structure Hiérarchique
```
Organization
├── Books
│   ├── Chapters (ordonnés)
│   ├── Formats (PDF, EPUB, DOCX, etc.)
│   ├── Jobs (génération IA)
│   └── Corrections
```

### Fonctionnalités Clés

#### 1. **Génération de Contenu IA**
- **BookJob** : Workflow complet de génération
- **États** : pending → generating_outline → writing_chapters → finalizing → completed
- **Intégration CrewAI** via `externalJobId`
- **Progression temps réel** avec détails

#### 2. **Formats Multiples**
- **BookFormat** : PDF, EPUB, DOCX, HTML, Markdown
- **Génération automatique** depuis Markdown source
- **Stockage multi-cloud** (AWS S3, Google Cloud, Azure)
- **CDN** pour accès rapide

#### 3. **Système de Correction**
- **BookCorrection** & **ChapterCorrection**
- **Types** : spelling, grammar, style, coherence, structure
- **Sévérité** : info, warning, error, critical
- **Workflow** de résolution

## 💾 Stockage et Fichiers

### Providers Supportés
- **LOCAL** : Stockage local (développement)
- **AWS_S3** : Amazon S3 (production)
- **GOOGLE_CLOUD** : Google Cloud Storage
- **AZURE_BLOB** : Azure Blob Storage

### Structure des Fichiers
```
Book {
  content: String        // Contenu Markdown principal
  s3Bucket: String      // Bucket de stockage
  s3Key: String         // Clé unique du fichier
}

BookFormat {
  format: FormatType    // PDF, EPUB, etc.
  filePath: String      // Chemin local ou distant
  cdnUrl: String        // URL CDN optimisée
}
```

## 💰 Abonnements et Facturation

### Architecture Paystack
```prisma
Subscription ← Invoice ← InvoiceItem
User/Organization ← Subscription
```

### Plans et Limites
- **FREE** : 10 livres, 1 GB stockage
- **STARTER** : 100 livres, 10 GB stockage
- **PRO** : Illimité, fonctionnalités avancées
- **ENTERPRISE** : Multi-tenant, API, support

### Métriques d'Usage
```prisma
UsageMetric {
  metric: BOOKS_CREATED | STORAGE_USED | API_CALLS
  value: Decimal
  period: DateTime range
}
```

## 🔐 Sécurité et Permissions

### Authentification
- **NextAuth.js** compatible (Account, Session, VerificationToken)
- **Rôles utilisateur** : SUPER_ADMIN, ADMIN, USER
- **Rôles organisation** : OWNER, ADMIN, MEMBER, GUEST

### API et Accès
```prisma
ApiKey {
  scopes: ["books:read", "books:write"]
  rateLimit: Int
  organization: Organization
}
```

## 👥 Collaboration

### Système de Collaboration
```prisma
BookCollaborator {
  role: VIEWER | COMMENTER | EDITOR | ADMIN
  permissions: Json
  status: PENDING | ACTIVE
}
```

### Gestion des Versions
```prisma
BookRevision {
  version: String      // v1.0, v1.1
  changes: Json        // Détails des modifications
  content: String      // Snapshot du contenu
}
```

## 📊 Monitoring et Analytics

### Journalisation
```prisma
ActivityLog {
  action: "book.created" | "user.login"
  resource: "book" | "user"
  metadata: Json
}
```

### Téléchargements
```prisma
BookDownload {
  user: User
  format: BookFormat
  downloadedAt: DateTime
  ipAddress: String
}
```

## 🔄 Workflow de Génération

### Étapes Principales
1. **Création** : User soumet title/topic/goal
2. **Job Creation** : BookJob créé avec statut PENDING
3. **IA Processing** : 
   - GENERATING_OUTLINE
   - WRITING_CHAPTERS (avec progression)
   - FINALIZING
4. **Stockage** : Contenu sauvé en Markdown
5. **Formats** : Génération automatique PDF/EPUB/DOCX
6. **Notification** : User notifié de la completion

### Intégration CrewAI
```typescript
// Mapping des statuts
CrewAI Status → Prisma JobStatus
"pending" → PENDING
"generating_outline" → GENERATING_OUTLINE
"writing_chapters" → WRITING_CHAPTERS
"finalizing" → FINALIZING
"completed" → COMPLETED
"failed" → FAILED
```

## 🚀 Avantages de cette Architecture

### ✅ Scalabilité
- **Multi-tenant** natif
- **Isolation des données** par organisation
- **Limites configurables** par plan

### ✅ Flexibilité
- **Formats multiples** générés automatiquement
- **Stockage multi-cloud** configurable
- **Workflow de correction** extensible

### ✅ Robustesse
- **Gestion d'erreurs** complète
- **Versioning** des livres
- **Audit trail** complet

### ✅ Monétisation
- **Abonnements Paystack** intégrés
- **Métriques d'usage** détaillées
- **Facturation automatique**

## 📋 Migration Recommandée

### Étape 1 : Infrastructure
```bash
npm install prisma @prisma/client
npx prisma init
```

### Étape 2 : Configuration
```env
DATABASE_URL="postgresql://..."
PAYSTACK_SECRET_KEY="sk_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

### Étape 3 : Déploiement
```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### Étape 4 : Intégration
- Migrer les `BookJob` existants
- Connecter l'API CrewAI
- Configurer le stockage S3
- Intégrer Paystack

## 🔧 Commandes Utiles

```bash
# Génération du client
npx prisma generate

# Migration de développement
npx prisma migrate dev --name init

# Déploiement production
npx prisma migrate deploy

# Interface d'administration
npx prisma studio

# Reset complet
npx prisma migrate reset
```

Ce schéma fournit une base solide pour un **SaaS professionnel** de génération de livres avec IA, incluant toutes les fonctionnalités nécessaires pour la scalabilité, la monétisation et la gestion multi-tenant.