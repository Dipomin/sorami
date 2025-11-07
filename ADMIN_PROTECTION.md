# Protection du Dossier Admin - Documentation

## 🔒 Vue d'ensemble

Le dossier `/admin/` et tous ses sous-dossiers sont maintenant protégés par un système de vérification de rôle. Seuls les utilisateurs ayant le rôle **ADMIN** ou **SUPER_ADMIN** peuvent accéder à cette zone.

## 📁 Structure de protection

### 1. Layout Admin (`/src/app/admin/layout.tsx`)

Le layout admin enveloppe toutes les pages du dossier `/admin/` et ses sous-dossiers.

**Fonctionnalités :**
- ✅ Vérification automatique de l'authentification Clerk
- ✅ Vérification du rôle via l'API `/api/admin/check-access`
- ✅ Redirection vers `/sign-in` si non authentifié
- ✅ Redirection vers `/dashboard` si pas admin (après 2 secondes)
- ✅ Bandeau visuel "Mode Administrateur" en haut de page
- ✅ États de chargement et d'erreur animés

**États visuels :**
1. **Chargement** : Spinner avec message "Vérification des permissions..."
2. **Accès refusé** : Écran d'erreur avec icône d'alerte et redirection
3. **Accès autorisé** : Bandeau admin + contenu de la page

### 2. API de vérification (`/src/app/api/admin/check-access/route.ts`)

Route GET pour vérifier les permissions admin.

**Endpoint :** `GET /api/admin/check-access`

**Réponse en cas de succès (200) :**
```json
{
  "authorized": true,
  "role": "ADMIN",
  "userId": "user_123",
  "email": "admin@example.com"
}
```

**Réponse en cas d'échec :**
- **401** : Non authentifié
- **403** : Authentifié mais pas admin
- **500** : Erreur serveur

### 3. Helper d'authentification admin (`/src/lib/auth-admin.ts`)

Fonctions utilitaires pour vérifier le rôle admin.

**Fonctions disponibles :**

```typescript
// Vérifie et throw une erreur si pas admin
const user = await requireAdmin();

// Vérifie et retourne boolean (sans throw)
const isUserAdmin = await isAdmin();
```

**Rôles autorisés :**
- `ADMIN`
- `SUPER_ADMIN`

### 4. Middleware API admin (`/src/lib/admin-api-middleware.ts`)

Utilitaires pour protéger les routes API admin.

**Utilisation avec `withAdminAuth` :**
```typescript
import { withAdminAuth } from '@/lib/admin-api-middleware';

export const POST = withAdminAuth(async (request) => {
  // Le code ici ne s'exécute que si l'utilisateur est admin
  // @ts-ignore
  const adminUser = request.adminUser;
  
  // Votre logique API...
});
```

**Utilisation avec `checkAdminPermissions` :**
```typescript
import { checkAdminPermissions } from '@/lib/admin-api-middleware';

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdminPermissions();
  if (!adminCheck.success) {
    return adminCheck.response;
  }
  
  const adminUser = adminCheck.user;
  // Votre logique API...
}
```

## 🛡️ Flux de protection

### Scénario 1 : Utilisateur non connecté
```
1. Utilisateur tente d'accéder à /admin/blog
2. Layout admin détecte l'absence de user via Clerk
3. Redirection automatique vers /sign-in?redirect=/admin
4. Après connexion, retour vers /admin
```

### Scénario 2 : Utilisateur connecté mais pas admin
```
1. Utilisateur (rôle: USER) tente d'accéder à /admin/promote
2. Layout admin appelle /api/admin/check-access
3. API vérifie le rôle via requireAdmin()
4. Erreur "Forbidden" retournée (403)
5. Écran "Accès refusé" affiché pendant 2 secondes
6. Redirection automatique vers /dashboard
```

### Scénario 3 : Utilisateur admin
```
1. Utilisateur (rôle: ADMIN) accède à /admin/blog
2. Layout admin appelle /api/admin/check-access
3. API confirme le rôle ADMIN
4. Bandeau "Mode Administrateur" affiché
5. Contenu de la page admin chargé
```

## 🎨 Design UX/UI

### Bandeau administrateur
- Position : Fixe, juste sous la navigation (top: 4rem)
- Couleur : Dégradé violet/indigo avec transparence
- Contenu : Icône Shield + "Mode Administrateur" + Rôle

### Écran d'accès refusé
- Background : Gradient dark avec glassmorphism
- Icône : Triangle d'alerte rouge
- Message : Clair et explicite
- Badge : "Rôle requis : ADMIN"
- Redirection : Automatique après 2 secondes

## 🔧 Configuration

### Variables d'environnement
Aucune variable supplémentaire requise. Utilise la configuration Clerk existante.

### Rôles dans la base de données (Prisma)
```prisma
enum UserRole {
  SUPER_ADMIN  // Accès admin autorisé
  ADMIN        // Accès admin autorisé
  USER         // Accès admin refusé
}
```

## 📋 Pages protégées actuellement

Toutes les pages sous `/admin/` sont automatiquement protégées :
- `/admin/blog` - Gestion des articles de blog
- `/admin/promote` - Promotion d'utilisateurs (dev only)
- Tous les sous-dossiers futurs seront automatiquement protégés

## 🚀 Ajouter une nouvelle page admin

### Méthode 1 : Simplement créer la page
```tsx
// src/app/admin/ma-nouvelle-page/page.tsx
export default function MaNouvellePageAdmin() {
  return (
    <div>
      {/* Votre contenu admin */}
    </div>
  );
}
```
✅ **Automatiquement protégée** grâce au layout admin !

### Méthode 2 : Créer une route API admin
```typescript
// src/app/api/admin/ma-route/route.ts
import { withAdminAuth } from '@/lib/admin-api-middleware';

export const POST = withAdminAuth(async (request) => {
  // @ts-ignore
  const adminUser = request.adminUser;
  
  // Votre logique protégée
  return NextResponse.json({ success: true });
});
```

## 🧪 Tests

### Test 1 : Utilisateur non admin
```bash
# 1. Se connecter avec un compte USER
# 2. Essayer d'accéder à http://localhost:3001/admin
# Résultat attendu : Écran "Accès refusé" puis redirection vers /dashboard
```

### Test 2 : Utilisateur admin
```bash
# 1. Se connecter avec un compte ADMIN
# 2. Accéder à http://localhost:3001/admin/promote
# Résultat attendu : Bandeau admin visible + page chargée
```

### Test 3 : Protection API
```bash
# Tester avec curl ou Postman
curl -X GET http://localhost:3001/api/admin/check-access

# Sans authentification : 401
# Avec USER : 403
# Avec ADMIN : 200 + données
```

## 📊 Promouvoir un utilisateur en ADMIN (développement)

```bash
# 1. Accéder à /admin/promote (nécessite déjà d'être admin)
# 2. Entrer l'email de l'utilisateur à promouvoir
# 3. Cliquer sur "Promouvoir au rôle ADMIN"

# OU via script
npm run promote-admin
```

## ⚠️ Sécurité

### Bonnes pratiques appliquées :
- ✅ Double vérification (layout client + API server)
- ✅ Vérification côté serveur obligatoire
- ✅ Messages d'erreur informatifs mais pas trop détaillés
- ✅ Logs serveur pour audit
- ✅ Redirection automatique des non-autorisés
- ✅ Protection de toutes les routes API admin

### Points d'attention :
- ⚠️ La route `/api/admin/promote` est désactivée en production
- ⚠️ Utiliser SUPER_ADMIN pour des opérations critiques
- ⚠️ Logger toutes les actions admin importantes

## 🔄 Middleware Clerk

Le middleware Clerk protège déjà l'authentification :
```typescript
// middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)', // Nécessite authentification
  // ...
]);
```

Le layout admin ajoute la **vérification de rôle** en plus.

## 📝 Logs

Les logs serveur affichent :
```
requireAdmin - user: user_abc123 ADMIN
[Admin API] Accès autorisé pour admin@example.com (ADMIN)
[Admin Promote] Opération initiée par admin@example.com
```

## 🎯 Résumé

| Niveau de protection | Méthode | Où |
|---------------------|---------|-----|
| Authentification | Clerk Middleware | `middleware.ts` |
| Rôle ADMIN | Layout Admin | `app/admin/layout.tsx` |
| API Protection | Helper Functions | `lib/admin-api-middleware.ts` |
| Vérification serveur | requireAdmin() | `lib/auth-admin.ts` |

🎉 **Toutes les pages et APIs du dossier `/admin/` sont maintenant sécurisées !**
