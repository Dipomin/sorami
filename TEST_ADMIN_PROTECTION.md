# 🔒 Test de la Protection Admin

## Comment tester la protection du dossier /admin/

### Prérequis
Le serveur de développement doit être lancé : `npm run dev`

### Scénario 1 : Tester sans être connecté

1. Ouvrir un navigateur en mode navigation privée
2. Accéder à http://localhost:3001/admin
3. **Résultat attendu** : Redirection automatique vers `/sign-in?redirect=/admin`

### Scénario 2 : Tester avec un compte utilisateur normal (USER)

1. Se connecter avec un compte utilisateur normal
2. Accéder à http://localhost:3001/admin
3. **Résultat attendu** : 
   - Écran "Accès refusé" s'affiche
   - Message : "Vous n'avez pas les permissions nécessaires..."
   - Redirection automatique vers `/dashboard` après 2 secondes

### Scénario 3 : Tester avec un compte administrateur (ADMIN)

1. Se connecter avec un compte ADMIN
2. Accéder à http://localhost:3001/admin
3. **Résultat attendu** :
   - Bandeau violet "Mode Administrateur" en haut
   - Dashboard admin s'affiche
   - Accès aux différentes sections admin

### Créer un compte admin pour tester

#### Méthode 1 : Via la page de promotion (nécessite d'être déjà admin)
```
http://localhost:3001/admin/promote
```

#### Méthode 2 : Via script npm
```bash
npm run promote-admin
# Entrer l'email de l'utilisateur à promouvoir
```

#### Méthode 3 : Directement en base de données
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'votre-email@exemple.com';
```

### Test des routes API admin

```bash
# Sans authentification (401)
curl http://localhost:3001/api/admin/check-access

# Avec authentification USER (403)
# (Nécessite d'ajouter le cookie de session Clerk)

# Avec authentification ADMIN (200)
# Retourne : {"authorized":true,"role":"ADMIN",...}
```

### Pages à tester

- ✅ http://localhost:3001/admin - Dashboard admin
- ✅ http://localhost:3001/admin/blog - Gestion du blog
- ✅ http://localhost:3001/admin/promote - Promotion d'utilisateurs
- ✅ http://localhost:3001/admin/n-importe-quoi - Toute page sous /admin/

## Vérification de la protection

### ✅ Ce qui doit être protégé :
- [x] Page `/admin` et tous ses sous-dossiers
- [x] API `/api/admin/check-access`
- [x] API `/api/admin/promote`
- [x] Toutes futures pages créées sous `/admin/`

### ✅ Ce qui doit être accessible publiquement :
- [x] Page d'accueil `/`
- [x] Page de contact `/contact`
- [x] Page de blog `/blog`
- [x] Pages de connexion/inscription

### ✅ Comportements attendus :
- [x] Redirection vers `/sign-in` si non connecté
- [x] Écran "Accès refusé" si connecté mais pas admin
- [x] Bandeau "Mode Administrateur" si admin
- [x] Redirection automatique des non-autorisés

## Logs à surveiller

Dans le terminal du serveur, vous devriez voir :
```
requireAdmin - user: user_xxx ADMIN
[Admin API] Accès autorisé pour email@example.com (ADMIN)
[Admin Check] Permissions OK pour email@example.com
```

En cas de refus :
```
[Admin API] Accès refusé: Error: Forbidden - Admin access required
[Admin Check] Permissions refusées: ...
```

## Debug

Si la protection ne fonctionne pas :

1. Vérifier que le layout admin existe : `src/app/admin/layout.tsx`
2. Vérifier que l'API existe : `src/app/api/admin/check-access/route.ts`
3. Vérifier les rôles dans la base de données
4. Consulter les logs serveur pour les erreurs
5. Vérifier que le middleware Clerk protège bien `/admin(.*)`

## Support

- Documentation complète : `ADMIN_PROTECTION.md`
- Code source layout : `src/app/admin/layout.tsx`
- Helpers auth : `src/lib/auth-admin.ts`
- Middleware API : `src/lib/admin-api-middleware.ts`
