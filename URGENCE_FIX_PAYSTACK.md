# 🚨 URGENCE - Clé Paystack invalide

## ❌ Erreur actuelle

```
❌ Erreur initialisation transaction Paystack: {
  status: 401,
  statusText: 'Unauthorized',
  error: { message: 'Invalid key', code: 'invalid_Key' }
}
🔴 CRITIQUE: Clé Paystack invalide ou expirée !
```

**Clé détectée** : `sk_test_2749f1ff42e542e4911c31dfc1e9e46cd477a1fa`

---

## ✅ Solution en 3 minutes

### 1️⃣ Obtenir une nouvelle clé (2 min)

🔗 **Ouvrir** : https://dashboard.paystack.com/settings/api-keys

📝 **Copier** :
- **Test Secret Key** → commence par `sk_test_xxx`
- **Test Public Key** → commence par `pk_test_xxx`

### 2️⃣ Mettre à jour .env.local (30 secondes)

Ouvrir le fichier : `/Users/inoverfly/Documents/qg-projects/sorami/front/.env.local`

**Remplacer** :
```bash
# Avant (INVALIDE)
PAYSTACK_SECRET_KEY="sk_test_2749f1ff42e542e4911c31dfc1e9e46cd477a1fa"
PAYSTACK_PUBLIC_KEY="pk_test_8a1781a25da84d0b7dd7fd744c16cccc480e5a02"

# Après (NOUVELLE CLÉ)
PAYSTACK_SECRET_KEY="sk_test_VOTRE_NOUVELLE_CLE"
PAYSTACK_PUBLIC_KEY="pk_test_VOTRE_NOUVELLE_CLE_PUBLIQUE"
```

### 3️⃣ Redémarrer le serveur (30 secondes)

Dans votre terminal :
```bash
# Arrêter le serveur (Ctrl + C)
# Puis relancer
npm run dev
```

---

## 🧪 Tester la correction

### Option 1 : Tester avec le script
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

### Option 2 : Tester le Pack Créateur
1. Ouvrir http://localhost:3000/pricing
2. Cliquer "Acheter le Pack Créateur"
3. ✅ Redirection vers Paystack (pas d'erreur 401)
4. Tester avec carte : `4084 0840 8408 4081` | CVV: `408`

---

## 🆘 Pas de compte Paystack ?

### Créer un compte gratuit (5 min)

1. **Aller sur** : https://paystack.com
2. **Cliquer** : Sign Up (en haut à droite)
3. **Remplir** :
   - Email
   - Nom entreprise : Sorami
   - Pays : Nigeria / Ghana / South Africa
4. **Vérifier** l'email
5. **Se connecter** au dashboard
6. **Récupérer** les clés (Settings → API Keys)

**Note** : Le mode test est **100% gratuit**, aucune carte bancaire requise.

---

## 📋 Checklist rapide

- [ ] Connecté à https://dashboard.paystack.com ✅
- [ ] Copié la nouvelle Test Secret Key (sk_test_xxx) ✅
- [ ] Copié la nouvelle Test Public Key (pk_test_xxx) ✅
- [ ] Mis à jour `.env.local` ✅
- [ ] Redémarré le serveur (`npm run dev`) ✅
- [ ] Testé avec `./test-paystack-key.sh` → Clé valide ✅
- [ ] Testé sur `/pricing` → Redirection Paystack OK ✅

---

## 🔍 Vérification manuelle

Si vous voulez vérifier manuellement :

```bash
# Tester la clé directement
curl https://api.paystack.co/plan \
  -H "Authorization: Bearer sk_test_VOTRE_NOUVELLE_CLE" \
  -H "Content-Type: application/json"

# Résultat attendu : 200 OK + JSON avec des plans
```

---

## 📚 Documentation détaillée

- 📖 **Guide complet** : `FIX_ERREUR_401_PAYSTACK.md`
- 🔧 **Guide technique** : `GUIDE_FIX_PAYSTACK_KEY.md`
- 🧪 **Script de test** : `./test-paystack-key.sh`

---

## ⏱️ Temps total : ~3 minutes

**Une fois la clé mise à jour, le Pack Créateur fonctionnera immédiatement ! 🚀**

---

## 💡 Pourquoi cette erreur ?

Les clés Paystack peuvent devenir invalides si :
1. ❌ Clé révoquée sur le dashboard
2. ❌ Clé expirée (rare en mode test)
3. ❌ Compte Paystack suspendu
4. ❌ Erreur de copier-coller (espaces, mauvais format)
5. ❌ Mauvais environnement (dev vs prod)

**Solution** : Toujours utiliser une clé fraîche du dashboard.
