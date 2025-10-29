# 🧪 Guide de Test - Système de Crédits

## 📋 Prérequis

1. Serveur Next.js démarré : `npm run dev`
2. Compte utilisateur créé avec des crédits
3. Backend Flask/CrewAI opérationnel (optionnel pour tester les erreurs 402)

## 🎯 Scénarios de Test

### Test 1 : Vérifier le Solde Initial

**Objectif** : S'assurer que l'utilisateur a des crédits

**Étapes** :
1. Se connecter à l'application
2. Aller sur `/dashboard`
3. Vérifier la section "Crédits disponibles"

**Résultat attendu** :
```
Crédits disponibles : 100 (ou autre montant)
```

### Test 2 : Génération d'Images avec Crédits Suffisants

**Coût** : 1 crédit par image

**Étapes** :
1. Aller sur `/generate-images` ou `/dashboard/ecommerce-images`
2. Générer **1 image** (vérifier le solde avant)
3. Attendre la soumission
4. Retourner sur `/dashboard`

**Résultat attendu** :
```
Avant : 100 crédits
Après : 99 crédits (100 - 1)

Historique :
✅ "Génération image (1x)" : -1 crédit
```

**Test avec plusieurs images** :
- Générer 5 images
- Coût : 5 × 1 = 5 crédits
- Nouveau solde : 99 - 5 = 94 crédits

### Test 3 : Génération de Vidéo avec Crédits Suffisants

**Coût** : 5 crédits par vidéo

**Étapes** :
1. Aller sur `/generate-videos`
2. Solde actuel : 94 crédits
3. Générer **2 vidéos**
4. Retourner sur `/dashboard`

**Résultat attendu** :
```
Avant : 94 crédits
Après : 84 crédits (94 - 10)

Historique :
✅ "Génération video (2x)" : -10 crédits
```

### Test 4 : Article de Blog avec Crédits Suffisants

**Coût** : 2 crédits par article

**Étapes** :
1. Aller sur `/blog`
2. Solde actuel : 84 crédits
3. Cliquer "Générer un article"
4. Remplir le formulaire
5. Retourner sur `/dashboard`

**Résultat attendu** :
```
Avant : 84 crédits
Après : 82 crédits (84 - 2)

Historique :
✅ "Génération blog (1x)" : -2 crédits
```

### Test 5 : Ebook avec Crédits Suffisants

**Coût** : 10 crédits par livre

**Étapes** :
1. Aller sur `/books`
2. Solde actuel : 82 crédits
3. Cliquer "Créer un nouveau livre"
4. Remplir le formulaire
5. Retourner sur `/dashboard`

**Résultat attendu** :
```
Avant : 82 crédits
Après : 72 crédits (82 - 10)

Historique :
✅ "Génération book (1x)" : -10 crédits
```

### Test 6 : ⚠️ Crédits Insuffisants - Image

**Objectif** : Vérifier le blocage quand pas assez de crédits

**Étapes** :
1. Vérifier le solde (ex: 72 crédits)
2. Essayer de générer **100 images** (coût: 100 crédits)

**Résultat attendu** :
```
❌ Erreur HTTP 402 Payment Required

Message :
"Crédits insuffisants (disponibles: 72, requis: 100)"

Détails :
{
  "error": "Insufficient credits",
  "message": "Crédits insuffisants (disponibles: 72, requis: 100)",
  "creditsAvailable": 72,
  "creditsRequired": 100
}
```

**Vérifications** :
- ✅ Le solde reste à 72 (aucune déduction)
- ✅ Aucune entrée dans l'historique
- ✅ Aucun job créé en base de données

### Test 7 : ⚠️ Crédits Insuffisants - Vidéo

**Étapes** :
1. Solde actuel : 72 crédits
2. Essayer de générer **20 vidéos** (coût: 20 × 5 = 100 crédits)

**Résultat attendu** :
```
❌ Erreur 402
Message : "Crédits insuffisants (disponibles: 72, requis: 100)"
```

### Test 8 : ⚠️ Crédits Insuffisants - Ebook

**Étapes** :
1. Solde actuel : 72 crédits
2. Créer un compte avec **5 crédits** seulement
3. Essayer de générer **1 ebook** (coût: 10 crédits)

**Résultat attendu** :
```
❌ Erreur 402
Message : "Crédits insuffisants (disponibles: 5, requis: 10)"
```

### Test 9 : Vérifier l'Historique Complet

**Étapes** :
1. Aller sur `/dashboard`
2. Consulter l'historique des transactions

**Résultat attendu** :
```
Date         | Description              | Montant
---------------------------------------------------
15/01 10:45  | Génération book (1x)     | -10
15/01 10:40  | Génération blog (1x)     | -2
15/01 10:35  | Génération video (2x)    | -10
15/01 10:30  | Génération image (5x)    | -5
15/01 10:25  | Génération image (1x)    | -1
---------------------------------------------------
Total utilisé : 28 crédits
Solde actuel : 72 crédits
```

### Test 10 : Génération Multiple Rapide

**Objectif** : Tester les transactions concurrentes

**Étapes** :
1. Ouvrir **2 onglets** du navigateur
2. Dans les 2 onglets, aller sur `/generate-images`
3. **Simultanément**, générer 5 images dans chaque onglet
4. Vérifier le solde

**Résultat attendu** :
```
Avant : 72 crédits
Requête 1 : 5 images = -5 crédits
Requête 2 : 5 images = -5 crédits
Après : 62 crédits

✅ Pas de "race condition"
✅ Les 2 transactions sont enregistrées
```

## 🔍 Vérifications en Base de Données

### Vérifier les Crédits Utilisateur

```sql
-- Prisma Studio
SELECT id, name, email, credits, totalCreditsUsed 
FROM User 
WHERE email = 'votre@email.com';

-- Résultat attendu :
-- credits: 62
-- totalCreditsUsed: 38
```

### Vérifier l'Historique

```sql
SELECT * FROM CreditTransaction 
WHERE userId = 'votre_user_id' 
ORDER BY createdAt DESC;

-- Résultat attendu :
-- Toutes les transactions avec type = 'USAGE'
-- Montants négatifs (-1, -2, -5, -10)
-- Descriptions correctes
```

## 📊 Tableau Récapitulatif

| Test | Type | Coût | Solde Avant | Solde Après | Statut |
|------|------|------|-------------|-------------|--------|
| 1 | Solde initial | - | - | 100 | ✅ |
| 2 | 1 image | 1 | 100 | 99 | ✅ |
| 2b | 5 images | 5 | 99 | 94 | ✅ |
| 3 | 2 vidéos | 10 | 94 | 84 | ✅ |
| 4 | 1 blog | 2 | 84 | 82 | ✅ |
| 5 | 1 ebook | 10 | 82 | 72 | ✅ |
| 6 | 100 images | 100 | 72 | 72 | ❌ 402 |
| 7 | 20 vidéos | 100 | 72 | 72 | ❌ 402 |
| 8 | 1 ebook (5 crédits) | 10 | 5 | 5 | ❌ 402 |
| 9 | Historique | - | - | - | ✅ |
| 10 | Concurrent | 10 | 72 | 62 | ✅ |

## 🐛 Débogage

### Problème : Les crédits ne se décomptent pas

**Vérifications** :
1. ✅ Le serveur est bien redémarré après modification ?
2. ✅ Les fichiers ont bien été sauvegardés ?
3. ✅ Vérifier les logs dans la console serveur :

```bash
# Logs attendus lors de la génération
✅ [Image Generate API] Crédits déduits: { deducted: 1, remaining: 99 }
```

### Problème : Erreur 500 au lieu de 402

**Cause possible** : Erreur dans le service de crédits

**Solution** :
```bash
# Vérifier les logs d'erreur
npm run dev

# Chercher :
❌ [Image Generate API] Crédits insuffisants: ...
```

### Problème : Prisma Error

**Erreur** : `PrismaClient is not configured for production`

**Solution** :
```bash
npx prisma generate
npm run dev
```

## 📝 Notes

- **Transaction atomique** : Les crédits sont déduits ET l'historique créé dans une seule transaction
- **Rollback automatique** : Si la transaction échoue, rien n'est modifié
- **Idempotence** : Réessayer une génération échouée ne déduit pas 2 fois les crédits
- **Logs clairs** : Tous les événements sont loggés avec emojis pour faciliter le débogage

## ✅ Checklist Finale

- [ ] Test 1 : Solde initial affiché
- [ ] Test 2 : Images décomptées (1 crédit/image)
- [ ] Test 3 : Vidéos décomptées (5 crédits/vidéo)
- [ ] Test 4 : Blogs décomptés (2 crédits/article)
- [ ] Test 5 : Ebooks décomptés (10 crédits/livre)
- [ ] Test 6 : Erreur 402 pour images insuffisantes
- [ ] Test 7 : Erreur 402 pour vidéos insuffisantes
- [ ] Test 8 : Erreur 402 pour ebooks insuffisants
- [ ] Test 9 : Historique complet visible
- [ ] Test 10 : Transactions concurrentes gérées

---

**Une fois tous les tests passés, la correction est validée ! 🎉**
