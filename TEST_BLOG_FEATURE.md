# 🧪 Guide de Test - Fonctionnalité Blog

## ✅ Migration effectuée avec succès !

La migration `20251020223212_add_blog_models` a été appliquée avec succès.

### Tables créées
- ✅ `blog_articles` - Articles de blog avec SEO
- ✅ `blog_formats` - Formats d'export (MD, PDF, etc.)
- ✅ `blog_jobs` - Jobs de génération asynchrones

## 🚀 Serveur en cours d'exécution

- **URL**: http://localhost:3001 (port 3001 car 3000 occupé)
- **Status**: ✅ En ligne

## 🧪 Scénarios de test

### 1. Test de création d'article

```bash
# Ouvrir dans le navigateur
open http://localhost:3001/blog/create
```

**Actions à effectuer** :
1. Remplir le formulaire :
   - **Topic** : "Les meilleures pratiques SEO en 2025"
   - **Goal** : "Aider les développeurs à optimiser leur contenu"
   - **Word Count** : Utiliser un preset (1200, 2000, ou 3000)

2. Cliquer sur "Générer l'article"

3. Observer la barre de progression :
   - 🔍 Étape 1 : Recherche et analyse
   - ✍️ Étape 2 : Rédaction du contenu
   - 🎯 Étape 3 : Optimisation SEO
   - ✅ Étape 4 : Finalisation

### 2. Vérification en base de données

```bash
# Ouvrir Prisma Studio (déjà en cours)
# Aller sur http://localhost:5555
```

**Vérifier** :
- Table `blog_jobs` → Un nouveau job créé avec status `PENDING`
- Après webhook → Table `blog_articles` avec l'article généré

### 3. Test du webhook (simulation)

```bash
# Simuler la réception d'un webhook
./test-blog-webhook.sh
```

**Ce qui devrait se passer** :
- Webhook reçoit le payload
- Article créé dans `blog_articles`
- Job mis à jour à `COMPLETED`
- Redirection vers `/blog/[id]`

### 4. Test de la liste d'articles

```bash
open http://localhost:3001/blog
```

**Vérifier** :
- Affichage en grille des articles
- Badge de statut (DRAFT, PUBLISHED, etc.)
- Score SEO affiché
- Boutons "Voir" et "Éditer"

### 5. Test de la page détail

Cliquer sur un article → `/blog/[id]`

**Vérifier** :
- Titre et métadonnées
- Score SEO
- Tags et mots-clés
- Contenu complet
- Boutons d'action (Éditer, Publier, Supprimer)

## 📊 Résultats attendus

### Après création réussie

```json
{
  "success": true,
  "job_id": "blog_xxx",
  "status": "PENDING",
  "estimated_duration": "3-6 minutes"
}
```

### Après webhook reçu

```json
{
  "title": "Les meilleures pratiques SEO en 2025",
  "word_count": 2487,
  "seo_score": 92.5,
  "readability_score": "B+",
  "tags": ["SEO", "2025", "Optimisation"],
  "main_keywords": ["SEO", "référencement", "optimisation"]
}
```

## 🐛 Problèmes résolus

### ✅ Erreur P2021 - Table inexistante
**Problème** : `The table 'blog_jobs' does not exist`

**Solution appliquée** :
```bash
npx prisma generate
npx prisma migrate dev --name add_blog_models
```

**Résultat** : Tables créées avec succès ✅

## 🔧 Configuration backend requise

Pour que la génération fonctionne réellement, le backend CrewAI doit :

1. **Recevoir la requête** de `/api/blog/generate`
2. **Traiter la génération** (3-6 minutes)
3. **Envoyer le webhook** à `/api/webhooks/blog-completion`

### Variables d'environnement backend

```python
# Backend CrewAI
WEBHOOK_URL = "http://localhost:3001/api/webhooks/blog-completion"
WEBHOOK_SECRET = "votre-secret-partagé"
FRONTEND_URL = "http://localhost:3001"
```

## 📝 Checklist de test

- [ ] Migration appliquée
- [ ] Serveur démarré (port 3001)
- [ ] Formulaire accessible
- [ ] Création de job réussie
- [ ] Job visible dans Prisma Studio
- [ ] Polling fonctionne
- [ ] Webhook reçu et traité
- [ ] Article créé en DB
- [ ] Article visible dans `/blog`
- [ ] Page détail affiche les données
- [ ] Actions (éditer, publier) fonctionnent

## 🎯 Prochaines étapes

1. **Configurer le backend** avec l'URL du webhook
2. **Tester le workflow complet** de bout en bout
3. **Vérifier les métriques SEO** sont correctes
4. **Tester l'édition** d'articles
5. **Tester la publication** et changements de statut

## 📚 Ressources

- **Documentation** : [BLOG_DOCUMENTATION_INDEX.md](./BLOG_DOCUMENTATION_INDEX.md)
- **Quickstart** : [BLOG_QUICKSTART.md](./BLOG_QUICKSTART.md)
- **API Docs** : [BLOG_FEATURE_DOCUMENTATION.md](./BLOG_FEATURE_DOCUMENTATION.md)

---

**Status** : ✅ Prêt pour les tests !
**Date** : 20 octobre 2025
**Migration** : `20251020223212_add_blog_models` appliquée
