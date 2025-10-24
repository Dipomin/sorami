# Dashboard Données Réelles - Guide de Démarrage Rapide 🚀

## ✅ Vérification Rapide

### 1. Fichiers créés
```bash
# API Routes
src/app/api/dashboard/stats/route.ts
src/app/api/dashboard/activity/route.ts
src/app/api/dashboard/stats/detailed/route.ts

# Pages
src/app/dashboard/stats/page.tsx
```

### 2. Fichiers modifiés
```bash
src/app/dashboard/page.tsx
```

## 🎯 Test Rapide

### Étape 1 : Démarrer le serveur
```bash
npm run dev
```

### Étape 2 : Accéder au dashboard
1. Se connecter avec Clerk : `http://localhost:3000`
2. Aller sur : `http://localhost:3000/dashboard`
3. Vérifier :
   - [ ] Stats s'affichent (ou 0 si pas de contenu)
   - [ ] Skeletons apparaissent puis disparaissent
   - [ ] Activité récente s'affiche (ou empty state)
   - [ ] Bouton "Voir les statistiques détaillées" visible

### Étape 3 : Tester la page stats détaillées
1. Cliquer sur "Voir les statistiques détaillées"
2. URL : `http://localhost:3000/dashboard/stats`
3. Vérifier :
   - [ ] 4 boutons de période (Aujourd'hui, Semaine, Mois, Tout)
   - [ ] Changement de période met à jour les chiffres
   - [ ] Graphiques de performance mensuelle
   - [ ] Section insights en bas

## 🧪 Test avec Données

### Créer des données de test
Si vous n'avez pas de contenu, créez-en :

```bash
# Via l'interface
1. Générer une image : /create
2. Générer une vidéo : /videos
3. Créer un article : /blog/create
4. Créer un livre : /books/create

# Ou via Prisma Studio
npx prisma studio
# Puis ajouter manuellement des ImageGeneration, VideoGeneration, etc.
```

### Vérifier les données en DB
```bash
npx prisma studio

# Vérifier les tables :
- ImageGeneration (userId, createdAt, status)
- VideoGeneration (userId, createdAt, status)
- BlogArticle (userId, createdAt, title)
- Book (userId, createdAt, title)
```

## 🔍 Debug Rapide

### Problème : Stats à 0 même avec du contenu
**Solution** :
```bash
# Ouvrir la console du navigateur (F12)
# Vérifier les appels API :
Network > XHR > /api/dashboard/stats
Network > XHR > /api/dashboard/activity

# Vérifier la réponse JSON :
{
  "success": true,
  "stats": { ... }
}
```

### Problème : Erreur 401 Unauthorized
**Solution** :
```bash
# Vérifier que vous êtes bien connecté avec Clerk
# Si pas connecté, redirection vers /sign-in

# Vérifier dans la console :
Console > Errors > "Unauthorized"
```

### Problème : Skeletons ne disparaissent pas
**Solution** :
```typescript
// Ouvrir /src/app/dashboard/page.tsx
// Vérifier le useEffect ligne ~76 :
useEffect(() => {
  Promise.all([...])
    .finally(() => {
      setLoading(false); // ← Doit être appelé
    });
}, []);
```

## 📊 Fonctionnalités Clés

### Dashboard Principal (`/dashboard`)
- **Stats** : Totaux + croissance 30 jours
- **Activité** : 10 dernières actions avec temps relatif
- **Quick Actions** : Liens vers création de contenu

### Stats Détaillées (`/dashboard/stats`)
- **Sélecteur** : Aujourd'hui / Semaine / Mois / Tout
- **Métriques** : Total, mois actuel vs précédent, moyenne/jour
- **Graphiques** : Barres de progression animées
- **Insights** : Analyse automatique des performances

## 🎨 Personnalisation Rapide

### Changer les couleurs d'un type
```typescript
// Dans /src/app/dashboard/stats/page.tsx (ligne ~136)
const contentTypes = [
  {
    key: "images",
    label: "Images",
    icon: Image,
    color: "from-pink-500 to-rose-500", // ← Changer ici
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-400",
  },
  // ...
];
```

### Modifier le format de temps relatif
```typescript
// Dans /src/app/api/dashboard/activity/route.ts (ligne ~16)
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Modifier les seuils et messages ici
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  // ...
}
```

### Changer le nombre d'activités affichées
```typescript
// Dans /src/app/api/dashboard/activity/route.ts (ligne ~80)
const allActivities = [...images, ...videos, ...articles, ...books]
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 10); // ← Changer 10 par le nombre souhaité
```

## 🚀 Déploiement

### Variables d'environnement requises
```bash
# .env.local
DATABASE_URL="mysql://..." # Connexion Prisma
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### Build de production
```bash
npm run build
npm start
```

### Vérifier en production
```bash
# Tester les API endpoints
curl https://votre-domaine.com/api/dashboard/stats \
  -H "Cookie: __session=..." # Cookie Clerk

# Devrait retourner :
{"success":true,"stats":{...}}
```

## 📝 Checklist Finale

- [ ] Dashboard charge et affiche les stats
- [ ] Skeletons apparaissent puis disparaissent
- [ ] Activité récente affiche les bons contenus
- [ ] Empty state si aucune activité
- [ ] Lien vers stats détaillées fonctionne
- [ ] Page stats détaillées charge
- [ ] Sélecteur de période met à jour les chiffres
- [ ] Graphiques s'animent correctement
- [ ] Pas d'erreurs dans la console
- [ ] Pas d'erreurs TypeScript (`npm run build`)

## 🆘 Support

### Logs à vérifier
```bash
# Serveur Next.js
Terminal > npm run dev > Output

# Client (navigateur)
F12 > Console > Errors
F12 > Network > XHR > Status codes

# Base de données
npx prisma studio > Vérifier les données
```

### Documentation complète
Voir : `/docs/DASHBOARD_REAL_DATA_DOCUMENTATION.md`

---

**Temps estimé** : 5-10 minutes  
**Difficulté** : Facile  
**Prérequis** : Clerk auth configuré, Prisma DB connectée
