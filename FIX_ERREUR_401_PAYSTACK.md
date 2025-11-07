# 🔴 ERREUR 401 - Clé Paystack invalide

## ❌ Problème identifié

Votre clé Paystack actuelle retourne une erreur **401 Unauthorized - Invalid key** :

```
PAYSTACK_SECRET_KEY="sk_test_2749f1ff42e542e4911c31dfc1e9e46cd477a1fa"
```

**Erreur Paystack** :
```json
{
  "status": false,
  "message": "Invalid key",
  "type": "validation_error",
  "code": "invalid_Key"
}
```

## 🔧 Solution immédiate

### Étape 1 : Obtenir une nouvelle clé Paystack

1. **Connectez-vous au dashboard Paystack**
   - URL : https://dashboard.paystack.com
   - Utilisez vos identifiants Paystack

2. **Accédez aux clés API**
   - Cliquez sur **Settings** (⚙️ en haut à droite)
   - Allez dans **API Keys & Webhooks**

3. **Copiez la clé Test Secret Key**
   - Format : `sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - ⚠️ **NE PAS** copier la clé Live (sk_live_xxx) pour le développement

4. **Copiez aussi la Test Public Key**
   - Format : `pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Étape 2 : Mettre à jour vos fichiers .env

#### Option A : Modifier `.env.local` (RECOMMANDÉ)

Ouvrez `/Users/inoverfly/Documents/qg-projects/sorami/front/.env.local` et remplacez :

```bash
# Paystack (Facturation)
PAYSTACK_SECRET_KEY="VOTRE_NOUVELLE_CLE_sk_test_xxx"
PAYSTACK_PUBLIC_KEY="VOTRE_NOUVELLE_CLE_PUBLIQUE_pk_test_xxx"
PAYSTACK_WEBHOOK_SECRET="VOTRE_NOUVELLE_CLE_sk_test_xxx"
```

#### Option B : Modifier `.env`

Ouvrez `/Users/inoverfly/Documents/qg-projects/sorami/front/.env` et remplacez :

```bash
# Paystack (Test)
PAYSTACK_SECRET_KEY="VOTRE_NOUVELLE_CLE_sk_test_xxx"
PAYSTACK_PUBLIC_KEY="VOTRE_NOUVELLE_CLE_PUBLIQUE_pk_test_xxx"
PAYSTACK_WEBHOOK_SECRET="VOTRE_NOUVELLE_CLE_sk_test_xxx"
```

### Étape 3 : Redémarrer le serveur

```bash
# Dans votre terminal
# 1. Arrêter le serveur (Ctrl + C)

# 2. Relancer le serveur
npm run dev
```

### Étape 4 : Tester le Pack Créateur

1. Ouvrez http://localhost:3000/pricing
2. Cliquez sur **"Acheter le Pack Créateur"**
3. Vous devriez être redirigé vers Paystack (pas d'erreur 401)
4. Testez avec la carte : **4084 0840 8408 4081** | CVV: **408** | OTP: **123456**

## 🧪 Vérifier la nouvelle clé

Après avoir mis à jour la clé, testez-la avec le script :

```bash
./test-paystack-key.sh
```

**Résultat attendu** :
```
✓ Format valide : Mode TEST (sk_test_xxx)
✓ Clé valide : Connexion API réussie (200 OK)
✓ Initialisation de transaction : OK
🎉 Votre clé Paystack est VALIDE et fonctionnelle !
```

## 🚨 Si vous n'avez pas de compte Paystack

### Créer un compte gratuitement

1. Allez sur **https://paystack.com**
2. Cliquez sur **Sign Up**
3. Remplissez le formulaire :
   - **Email**
   - **Nom de l'entreprise** : Sorami
   - **Pays** : Nigeria, Ghana, South Africa, etc.
4. Vérifiez votre email
5. Connectez-vous au dashboard
6. Suivez les étapes ci-dessus pour récupérer vos clés API

**Note** : Le mode test est **gratuit** et **sans limite** pour les tests de développement.

## 🔍 Vérification manuelle de la clé

Vous pouvez vérifier manuellement si votre clé est valide avec `curl` :

```bash
curl https://api.paystack.co/plan \
  -H "Authorization: Bearer VOTRE_CLE_sk_test_xxx" \
  -H "Content-Type: application/json"
```

**Résultats possibles** :
- ✅ **200 OK** + JSON avec des plans → Clé valide
- ❌ **401 Unauthorized** → Clé invalide (refaire les étapes ci-dessus)

## 📋 Checklist de résolution

- [ ] 1. Connecté au dashboard Paystack (https://dashboard.paystack.com)
- [ ] 2. Récupéré la nouvelle Test Secret Key (sk_test_xxx)
- [ ] 3. Récupéré la nouvelle Test Public Key (pk_test_xxx)
- [ ] 4. Mis à jour `.env.local` ou `.env`
- [ ] 5. Redémarré le serveur (`npm run dev`)
- [ ] 6. Testé le script `./test-paystack-key.sh` ✅
- [ ] 7. Testé l'achat Pack Créateur sur /pricing ✅
- [ ] 8. Paiement Paystack fonctionne ✅

## 🆘 Toujours bloqué ?

### Problème : Erreur 401 même avec une nouvelle clé

**Causes possibles** :
1. Espaces avant/après la clé dans .env
2. Guillemets mal formatés
3. Fichier .env non chargé (vérifier le redémarrage)
4. Mauvaise clé copiée (Live au lieu de Test)

**Solution** :
```bash
# 1. Vérifier le format exact dans .env.local
cat .env.local | grep PAYSTACK_SECRET_KEY

# Devrait afficher :
# PAYSTACK_SECRET_KEY="sk_test_xxx"
# (sans espaces, avec guillemets)

# 2. Tuer tous les processus Node
pkill -f node

# 3. Relancer
npm run dev
```

### Problème : Pas de dashboard Paystack accessible

Si vous ne pouvez pas accéder au dashboard :
1. Vérifiez que vous utilisez le bon compte email
2. Réinitialisez votre mot de passe : https://dashboard.paystack.com/forgot-password
3. Contactez le support Paystack : support@paystack.com

## 📚 Documentation utile

- **Guide complet** : `GUIDE_FIX_PAYSTACK_KEY.md`
- **Script de test** : `./test-paystack-key.sh`
- **Documentation Paystack** : https://paystack.com/docs/api/
- **Dashboard Paystack** : https://dashboard.paystack.com

---

## ⚡ Résumé en 3 étapes

1. **Récupérer nouvelle clé** → dashboard.paystack.com/settings/api-keys
2. **Mettre à jour .env.local** → `PAYSTACK_SECRET_KEY="sk_test_NOUVELLE_CLE"`
3. **Redémarrer serveur** → `npm run dev`

**Une fois fait, votre Pack Créateur fonctionnera ! 🚀**
