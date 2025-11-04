# 🔴 FIX CRITIQUE : Erreur "Invalid key" Paystack en Production

**Date** : 4 novembre 2025  
**Erreur** : `Error: Invalid key`  
**Impact** : 🔴 Système de paiement bloqué - CRITIQUE

---

## 🎯 Diagnostic

L'erreur "Invalid key" provient de Paystack et indique que la clé API utilisée est :
- ❌ Non configurée (vide)
- ❌ Invalide (mauvais format)
- ❌ Expirée ou révoquée
- ❌ En mode TEST alors qu'on est en PRODUCTION

---

## 🔍 Vérification Immédiate (Production)

### 1. Vérifier la clé sur le serveur

```bash
ssh user@vps
cd /path/to/sorami/front

# Vérifier que PAYSTACK_SECRET_KEY existe
grep PAYSTACK_SECRET_KEY .env.production

# DOIT retourner quelque chose comme:
# PAYSTACK_SECRET_KEY="sk_live_XXXXXXXXXXXXX"
```

### 2. Vérifier le format de la clé

La clé DOIT :
- ✅ Commencer par `sk_live_` (production) ou `sk_test_` (développement)
- ✅ Avoir environ 50-60 caractères
- ✅ Être entre guillemets dans le fichier `.env.production`

**Format correct** :
```bash
PAYSTACK_SECRET_KEY="sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

**Formats INCORRECTS** ❌ :
```bash
PAYSTACK_SECRET_KEY=sk_live_... # Manque les guillemets
PAYSTACK_SECRET_KEY="" # Vide
PAYSTACK_SECRET_KEY="sk_test_..." # Mode test en production
PAYSTACK_SECRET_KEY="pk_live_..." # Clé publique au lieu de secrète
```

---

## ✅ Solution : Configurer la Clé Correcte

### Étape 1 : Obtenir la clé LIVE depuis Paystack

1. **Se connecter au dashboard Paystack** :
   ```
   https://dashboard.paystack.com
   ```

2. **Aller dans Settings → Developer/API** :
   ```
   https://dashboard.paystack.com/settings/developer
   ```

3. **Copier la "Secret Key LIVE"** :
   - 🔴 **IMPORTANT** : Utilisez la clé **LIVE** (commence par `sk_live_`)
   - ⚠️ **NE PAS** utiliser la clé TEST en production

### Étape 2 : Configurer sur le VPS

```bash
# Se connecter au VPS
ssh user@vps
cd /path/to/sorami/front

# Éditer le fichier .env.production
nano .env.production

# Ajouter ou modifier la ligne (avec la vraie clé) :
PAYSTACK_SECRET_KEY="sk_live_VOTRE_VRAIE_CLE_ICI"

# Sauvegarder : Ctrl+X, puis Y, puis Entrée
```

### Étape 3 : Redémarrer l'application

```bash
# Avec PM2
pm2 restart ecosystem.config.js

# OU avec Docker
docker-compose restart

# Vérifier les logs
pm2 logs sorami-front --lines 50
```

### Étape 4 : Vérifier que ça fonctionne

```bash
# Test 1 : Vérifier l'API plans
curl https://votre-domaine.com/api/plans

# Test 2 : Vérifier la configuration
node scripts/check-paystack-config.mjs
```

---

## 🧪 Script de Vérification Automatique

Utilisez le nouveau script créé pour diagnostiquer :

```bash
node scripts/check-paystack-config.mjs
```

**Résultat attendu** :
```
✅ Configuration Paystack parfaite !
✓ Mode PRODUCTION (sk_live_)
✓ Connexion API réussie
✓ 4 plan(s) trouvé(s) sur Paystack
```

**Si erreur** :
```
❌ ERREUR 401: Clé API invalide ou expirée
```
→ Retournez à l'Étape 1 pour obtenir une nouvelle clé

---

## 🔧 Corrections Appliquées au Code

### 1. Validation stricte de la clé (API)

**Fichier** : `src/app/api/subscriptions/initialize/route.ts`

**Avant** :
```typescript
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
// Pas de validation
```

**Après** :
```typescript
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';

// ✅ Validation stricte
if (!SECRET || SECRET === '') {
  return NextResponse.json({ 
    error: 'Configuration Paystack manquante' 
  }, { status: 503 });
}

// ✅ Vérification du format
if (!SECRET.startsWith('sk_test_') && !SECRET.startsWith('sk_live_')) {
  return NextResponse.json({ 
    error: 'Configuration Paystack invalide' 
  }, { status: 503 });
}
```

### 2. Messages d'erreur détaillés

**Avant** :
```typescript
if (!initResponse.ok) {
  return NextResponse.json({ 
    error: 'Erreur lors de l\'initialisation du paiement' 
  });
}
```

**Après** :
```typescript
if (!initResponse.ok) {
  let userMessage = 'Erreur lors de l\'initialisation du paiement';
  
  if (initResponse.status === 401) {
    userMessage = 'Erreur d\'authentification Paystack';
    console.error('🔴 CRITIQUE: Clé Paystack invalide !');
  } else if (initResponse.status === 400) {
    userMessage = errorData.message || 'Données invalides';
  }
  
  return NextResponse.json({ 
    error: userMessage,
    details: errorData.message,
    status: initResponse.status
  }, { status: initResponse.status });
}
```

### 3. Logging détaillé

```typescript
// Log masqué pour sécurité
const keyPrefix = SECRET.substring(0, 10);
console.log(`🔑 Utilisation clé Paystack: ${keyPrefix}...`);

// Log des transactions
console.log(`📡 Initialisation transaction pour ${user.email}`);
```

---

## 🚨 Checklist de Résolution

- [ ] Clé Paystack LIVE obtenue depuis dashboard
- [ ] Clé ajoutée dans `.env.production` sur le VPS
- [ ] Format vérifié (commence par `sk_live_`)
- [ ] Application redémarrée (PM2 ou Docker)
- [ ] Script de vérification exécuté (✅ vert)
- [ ] API `/api/plans` testée (200 OK)
- [ ] Test de souscription effectué (page /pricing)
- [ ] Logs vérifiés (pas d'erreur 401)

---

## 🔄 Test de Paiement Complet

### 1. Test de souscription

```bash
# Naviguer vers la page pricing
https://votre-domaine.com/pricing

# Cliquer sur "Souscrire" pour un plan
# → Doit rediriger vers Paystack (pas d'erreur)
```

### 2. Vérifier les logs en temps réel

```bash
pm2 logs sorami-front --lines 0 --raw
# Puis effectuer la souscription
```

**Logs attendus** :
```
🔑 Utilisation clé Paystack: sk_live_a1...
📡 Initialisation transaction pour user@example.com - Plan: Standard
✅ Transaction initialisée avec succès
```

**Logs d'ERREUR** :
```
❌ Erreur initialisation transaction Paystack
🔴 CRITIQUE: Clé Paystack invalide ou expirée !
```
→ Vérifier la clé

---

## 🎯 Configuration Webhook (Bonus)

Pour que les abonnements se renouvellent automatiquement :

### 1. Configurer l'URL du webhook sur Paystack

```
https://dashboard.paystack.com/settings/developer
→ Webhook URL: https://votre-domaine.com/api/webhooks/paystack
```

### 2. Ajouter le secret webhook

```bash
# Dans .env.production
PAYSTACK_WEBHOOK_SECRET="votre_secret_webhook_paystack"
```

### 3. Tester le webhook

```bash
# Paystack envoie un webhook de test
# Vérifier les logs :
pm2 logs sorami-front | grep webhook
```

---

## 📊 Métriques de Succès

Après correction, vous devriez voir :

| Métrique | Avant | Après |
|----------|-------|-------|
| Erreur "Invalid key" | 🔴 100% | ✅ 0% |
| Initialisation paiement | ❌ Échec | ✅ Succès |
| Redirection Paystack | ❌ Non | ✅ Oui |
| Webhooks | ⚠️ Non reçus | ✅ Reçus |

---

## 💡 Prévention Future

### 1. Ajouter au monitoring

```bash
# Créer un script de health check
#!/bin/bash
if ! node scripts/check-paystack-config.mjs > /dev/null 2>&1; then
  echo "⚠️ ALERTE: Configuration Paystack invalide !"
  # Envoyer notification (email, Slack, etc.)
fi
```

### 2. Documenter dans .env.example

```bash
# .env.production.example
# IMPORTANT: Utilisez UNIQUEMENT les clés LIVE en production
PAYSTACK_SECRET_KEY="sk_live_XXXXXXXXXXXXX" # Obtenir sur dashboard.paystack.com
PAYSTACK_PUBLIC_KEY="pk_live_XXXXXXXXXXXXX"
```

### 3. Vérification pré-déploiement

```bash
# Ajouter au script pre-deploy-check.sh
./scripts/check-paystack-config.mjs || exit 1
```

---

## 🆘 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifier le status Paystack** :
   ```
   https://status.paystack.com
   ```

2. **Contacter le support Paystack** :
   ```
   https://paystack.com/contact
   support@paystack.com
   ```

3. **Vérifier les logs complets** :
   ```bash
   pm2 logs sorami-front --lines 500 > paystack-error.log
   ```

---

**Temps estimé de résolution** : 5-10 minutes  
**Complexité** : ⭐ (Très facile)  
**Impact** : 🔴 CRITIQUE (bloque les paiements)  
**Statut après correction** : ✅ Production-ready
