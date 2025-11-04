# 🚨 URGENCE : Erreur 401 Paystack en Production

**Erreur** : `POST /api/subscriptions/initialize 401 (Unauthorized)`  
**Cause** : Clé Paystack non configurée ou invalide sur le serveur de production  
**Impact** : 🔴 CRITIQUE - Paiements bloqués

---

## 🔍 Diagnostic Immédiat (1 minute)

### Option 1 : Via l'API de diagnostic

```bash
curl https://sorami.app/api/health/paystack
```

**Résultats possibles** :

#### ✅ Configuration OK
```json
{
  "secretKey": {
    "configured": true,
    "format": "LIVE",
    "prefix": "sk_live_a1..."
  },
  "recommendation": "Configuration OK"
}
```
→ **Clé OK, problème ailleurs** (voir Section B)

#### ❌ Clé manquante
```json
{
  "secretKey": {
    "configured": false,
    "format": "MISSING"
  },
  "recommendation": "CRITIQUE: PAYSTACK_SECRET_KEY non configurée"
}
```
→ **ACTION : Ajouter la clé** (voir Section A.1)

#### ⚠️ Clé TEST en production
```json
{
  "secretKey": {
    "configured": true,
    "format": "TEST",
    "prefix": "sk_test_27..."
  },
  "recommendation": "ATTENTION: Clé TEST en production"
}
```
→ **ACTION : Remplacer par clé LIVE** (voir Section A.2)

#### ❌ Format invalide
```json
{
  "secretKey": {
    "configured": true,
    "format": "INVALID"
  },
  "recommendation": "Format de clé invalide"
}
```
→ **ACTION : Corriger le format** (voir Section A.3)

---

## 🔧 Section A : Corriger la Clé Paystack

### A.1 - Ajouter la clé manquante

```bash
# 1. Se connecter au VPS
ssh user@sorami.app

# 2. Aller dans le dossier du projet
cd /var/www/sorami/front  # ou votre chemin

# 3. Vérifier si .env.production existe
ls -la .env.production

# 4. Si manquant, le créer
cp .env.production.example .env.production

# 5. Éditer le fichier
nano .env.production

# 6. Ajouter (avec la vraie clé depuis dashboard.paystack.com) :
PAYSTACK_SECRET_KEY="sk_live_VOTRE_VRAIE_CLE_LIVE_ICI"
PAYSTACK_PUBLIC_KEY="pk_live_VOTRE_CLE_PUBLIQUE_ICI"
PAYSTACK_WEBHOOK_SECRET="votre_webhook_secret"

# 7. Sauvegarder : Ctrl+X, puis Y, puis Entrée

# 8. Redémarrer l'application
pm2 restart all
# OU
docker-compose restart
# OU
systemctl restart sorami

# 9. Vérifier
curl https://sorami.app/api/health/paystack
```

### A.2 - Remplacer clé TEST par clé LIVE

```bash
ssh user@sorami.app
cd /var/www/sorami/front
nano .env.production

# Remplacer :
# PAYSTACK_SECRET_KEY="sk_test_..." 
# Par :
PAYSTACK_SECRET_KEY="sk_live_VOTRE_CLE_LIVE"

# Sauvegarder et redémarrer
pm2 restart all
```

### A.3 - Corriger format invalide

```bash
# Vérifier que la clé :
# - Commence par sk_live_ (production) ou sk_test_ (dev)
# - N'a pas d'espace avant/après
# - Est entre guillemets

# Format CORRECT :
PAYSTACK_SECRET_KEY="sk_live_a1b2c3d4e5f6..."

# Formats INCORRECTS :
PAYSTACK_SECRET_KEY=sk_live_... # Manque guillemets
PAYSTACK_SECRET_KEY=" sk_live_..." # Espace avant
PAYSTACK_SECRET_KEY="pk_live_..." # Clé publique au lieu de secrète
```

---

## 🔍 Section B : Si la clé est OK mais erreur 401 persiste

### B.1 - Vérifier que la clé est valide sur Paystack

```bash
# Tester la clé directement avec curl
curl -H "Authorization: Bearer sk_live_VOTRE_CLE" \
     https://api.paystack.co/balance
```

**Résultat attendu** :
```json
{
  "status": true,
  "message": "Balance retrieved",
  "data": [...]
}
```

**Si erreur 401** :
- La clé est expirée ou révoquée
- Générer une nouvelle clé sur https://dashboard.paystack.com/settings/developer

### B.2 - Vérifier que l'app utilise bien .env.production

```bash
# Sur le VPS
cd /var/www/sorami/front

# Vérifier quelle variable d'env l'app charge
pm2 env 0 | grep PAYSTACK_SECRET_KEY
# OU
docker exec sorami-front env | grep PAYSTACK_SECRET_KEY

# Si vide ou incorrect, l'app ne charge pas .env.production
```

**Solution** : Forcer le rechargement

```bash
# Avec PM2
pm2 delete all
pm2 start ecosystem.config.js --env production

# Avec Docker
docker-compose down
docker-compose --env-file .env.production up -d

# Vérifier
pm2 logs --lines 50 | grep "Utilisation de la clé Paystack"
```

### B.3 - Vérifier les logs de l'application

```bash
# Logs PM2
pm2 logs sorami-front --lines 100 | grep -E "PAYSTACK|401|Unauthorized"

# Logs Docker
docker logs sorami-front --tail 100 | grep -E "PAYSTACK|401"

# Logs système
journalctl -u sorami -n 100 | grep -E "PAYSTACK|401"
```

**Chercher** :
- ❌ `PAYSTACK_SECRET_KEY non configurée ou vide`
- ❌ `PAYSTACK_SECRET_KEY invalide`
- ✅ `🔑 Utilisation de la clé Paystack: sk_live_...`

---

## ⚡ Solution Ultra-Rapide (3 minutes)

```bash
# 1. SSH sur le serveur
ssh user@sorami.app

# 2. Aller dans le projet
cd /var/www/sorami/front

# 3. Éditer .env.production
nano .env.production

# 4. S'assurer que ces lignes existent (avec les vraies valeurs) :
PAYSTACK_SECRET_KEY="sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
PAYSTACK_PUBLIC_KEY="pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
PAYSTACK_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxx"

# 5. Sauvegarder (Ctrl+X, Y, Entrée)

# 6. Redémarrer
pm2 restart all && pm2 logs --lines 20

# 7. Tester immédiatement
curl https://sorami.app/api/health/paystack

# 8. Si OK, tester souscription
# → https://sorami.app/pricing
# → Cliquer "Souscrire"
# → Doit rediriger vers Paystack
```

---

## 📋 Checklist de Vérification

Après chaque action, vérifier :

- [ ] `curl https://sorami.app/api/health/paystack` → format = "LIVE"
- [ ] `curl https://sorami.app/api/plans` → 200 OK
- [ ] Page https://sorami.app/pricing accessible
- [ ] Clic "Souscrire" → redirection Paystack (pas d'erreur 401)
- [ ] Logs `pm2 logs` → pas d'erreur Paystack

---

## 🆘 Si Toujours Bloqué

### Dernière option : Régénérer la clé

1. **Aller sur Paystack Dashboard** :
   ```
   https://dashboard.paystack.com/settings/developer
   ```

2. **Révoquer l'ancienne clé LIVE** (si elle existe)

3. **Générer une nouvelle clé LIVE**

4. **Copier la nouvelle clé**

5. **Remplacer dans .env.production** :
   ```bash
   PAYSTACK_SECRET_KEY="sk_live_NOUVELLE_CLE"
   ```

6. **Redémarrer et tester**

---

## 📞 Contact Support

Si le problème persiste après toutes ces étapes :

1. **Vérifier Status Paystack** :
   ```
   https://status.paystack.com
   ```

2. **Collecter les informations** :
   ```bash
   curl https://sorami.app/api/health/paystack > paystack-diag.json
   pm2 logs --lines 200 > app-logs.txt
   ```

3. **Contacter Paystack Support** :
   - Email : support@paystack.com
   - Dashboard : https://paystack.com/contact

---

## ✅ Après Correction

Une fois corrigé, vous devriez voir :

```bash
# Diagnostic
curl https://sorami.app/api/health/paystack
{
  "secretKey": {
    "configured": true,
    "format": "LIVE",
    "prefix": "sk_live_a1..."
  },
  "recommendation": "Configuration OK"
}

# Test souscription
# → https://sorami.app/pricing
# → Cliquer "Souscrire" 
# → Redirection vers Paystack ✅
# → Pas d'erreur 401 ✅
```

---

**Temps estimé** : 3-5 minutes  
**Taux de succès** : 95%+  
**Prochaine étape** : Tester une vraie souscription
