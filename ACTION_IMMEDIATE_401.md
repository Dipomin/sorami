# 🚨 ACTION IMMÉDIATE : Erreur 401 Paystack

**Erreur actuelle** : `401 (Unauthorized)` sur `/api/subscriptions/initialize`

---

## 🎯 Diagnostic en 30 secondes

### Étape 1 : Tester l'endpoint de diagnostic

```bash
curl https://sorami.app/api/health/paystack
```

**Attendez 5 secondes pour la réponse...**

---

## 📊 Interprétation du Résultat

### ✅ Cas 1 : Clé OK mais format TEST

```json
{
  "secretKey": {
    "configured": true,
    "format": "TEST"  ← PROBLÈME ICI
  },
  "recommendation": "ATTENTION: Clé TEST en production"
}
```

**Action** : Remplacer par clé LIVE

```bash
ssh user@sorami.app
nano /var/www/sorami/front/.env.production

# Remplacer sk_test_... par sk_live_...
PAYSTACK_SECRET_KEY="sk_live_VOTRE_CLE_LIVE"

pm2 restart all
```

---

### ❌ Cas 2 : Clé manquante

```json
{
  "secretKey": {
    "configured": false,
    "format": "MISSING"  ← PROBLÈME ICI
  }
}
```

**Action** : Ajouter la clé

```bash
ssh user@sorami.app
nano /var/www/sorami/front/.env.production

# Ajouter :
PAYSTACK_SECRET_KEY="sk_live_VOTRE_CLE_LIVE"
PAYSTACK_PUBLIC_KEY="pk_live_VOTRE_CLE_PUBLIQUE"

pm2 restart all
```

---

### ❌ Cas 3 : Format invalide

```json
{
  "secretKey": {
    "configured": true,
    "format": "INVALID"  ← PROBLÈME ICI
  }
}
```

**Action** : Corriger le format

```bash
# Format CORRECT :
PAYSTACK_SECRET_KEY="sk_live_a1b2c3d4..."

# PAS de guillemets manquants
# PAS d'espaces
# DOIT commencer par sk_live_
```

---

## 🚀 Obtenir la Clé LIVE (si vous ne l'avez pas)

```
1. https://dashboard.paystack.com
2. Cliquez sur Settings (⚙️)
3. Developer/API
4. Copiez "Live Secret Key" (commence par sk_live_)
```

---

## ⚡ Commande One-Liner (Tout-en-un)

**Remplacez `VOTRE_CLE_LIVE` par votre vraie clé** :

```bash
ssh user@sorami.app "echo 'PAYSTACK_SECRET_KEY=\"sk_live_VOTRE_CLE_LIVE\"' >> /var/www/sorami/front/.env.production && cd /var/www/sorami/front && pm2 restart all"
```

---

## ✅ Vérification Finale

```bash
# 1. Vérifier le diagnostic
curl https://sorami.app/api/health/paystack
# → "format": "LIVE" ✅
# → "recommendation": "Configuration OK" ✅

# 2. Tester l'API plans
curl https://sorami.app/api/plans
# → 200 OK ✅

# 3. Tester souscription
# → https://sorami.app/pricing
# → Cliquer "Souscrire"
# → Redirection Paystack ✅ (pas d'erreur 401)
```

---

## 📞 Si Toujours Bloqué

**Envoyer le résultat de cette commande** :

```bash
curl https://sorami.app/api/health/paystack && \
curl https://sorami.app/api/plans && \
ssh user@sorami.app "pm2 logs --lines 50 | grep -E 'Paystack|401'"
```

---

**Temps estimé** : 2-3 minutes  
**Fichier** : `URGENCE_PAYSTACK_401.md` (guide complet)
