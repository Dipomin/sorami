# 🚨 SOLUTION : Clé Paystack Invalide en Production

**Erreur confirmée dans les logs PM2** :
```
PM2 | status: 401, statusText: 'Unauthorized'
PM2 | error: { message: 'Invalid key', code: 'invalid_Key' }
PM2 | 🔴 CRITIQUE: Clé Paystack invalide ou expirée !
```

**Cause** : La clé `PAYSTACK_SECRET_KEY` sur le serveur est **invalide, expirée ou révoquée**.

---

## ✅ SOLUTION EN 3 ÉTAPES (3 minutes)

### Étape 1️⃣ : Générer une nouvelle clé LIVE sur Paystack

1. **Connectez-vous au Dashboard Paystack** :
   ```
   https://dashboard.paystack.com/settings/developer
   ```

2. **Section "API Keys & Webhooks"** :
   - Trouvez **"Secret Key (Live)"**
   - Options :
     - Si jamais révélée : Cliquez **"Reveal"** pour voir la clé actuelle
     - Si déjà révélée : Cliquez **"Regenerate"** pour en créer une nouvelle
     - Si aucune clé : Cliquez **"Generate Live Key"**

3. **Copiez la nouvelle clé** :
   - Format : `sk_live_...` (environ 50-60 caractères)
   - ⚠️ **NE FERMEZ PAS cette page avant d'avoir copié la clé !**

---

### Étape 2️⃣ : Mettre à jour la clé sur le serveur

```bash
# 1. SSH sur le serveur de production
ssh sorami@sorami.app

# 2. Aller dans le dossier du projet
cd /var/www/sorami/front

# 3. Sauvegarder l'ancien fichier (par précaution)
cp .env.production .env.production.backup

# 4. Éditer le fichier d'environnement
nano .env.production
```

**Dans nano, remplacez la ligne** :
```bash
# ❌ ANCIENNE (invalide)
PAYSTACK_SECRET_KEY="sk_live_ancienne_cle_invalide_ou_expiree"

# ✅ NOUVELLE (copiée depuis le dashboard)
PAYSTACK_SECRET_KEY="sk_live_VOTRE_NOUVELLE_CLE_COPIEE_ICI"
```

**Vérifiez aussi que les autres clés sont présentes** :
```bash
PAYSTACK_PUBLIC_KEY="pk_live_VOTRE_CLE_PUBLIQUE"
PAYSTACK_WEBHOOK_SECRET="votre_webhook_secret"
```

**Sauvegarder** :
1. Appuyez sur `Ctrl + X`
2. Tapez `Y` (pour Yes)
3. Appuyez sur `Entrée`

---

### Étape 3️⃣ : Redémarrer l'application et vérifier

```bash
# Redémarrer PM2 avec les nouvelles variables
pm2 restart all

# Attendre 2-3 secondes que l'app redémarre
sleep 3

# Vérifier les logs (les 30 dernières lignes)
pm2 logs --lines 30
```

**✅ Vous devez voir dans les logs** :
```
🔑 Utilisation de la clé Paystack: sk_live_abc...
✅ API Paystack opérationnelle
```

**❌ Vous NE devez PLUS voir** :
```
🔴 CRITIQUE: Clé Paystack invalide ou expirée !
status: 401, statusText: 'Unauthorized'
```

---

## ✅ TESTS DE VÉRIFICATION

### Test 1 : Endpoint de diagnostic

```bash
curl https://sorami.app/api/health/paystack
```

**Résultat attendu** :
```json
{
  "secretKey": {
    "configured": true,
    "format": "LIVE",
    "prefix": "sk_live_abc..."
  },
  "publicKey": {
    "configured": true,
    "format": "LIVE",
    "prefix": "pk_live_abc..."
  },
  "webhookSecret": {
    "configured": true
  },
  "recommendation": "✅ Configuration OK"
}
```

### Test 2 : Charger les plans

```bash
curl https://sorami.app/api/plans
```

**Résultat attendu** :
```json
{
  "status": "success",
  "plans": [
    {
      "plan_code": "PLN_...",
      "name": "Standard",
      "amount": 15000,
      "interval": "monthly"
    },
    ...
  ],
  "source": "paystack"
}
```

### Test 3 : Tester une souscription (navigation)

1. Ouvrez **https://sorami.app/pricing**
2. Cliquez sur **"Souscrire"** (n'importe quel plan)
3. **✅ Doit rediriger vers Paystack** (page de paiement avec formulaire de carte)
4. **❌ Ne doit PAS afficher** : "Erreur d'authentification Paystack"

---

## 🔍 DÉPANNAGE

### Si l'erreur 401 persiste après redémarrage

#### 1. Vérifier que PM2 charge bien le fichier .env.production

```bash
# Sur le serveur
cd /var/www/sorami/front

# Afficher le contenu (masquez la clé avant de partager)
cat .env.production | grep PAYSTACK_SECRET_KEY

# Doit afficher :
# PAYSTACK_SECRET_KEY="sk_live_VOTRE_NOUVELLE_CLE"

# Vérifier que PM2 utilise bien ce fichier
pm2 env 0 | grep PAYSTACK

# Si vide ou incorrect, forcer le rechargement :
pm2 delete all
pm2 start ecosystem.config.js --env production
```

#### 2. Vérifier que la nouvelle clé est valide sur Paystack

```bash
# Testez directement l'API Paystack (remplacez YOUR_KEY)
curl -H "Authorization: Bearer sk_live_YOUR_NEW_KEY" \
     https://api.paystack.co/balance
```

**✅ Si valide** :
```json
{
  "status": true,
  "message": "Balance retrieved",
  "data": [{ "currency": "NGN", "balance": 123456 }]
}
```

**❌ Si invalide** :
```json
{
  "status": false,
  "message": "Invalid key"
}
```

**Solution** : Retournez sur le dashboard Paystack et **regénérez** une nouvelle clé.

#### 3. Vérifier que le compte Paystack est activé en mode LIVE

Sur **https://dashboard.paystack.com** :
- En haut à droite : Doit afficher **"Live Mode"** (pas "Test Mode")
- Si en Test Mode : Activez le Live Mode
- Si le Live Mode n'est pas disponible : Contactez support@paystack.com

---

## 📋 CHECKLIST FINALE

Après avoir suivi ces étapes, vérifiez :

- [ ] Nouvelle clé `sk_live_...` générée sur Paystack Dashboard
- [ ] Clé copiée et collée dans `.env.production` sur le serveur
- [ ] Fichier sauvegardé (Ctrl+X, Y, Entrée)
- [ ] `pm2 restart all` exécuté
- [ ] `pm2 logs` affiche `🔑 Utilisation de la clé Paystack: sk_live_...`
- [ ] Pas d'erreur `🔴 CRITIQUE` dans les logs
- [ ] `curl https://sorami.app/api/health/paystack` → "LIVE"
- [ ] `curl https://sorami.app/api/plans` → 200 OK avec 4 plans
- [ ] Test sur https://sorami.app/pricing → Clic "Souscrire" → Redirection Paystack ✅

---

## 📊 RÉSUMÉ

| Élément | État |
|---------|------|
| **Cause** | Clé Paystack invalide/expirée/révoquée |
| **Temps requis** | 3-5 minutes |
| **Difficulté** | ⭐ Facile |
| **Taux de succès** | 99% |
| **Impact** | 🔴 CRITIQUE (paiements bloqués) |

---

## 📞 SUPPORT

### Si le problème persiste après ces étapes

1. **Vérifier le status de Paystack** :
   ```
   https://status.paystack.com
   ```

2. **Collecter les informations de diagnostic** :
   ```bash
   curl https://sorami.app/api/health/paystack > paystack-diag.json
   pm2 logs --lines 200 > app-logs.txt
   cat .env.production | grep PAYSTACK (masquez les valeurs)
   ```

3. **Contacter Paystack Support** :
   - Email : support@paystack.com
   - Dashboard : https://dashboard.paystack.com/contact
   - Twitter : @PaystackHQ

---

## 🎯 PROCHAINES ÉTAPES

Après avoir résolu l'erreur 401 :

1. **Configurer le webhook Paystack** :
   - URL : `https://sorami.app/api/webhooks/paystack`
   - Voir : `GUIDE_RENOUVELLEMENT_PAYSTACK.md`

2. **Synchroniser les plans** :
   ```bash
   node scripts/sync-paystack-plans.mjs
   ```

3. **Tester une vraie souscription** :
   - Utiliser une vraie carte (ou carte test Paystack)
   - Vérifier que les crédits sont attribués
   - Vérifier l'email de confirmation

---

**Créé le** : 4 novembre 2025  
**Dernière mise à jour** : 4 novembre 2025  
**Version** : 1.0
