# Guide de démarrage - Articles de Blog SEO

## 🚀 Démarrage rapide

### 1. Migration de la base de données

```bash
# Générer le client Prisma avec les nouveaux modèles
npx prisma generate

# Créer la migration
npx prisma migrate dev --name add_blog_models

# Vérifier dans Prisma Studio (optionnel)
npx prisma studio
```

### 2. Configuration des variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
# API CrewAI Backend
CREWAI_API_URL=http://localhost:9006

# Webhook Secret (en production)
WEBHOOK_SECRET=your-secure-secret-key

# Database
DATABASE_URL="mysql://user:password@localhost:3306/sorami"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### 3. Lancer l'application

```bash
# Mode développement
npm run dev

# Accès :
# - Frontend : http://localhost:3000
# - Blog liste : http://localhost:3000/blog
# - Créer article : http://localhost:3000/blog/create
```

## 📚 Structure des URLs

### Pages principales
- `/blog` - Liste de tous vos articles
- `/blog/create` - Créer un nouvel article
- `/blog/[id]` - Détail d'un article

### API Routes
- `POST /api/blog/generate` - Générer un article
- `GET /api/blog` - Liste des articles
- `GET /api/blog/[id]` - Détail d'un article
- `PUT /api/blog/[id]` - Mettre à jour un article
- `DELETE /api/blog/[id]` - Supprimer un article
- `GET /api/blog/jobs/[jobId]/status` - Statut de génération
- `GET /api/blog/jobs/[jobId]/result` - Résultat final

### Webhooks
- `POST /api/webhooks/blog-completion` - Recevoir les articles terminés

## 🎯 Utilisation

### Créer un article de blog

1. **Aller sur la page de création**
   ```
   http://localhost:3000/blog/create
   ```

2. **Remplir le formulaire**
   - **Sujet** (requis) : "Intelligence Artificielle et Marketing Digital en 2025"
   - **Objectif** (optionnel) : Description détaillée de ce que vous voulez
   - **Nombre de mots** : Choisir entre 800 et 5000 mots
     - Court : 1200 mots
     - Standard : 2000 mots (recommandé)
     - Long : 3000+ mots

3. **Cliquer sur "Générer l'article"**
   - La génération démarre (3-6 minutes)
   - Une barre de progression s'affiche
   - Vous voyez les étapes :
     1. Recherche SEO
     2. Rédaction
     3. Optimisation
     4. Terminé

4. **Consulter le résultat**
   - Score SEO affiché
   - Nombre de mots
   - Sections
   - Tags et mots-clés
   - Redirection automatique vers `/blog`

### Gérer un article

1. **Liste des articles** (`/blog`)
   - Voir tous vos articles
   - Filtrer par statut
   - Voir les scores SEO

2. **Détail d'un article** (`/blog/[id]`)
   - Lire l'article complet
   - Voir les métriques SEO
   - Actions disponibles :
     - **Éditer** : Modifier le contenu
     - **Publier** : Changer le statut en PUBLISHED
     - **Supprimer** : Supprimer définitivement

## 🔧 Configuration du Backend CrewAI

Le backend Python doit exposer ces endpoints :

```python
# API Blog endpoints
POST   /api/blog/generate      # Démarrer génération
GET    /api/blog/status/{id}   # Statut du job
GET    /api/blog/result/{id}   # Résultat final

# Webhook configuration
WEBHOOK_URL=http://localhost:3000/api/webhooks/blog-completion
WEBHOOK_SECRET=your-secure-secret-key
```

### Exemple de payload webhook

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "timestamp": "2025-10-20T14:35:42.987654",
  "environment": "development",
  "blog_data": {
    "title": "Intelligence Artificielle et Marketing Digital...",
    "meta_description": "Découvrez comment l'IA révolutionne...",
    "introduction": "L'intelligence artificielle transforme...",
    "sections": [
      {
        "heading": "Les Tendances IA Incontournables",
        "content": "En 2025, l'intelligence artificielle..."
      }
    ],
    "conclusion": "L'intelligence artificielle est désormais...",
    "tags": ["ia", "marketing", "digital"],
    "main_keywords": ["intelligence artificielle marketing"],
    "seo_score": 92.5,
    "word_count": 2487,
    "readability_score": "Niveau professionnel - Score Flesch: 65/100",
    "full_content": "# Titre...\n\nContenu complet markdown",
    "generated_at": "2025-10-20T14:30:00.123456",
    "completed_at": "2025-10-20T14:35:42.987654"
  }
}
```

## 🧪 Tests

### Test manuel complet

1. **Test de création**
   ```bash
   # 1. Créer un article via UI
   # 2. Vérifier le job en DB
   npx prisma studio
   # Voir table BlogJob
   ```

2. **Test du webhook**
   ```bash
   # Envoyer un webhook de test
   curl -X POST http://localhost:3000/api/webhooks/blog-completion \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Secret: your-secret" \
     -d @test-webhook-payload.json
   ```

3. **Test de l'API**
   ```bash
   # Liste des articles
   curl http://localhost:3000/api/blog
   
   # Détail d'un article
   curl http://localhost:3000/api/blog/[id]
   ```

### Vérifications importantes

- [ ] Le client Prisma est généré (`npx prisma generate`)
- [ ] Les migrations sont appliquées
- [ ] Les tables BlogArticle, BlogJob, BlogFormat existent
- [ ] Les routes /blog sont protégées (auth Clerk)
- [ ] Le webhook /api/webhooks/blog-completion est public
- [ ] Les variables d'environnement sont définies
- [ ] Le backend CrewAI est configuré avec l'URL du webhook

## 📊 Métriques SEO expliquées

### Score SEO (/100)
- **90-100** : 🏆 Excellent - Prêt à publier
- **80-89** : ✅ Très bon - Qualité professionnelle
- **70-79** : 👍 Bon - Optimisations mineures
- **60-69** : ⚠️ Acceptable - Optimisations recommandées
- **< 60** : ❌ À améliorer - Révision nécessaire

### Éléments évalués
1. **SEO Technique** (40%)
   - Titre optimisé (60-70 caractères)
   - Meta-description (150-160 caractères)
   - Densité mots-clés
   - Structure Hn

2. **Qualité Rédactionnelle** (30%)
   - Lisibilité (score Flesch)
   - Cohérence
   - Exemples concrets

3. **Engagement** (20%)
   - Formatage web
   - Paragraphes courts
   - Call-to-action

4. **E-E-A-T** (10%)
   - Expertise
   - Crédibilité
   - Autorité

## 🐛 Dépannage

### Le build échoue
```bash
# Régénérer le client Prisma
npx prisma generate

# Nettoyer et rebuild
rm -rf .next
npm run build
```

### Les articles ne s'affichent pas
1. Vérifier la connexion DB
2. Vérifier l'authentification Clerk
3. Regarder les logs du serveur
4. Vérifier Prisma Studio

### Le webhook ne fonctionne pas
1. Vérifier que la route est publique dans `middleware.ts`
2. Vérifier le `WEBHOOK_SECRET` en production
3. Regarder les logs du webhook
4. Tester avec curl

### Erreurs de compilation TypeScript
- Vérifier que tous les imports utilisent `@/` (alias)
- Vérifier que les types sont bien définis
- Relancer `npm run build`

## 📖 Documentation complète

Pour plus de détails, consultez :
- `BLOG_FEATURE_DOCUMENTATION.md` - Architecture et API complète
- `BLOG_IMPLEMENTATION_SUMMARY.md` - Résumé des modifications

## 🎨 Personnalisation

### Modifier le nombre de mots par défaut
```typescript
// src/components/BlogCreationForm.tsx
const [formData, setFormData] = useState<BlogRequest>({
  topic: "",
  goal: "",
  target_word_count: 2500, // Changer ici
});
```

### Modifier l'intervalle de polling
```typescript
// src/hooks/useBlogJob.ts
const POLLING_INTERVAL = 3000; // 3 secondes au lieu de 2
```

### Changer les couleurs des badges de statut
```typescript
// src/components/BlogList.tsx
// Modifier les classes Tailwind pour chaque statut
```

## 🚀 Prochaines fonctionnalités suggérées

1. **Export formats** : PDF, DOCX, HTML optimisé
2. **Planification** : Publier à une date future
3. **Édition avancée** : TipTap WYSIWYG
4. **Images IA** : Génération automatique avec DALL-E
5. **Analytics** : Vues, temps de lecture, engagement
6. **SEO avancé** : Schema.org, Open Graph, Twitter Cards

---

**Support** : Pour toute question, consultez la documentation complète ou ouvrez une issue.

**Version** : 1.0.0  
**Date** : 20 octobre 2025
