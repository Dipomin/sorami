# 🔧 Fix VPS Permissions Error

## Problème
```
npm error code EACCES
npm error syscall rmdir
npm error path /home/sorami/sorami/node_modules/@alloc/quick-lru
npm error errno -13
npm error [Error: EACCES: permission denied, rmdir '/home/sorami/sorami/node_modules/@alloc/quick-lru']
```

**Cause** : Les fichiers dans `node_modules` appartiennent à un autre utilisateur (probablement `root`), empêchant l'utilisateur `sorami` de les modifier.

## ✅ Solutions

### Solution 1 : Script Automatique (Recommandée)

1. **Copiez le script sur le VPS** :
```bash
scp fix-vps-permissions.sh sorami@178.18.254.232:/home/sorami/
```

2. **Connectez-vous et exécutez** :
```bash
ssh sorami@178.18.254.232
cd ~
chmod +x fix-vps-permissions.sh
./fix-vps-permissions.sh
```

### Solution 2 : Commandes Manuelles

**Connectez-vous au VPS** :
```bash
ssh sorami@178.18.254.232
```

**Exécutez ces commandes** :
```bash
cd /home/sorami/sorami

# 1. Corriger les permissions
sudo chown -R sorami:sorami /home/sorami/sorami

# 2. Supprimer node_modules et package-lock
sudo rm -rf node_modules package-lock.json

# 3. Nettoyer le cache npm
npm cache clean --force

# 4. Réinstaller les dépendances
npm install --legacy-peer-deps

# 5. Générer Prisma
npx prisma generate

# 6. Builder l'application
npm run build

# 7. Redémarrer PM2
pm2 reload sorami-frontend --update-env
pm2 save
```

### Solution 3 : Une Seule Ligne

```bash
cd /home/sorami/sorami && sudo chown -R sorami:sorami . && sudo rm -rf node_modules package-lock.json && npm cache clean --force && npm install --legacy-peer-deps && npx prisma generate && npm run build && pm2 reload sorami-frontend --update-env && pm2 save
```

## 🚀 Après Correction

Le workflow GitHub Actions a été mis à jour pour :
1. ✅ Vérifier et corriger automatiquement les permissions
2. ✅ Supprimer `node_modules` et `package-lock.json` avant installation
3. ✅ Utiliser `npm install` au lieu de `npm ci` (plus tolérant)

**Re-déclenchez le déploiement** :
- Allez sur : https://github.com/Dipomin/sorami/actions
- Cliquez sur "Re-run all jobs"

## 🔍 Diagnostic

Vérifiez qui possède les fichiers :
```bash
ls -la /home/sorami/sorami/node_modules | head -20
```

Si vous voyez `root` au lieu de `sorami`, c'est le problème !

## ⚠️ Prévention

Pour éviter ce problème à l'avenir :
1. **Ne jamais utiliser `sudo npm install`** sur le VPS
2. **Toujours exécuter npm en tant qu'utilisateur `sorami`**
3. **Le workflow GitHub Actions gère maintenant les permissions automatiquement**

## 📝 Vérification Post-Fix

```bash
# Vérifier que l'app tourne
pm2 status

# Voir les logs
pm2 logs sorami-frontend --lines 50

# Vérifier les permissions
ls -la /home/sorami/sorami | grep node_modules
# Devrait afficher : drwxr-xr-x sorami sorami
```

---

**Date** : 7 Novembre 2025  
**Status** : ✅ Workflow mis à jour avec gestion automatique des permissions
