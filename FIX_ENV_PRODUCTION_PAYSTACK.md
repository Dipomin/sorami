# 🎯 Solution : Variables Paystack dans .env au lieu de .env.production

## 🔍 PROBLÈME IDENTIFIÉ

**Cause racine** : Votre application Next.js en production charge **`.env.production`**, mais vos variables Paystack sont dans **`.env`** !

```
VPS (Production)
├── .env ← Contient PAYSTACK_SECRET_KEY ✅
└── .env.production ← Fichier vide ou sans Paystack ❌
```

**Résultat** : L'application ne trouve pas `PAYSTACK_SECRET_KEY` → Erreur 401 "Invalid key"

---

## ✅ SOLUTION RAPIDE (2 minutes)

### Option A : Script automatique (RECOMMANDÉ)

**Sur votre machine locale** :

```bash
# 1. Transférer le script sur le VPS
scp fix-env-production.sh sorami@sorami.app:/var/www/sorami/front/
```

**Sur le VPS** :

```bash
# 2. SSH sur le serveur
ssh sorami@sorami.app

# 3. Aller dans le dossier
cd /var/www/sorami/front

# 4. Exécuter le script
bash fix-env-production.sh
```

**Résultat attendu** :
```
🔧 Correction : Migration des variables Paystack vers .env.production

✅ Variables trouvées :
PAYSTACK_SECRET_KEY=***masqué***
PAYSTACK_PUBLIC_KEY=***masqué***
PAYSTACK_WEBHOOK_SECRET=***masqué***

✅ .env.production mis à jour avec les variables Paystack

🚀 Prochaine étape : pm2 restart all
```

**5. Redémarrer** :
```bash
pm2 restart all
pm2 logs --lines 20
```

---

### Option B : Copie manuelle

**Sur le VPS** :

```bash
ssh sorami@sorami.app
cd /var/www/sorami/front

# 1. Voir les variables Paystack dans .env
grep PAYSTACK_ .env

# Exemple de sortie :
# PAYSTACK_SECRET_KEY="sk_live_abc123..."
# PAYSTACK_PUBLIC_KEY="pk_live_xyz789..."
# PAYSTACK_WEBHOOK_SECRET="whsec_abc..."

# 2. Créer/éditer .env.production
nano .env.production

# 3. Copier-coller les 3 lignes PAYSTACK_ depuis .env
# (Utilisez les valeurs affichées à l'étape 1)

# 4. Sauvegarder : Ctrl+X, Y, Entrée

# 5. Vérifier
grep PAYSTACK_ .env.production

# Doit afficher les 3 variables

# 6. Redémarrer
pm2 restart all
```

---

## ✅ VÉRIFICATIONS

### 1. Vérifier que .env.production contient les variables

```bash
# Sur le VPS
cd /var/www/sorami/front
grep PAYSTACK_ .env.production | sed 's/=.*/=***/'
```

**Doit afficher** :
```
PAYSTACK_SECRET_KEY=***
PAYSTACK_PUBLIC_KEY=***
PAYSTACK_WEBHOOK_SECRET=***
```

### 2. Vérifier que PM2 charge .env.production

```bash
# Vérifier la variable NODE_ENV
pm2 env 0 | grep NODE_ENV
# Doit être : NODE_ENV=production

# Vérifier que Paystack est chargé
pm2 env 0 | grep PAYSTACK_SECRET_KEY | sed 's/sk_live_.*/sk_live_***/'
# Doit afficher : PAYSTACK_SECRET_KEY=sk_live_***
```

### 3. Vérifier les logs

```bash
pm2 logs --lines 30 | grep -E "Paystack|PAYSTACK"
```

**✅ Bon signe** :
```
🔑 Utilisation de la clé Paystack: sk_live_abc...
```

**❌ Mauvais signe** :
```
🔴 CRITIQUE: Clé Paystack invalide ou expirée !
PAYSTACK_SECRET_KEY non configurée ou vide
```

### 4. Test API

```bash
curl https://sorami.app/api/health/paystack
```

**✅ Résultat attendu** :
```json
{
  "secretKey": {
    "configured": true,
    "format": "LIVE",
    "prefix": "sk_live_..."
  },
  "recommendation": "✅ Configuration OK"
}
```

### 5. Test souscription

1. Ouvrez **https://sorami.app/pricing**
2. Cliquez **"Souscrire"** sur n'importe quel plan
3. **✅ Doit rediriger vers Paystack** (sans erreur 401)

---

## 🔧 DÉPANNAGE

### Si PM2 ne charge toujours pas .env.production

```bash
# Vérifier la config PM2
cat ecosystem.config.js | grep -A5 "env_production"

# Doit contenir :
# env_production: {
#   NODE_ENV: 'production'
# }

# Forcer le rechargement avec le bon env
pm2 delete all
pm2 start ecosystem.config.js --env production

# Vérifier
pm2 env 0 | grep NODE_ENV
```

### Si NODE_ENV n'est pas "production"

```bash
# Définir explicitement NODE_ENV
export NODE_ENV=production

# Redémarrer PM2
pm2 restart all --update-env

# Ou éditer ecosystem.config.js
nano ecosystem.config.js

# Ajouter/modifier :
module.exports = {
  apps: [{
    name: 'sorami-front',
    script: 'npm',
    args: 'start',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}

# Redémarrer
pm2 reload ecosystem.config.js --env production
```

### Si les variables existent mais ne sont pas chargées

```bash
# Vérifier les permissions
ls -la .env.production
# Doit être lisible : -rw-r--r--

# Si problème de permissions
chmod 644 .env.production

# Vérifier le propriétaire
ls -l .env.production
# Doit appartenir à l'utilisateur qui lance PM2

# Si problème
chown sorami:sorami .env.production  # Remplacez 'sorami' par votre user
```

---

## 📋 CHECKLIST FINALE

- [ ] `.env.production` existe sur le VPS
- [ ] `grep PAYSTACK_ .env.production` affiche 3 variables
- [ ] `pm2 env 0 | grep NODE_ENV` affiche "production"
- [ ] `pm2 env 0 | grep PAYSTACK_SECRET_KEY` affiche la clé
- [ ] `pm2 logs` affiche `🔑 Utilisation de la clé Paystack: sk_live_...`
- [ ] Pas d'erreur `🔴 CRITIQUE` dans les logs
- [ ] `curl https://sorami.app/api/health/paystack` → "LIVE"
- [ ] Test sur /pricing → Redirection Paystack fonctionne ✅

---

## 🎯 POURQUOI CE PROBLÈME ?

### Next.js charge les variables dans cet ordre :

1. **`.env.production.local`** (priorité max, non versionné)
2. **`.env.production`** ← **Fichier utilisé en production**
3. **`.env.local`** (tous les environnements sauf test)
4. **`.env`** ← **Votre fichier actuel** (priorité basse)

En production (`NODE_ENV=production`), Next.js **ne lit PAS** `.env` si `.env.production` existe !

### Solution permanente :

**Option 1** : Garder `.env.production` (RECOMMANDÉ)
- ✅ Sépare dev et prod
- ✅ Évite les erreurs (clés test vs live)
- ✅ Conforme aux best practices Next.js

**Option 2** : Supprimer `.env.production`
```bash
rm .env.production
pm2 restart all
```
- ⚠️ L'app lira `.env` mais mélange dev/prod
- ❌ Non recommandé

---

## 📊 RÉSUMÉ

| Élément | Valeur |
|---------|--------|
| **Cause** | Variables dans `.env` au lieu de `.env.production` |
| **Impact** | 🔴 CRITIQUE (Next.js ne lit pas `.env` en prod) |
| **Solution** | Copier variables Paystack dans `.env.production` |
| **Temps** | 2 minutes |
| **Difficulté** | ⭐ Très facile |

---

## 🚀 APRÈS CORRECTION

Une fois corrigé, vous devriez voir :

```bash
# Logs PM2
pm2 logs --lines 10
🔑 Utilisation de la clé Paystack: sk_live_abc...
✅ API Paystack opérationnelle

# Test API
curl https://sorami.app/api/health/paystack
{"secretKey":{"configured":true,"format":"LIVE"}}

# Test souscription
# → Redirection Paystack sans erreur 401 ✅
```

---

**Créé le** : 4 novembre 2025  
**Version** : 1.0  
**Auteur** : Assistant AI
