# 🔑 Guide : Obtenir une nouvelle clé Paystack

## Problème actuel
La clé Paystack `sk_test_2749f1ff42e542e4911c31dfc1e9e46cd477a1fa` retourne une erreur **401 Unauthorized - Invalid key**.

## Solution : Obtenir une nouvelle clé

### Étape 1 : Se connecter au dashboard Paystack
1. Allez sur **https://dashboard.paystack.com**
2. Connectez-vous avec votre compte

### Étape 2 : Récupérer les clés API
1. Cliquez sur **Settings** (⚙️ en haut à droite)
2. Allez dans **API Keys & Webhooks**
3. Vous verrez :
   - **Test Secret Key** (commence par `sk_test_`)
   - **Test Public Key** (commence par `pk_test_`)
   - **Live Secret Key** (commence par `sk_live_`) - NE PAS utiliser en dev

### Étape 3 : Copier les clés
```bash
# Copier ces valeurs depuis le dashboard Paystack
Test Secret Key: sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Test Public Key: pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Étape 4 : Mettre à jour vos fichiers .env

#### Dans `.env` :
```bash
# Paystack (Test)
PAYSTACK_SECRET_KEY="sk_test_VOTRE_NOUVELLE_CLE"
PAYSTACK_PUBLIC_KEY="pk_test_VOTRE_NOUVELLE_CLE_PUBLIQUE"
PAYSTACK_WEBHOOK_SECRET="sk_test_VOTRE_NOUVELLE_CLE"  # Ou un secret dédié
```

#### Dans `.env.local` :
```bash
# Paystack (Facturation)
PAYSTACK_SECRET_KEY="sk_test_VOTRE_NOUVELLE_CLE"
PAYSTACK_PUBLIC_KEY="pk_test_VOTRE_NOUVELLE_CLE_PUBLIQUE"
PAYSTACK_WEBHOOK_SECRET="sk_test_VOTRE_NOUVELLE_CLE"  # Ou un secret dédié
```

### Étape 5 : Redémarrer le serveur
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### Étape 6 : Tester à nouveau
```bash
# Aller sur http://localhost:3000/pricing
# Cliquer sur "Acheter Pack Créateur"
# Vous devriez être redirigé vers Paystack
```

## 🔍 Vérification de la clé

Pour vérifier si une clé Paystack est valide :

```bash
curl https://api.paystack.co/plan \
  -H "Authorization: Bearer sk_test_VOTRE_CLE" \
  -H "Content-Type: application/json"
```

**Résultat attendu** :
- ✅ **200 OK** : Clé valide
- ❌ **401 Unauthorized** : Clé invalide/expirée

## 🆘 Pas de compte Paystack ?

### Créer un compte Paystack
1. Allez sur **https://paystack.com**
2. Cliquez sur **Sign Up** (en haut à droite)
3. Remplissez le formulaire :
   - Email
   - Nom de l'entreprise
   - Pays (Nigeria, Ghana, South Africa, etc.)
4. Vérifiez votre email
5. Connectez-vous au dashboard
6. Allez dans **Settings → API Keys**

### Compte de test (mode sandbox)
- Paystack offre un **mode test gratuit** sans limite
- Vous pouvez tester les paiements avec des cartes de test
- Aucune vérification KYC requise pour le mode test

## 🧪 Cartes de test Paystack

Une fois votre clé configurée, utilisez ces cartes pour tester :

### Carte de succès
```
Numéro : 4084 0840 8408 4081
CVV : 408
Date : N'importe quelle date future
PIN : 0000
OTP : 123456
```

### Carte d'échec
```
Numéro : 5060 6666 6666 6666 4081
CVV : 123
```

## 🔐 Sécurité

### ⚠️ Important
1. **JAMAIS** commiter vos clés Paystack dans Git
2. Toujours utiliser des variables d'environnement
3. Ajouter `.env` et `.env.local` dans `.gitignore`
4. En production, utiliser les clés **Live** (sk_live_xxx)
5. Activer la vérification 2FA sur votre compte Paystack

### Vérifier .gitignore
```bash
# Vérifier que .env est ignoré
cat .gitignore | grep .env

# Devrait afficher :
# .env
# .env.local
# .env*.local
```

## 📝 Checklist finale

- [ ] Compte Paystack créé/vérifié
- [ ] Clés API récupérées depuis le dashboard
- [ ] `.env` et `.env.local` mis à jour
- [ ] Serveur redémarré
- [ ] Test avec carte Paystack (4084 0840 8408 4081)
- [ ] Paiement réussi = Clés valides ✅

## 🆘 Toujours bloqué ?

Si vous obtenez toujours une erreur 401 après avoir mis à jour les clés :

1. **Vérifiez le format** :
   ```bash
   # La clé doit commencer par sk_test_ ou sk_live_
   # Exemple valide : sk_test_abc123def456...
   ```

2. **Pas d'espace ni guillemets en trop** :
   ```bash
   # ❌ Incorrect
   PAYSTACK_SECRET_KEY=" sk_test_xxx "
   
   # ✅ Correct
   PAYSTACK_SECRET_KEY="sk_test_xxx"
   ```

3. **Redémarrer COMPLÈTEMENT le serveur** :
   ```bash
   # Tuer tous les processus Node
   pkill -f node
   
   # Relancer
   npm run dev
   ```

4. **Tester la clé manuellement** :
   ```bash
   curl https://api.paystack.co/transaction/verify/invalid_ref \
     -H "Authorization: Bearer VOTRE_CLE"
   
   # Si vous obtenez une réponse (même erreur 400), la clé est valide
   # Si 401 Unauthorized, la clé est invalide
   ```

---

**Une fois les clés mises à jour, tout devrait fonctionner ! 🚀**
