# Guide de Test - Cycle de Facturation Mensuel/Annuel

## 🎯 Objectif
Tester la nouvelle fonctionnalité permettant aux utilisateurs de choisir entre un paiement mensuel ou annuel avec 20% de réduction sur l'annuel.

## 📍 Pages à Tester

### 1. Page d'Accueil (/)
**URL** : `http://localhost:3000/` ou `https://sorami.app/`

**Tests** :
- [ ] Le toggle Mensuel/Annuel s'affiche correctement
- [ ] Badge "-20%" visible sur le bouton "Annuel"
- [ ] Par défaut, "Mensuel" est sélectionné
- [ ] Cliquer sur "Annuel" change les prix affichés
- [ ] Plans STANDARD et CRÉATEUR affichent les calculs corrects

**Calculs attendus** :

| Plan | Mensuel | Annuel | Équivalent Mensuel |
|------|---------|--------|-------------------|
| STANDARD | 15 000 F/mois | 144 000 F/an | 12 000 F/mois |
| CRÉATEUR | 35 000 F/mois | 336 000 F/an | 28 000 F/mois |

### 2. Page Tarification (/pricing)
**URL** : `http://localhost:3000/pricing` ou `https://sorami.app/pricing`

**Tests** :
- [ ] Le toggle Mensuel/Annuel s'affiche au-dessus des plans
- [ ] Badge "-20%" visible
- [ ] Changement de cycle met à jour les prix en temps réel
- [ ] Badge "✨ Économisez 20% avec le paiement annuel" apparaît en mode annuel
- [ ] Équivalent mensuel affiché en mode annuel

## 🧪 Tests de Paiement

### Test 1 : Abonnement Mensuel STANDARD

**Étapes** :
1. Aller sur `/pricing`
2. S'assurer que "Mensuel" est sélectionné
3. Cliquer sur "Souscrire STANDARD"
4. Vérifier la redirection Paystack
5. Sur Paystack, vérifier le montant : **15 000 F**
6. Compléter le paiement avec une carte test

**Carte de test Paystack** :
```
Numéro : 5060 6666 6666 6666 666
CVV : 123
Expiration : 01/30
PIN : 1234
OTP : 123456
```

**Résultat attendu** :
- Transaction de 15 000 F
- Abonnement récurrent créé dans Paystack Dashboard
- Webhook `subscription.create` reçu
- Redirection vers `/paystack/callback?reference=xxx`

### Test 2 : Abonnement Annuel STANDARD

**Étapes** :
1. Aller sur `/pricing`
2. Sélectionner "Annuel"
3. Vérifier que le prix affiché est **144 000 F/an (soit 12 000 F/mois)**
4. Cliquer sur "Souscrire STANDARD"
5. Vérifier la redirection Paystack
6. Sur Paystack, vérifier le montant : **144 000 F**
7. Compléter le paiement

**Résultat attendu** :
- Transaction de 144 000 F
- **PAS** d'abonnement récurrent dans Paystack
- Webhook `charge.success` reçu
- Dans les métadonnées : `billingCycle: "annually"`

### Test 3 : Abonnement Mensuel CRÉATEUR

**Étapes** :
1. Sélectionner "Mensuel"
2. Cliquer sur "Souscrire CRÉATEUR"
3. Vérifier : **35 000 F**

### Test 4 : Abonnement Annuel CRÉATEUR

**Étapes** :
1. Sélectionner "Annuel"
2. Cliquer sur "Souscrire CRÉATEUR"
3. Vérifier : **336 000 F/an (soit 28 000 F/mois)**

## 🔍 Vérifications Backend

### 1. Vérifier les Logs
```bash
# Si déployé
https://sorami.app/dashboard/logs

# Local
npm run dev
# Vérifier la console du terminal
```

### 2. Vérifier Paystack Dashboard
1. Aller sur https://dashboard.paystack.com
2. Section **Transactions** : Voir les paiements
3. Section **Subscriptions** : Voir les abonnements récurrents
4. Section **Webhooks** : Voir les événements reçus

### 3. Vérifier la Base de Données
```sql
-- Voir les abonnements
SELECT * FROM PaystackSubscription 
ORDER BY createdAt DESC 
LIMIT 10;

-- Vérifier les métadonnées
SELECT 
  id, 
  userId, 
  status, 
  amount,
  -- Si la colonne billingCycle existe
  billingCycle,
  createdAt
FROM PaystackSubscription;
```

## 📱 Tests Responsive

### Mobile (< 768px)
- [ ] Toggle s'affiche en 2 colonnes
- [ ] Boutons lisibles et cliquables
- [ ] Prix et badges s'affichent correctement

### Tablette (768px - 1024px)
- [ ] Layout adapté
- [ ] Cartes de plans bien espacées

### Desktop (> 1024px)
- [ ] Toggle centré
- [ ] Grille de plans optimale (2-3 colonnes)

## 🐛 Scénarios d'Erreur à Tester

### 1. Utilisateur Non Connecté
**Action** : Essayer de souscrire sans être connecté
**Résultat attendu** : Message "Vous devez être connecté pour souscrire"

### 2. Utilisateur Déjà Abonné
**Action** : Essayer de souscrire alors qu'un abonnement est actif
**Résultat attendu** : Message "Vous avez déjà un abonnement actif"

### 3. Échec Paystack
**Action** : Utiliser une carte qui échoue
**Carte test qui échoue** : `5060 6666 6666 6666 665`
**Résultat attendu** : Message d'erreur, pas de création d'abonnement

### 4. Annulation de Paiement
**Action** : Fermer la fenêtre Paystack avant de payer
**Résultat attendu** : Retour à `/pricing`, pas de transaction créée

## 📊 Métriques à Surveiller

Après le déploiement, surveiller :

1. **Taux de conversion par cycle**
   - % d'utilisateurs choisissant "Annuel"
   - % d'utilisateurs choisissant "Mensuel"

2. **Abandons de paiement**
   - Nombre de redirections Paystack vs paiements complétés

3. **Revenu par type**
   - Revenu total mensuel
   - Revenu total annuel

4. **Erreurs**
   - Vérifier `/dashboard/logs` pour toute erreur
   - Vérifier les webhooks non reçus

## ✅ Checklist Finale

Avant de valider la fonctionnalité :

- [ ] Tests manuels complets (mensuel + annuel)
- [ ] Vérification Paystack Dashboard
- [ ] Vérification Base de Données
- [ ] Tests responsive (mobile + desktop)
- [ ] Tests d'erreur
- [ ] Webhooks fonctionnels
- [ ] Logs propres (pas d'erreurs)
- [ ] Documentation à jour

## 🚀 Commandes Utiles

### Démarrer en Local
```bash
npm run dev
# Ouvrir http://localhost:3000
```

### Voir les Logs
```bash
# Logs temps réel
tail -f ~/.pm2/logs/sorami-frontend-out.log

# Logs d'erreur
tail -f ~/.pm2/logs/sorami-frontend-error.log
```

### Déployer
```bash
git push origin main
ssh sorami@178.xxx.xxx.xxx
cd ~/sorami
./deploy.sh production
```

## 🆘 Résolution de Problèmes

### Les prix ne changent pas
**Cause** : État React non mis à jour
**Solution** : Vérifier que `billingCycle` change bien avec `console.log(billingCycle)`

### Paiement annuel crée un abonnement récurrent
**Cause** : `plan.paystackId` envoyé même en mode annuel
**Solution** : Vérifier que `billingCycle === 'monthly'` avant d'ajouter `plan`

### Webhook non reçu
**Cause** : URL webhook incorrecte ou serveur inaccessible
**Solution** : 
1. Vérifier `NEXT_PUBLIC_WEBHOOK_URL` dans `.env.production`
2. Tester avec `curl https://sorami.app/api/webhooks/paystack`

---

**Créé le** : 1er novembre 2025  
**Auteur** : Équipe Sorami
