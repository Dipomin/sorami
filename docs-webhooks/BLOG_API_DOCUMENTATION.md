# Documentation API - Génération d'Articles de Blog SEO

## Vue d'ensemble

L'API de génération d'articles de blog utilise CrewAI avec des agents IA spécialisés pour créer du contenu optimisé SEO, professionnel et engageant. Le système suit une architecture similaire à la génération de livres mais adaptée aux spécificités du contenu web et du référencement naturel.

## Architecture de la Fonctionnalité

### 1. Structure des Modules

```
src/write_a_book_with_flows/
├── blog_flow.py                          # Flow principal d'orchestration
├── types.py                              # Types Pydantic (BlogOutline, BlogArticle, etc.)
├── api_models.py                         # Modèles API (BlogRequest, BlogArticleResult, etc.)
└── crews/
    ├── blog_outline_crew/                # Crew de recherche SEO et planification
    │   ├── blog_outline_crew.py
    │   └── config/
    │       ├── agents.yaml               # SEO researcher & Content strategist
    │       └── tasks.yaml                # Tâches de recherche et planification
    └── write_blog_article_crew/          # Crew de rédaction et optimisation
        ├── write_blog_article_crew.py
        └── config/
            ├── agents.yaml               # Content writer & SEO optimizer
            └── tasks.yaml                # Tâches d'écriture et scoring
```

### 2. Agents IA Spécialisés

#### BlogOutlineCrew (Recherche & Stratégie)
- **SEO Researcher** : Recherche de mots-clés, analyse concurrentielle, tendances
- **Content Strategist** : Création du plan structuré et optimisé SEO

#### WriteBlogArticleCrew (Rédaction & Optimisation)
- **Content Writer** : Rédaction professionnelle et captivante
- **SEO Optimizer** : Analyse, optimisation et scoring de qualité

### 3. Flow d'Orchestration (BlogFlow)

```python
@start()
generate_blog_outline()           # Recherche SEO + Plan structuré
    ↓
@listen(generate_blog_outline)
write_blog_sections()             # Rédaction séquentielle (intro, sections, conclusion)
    ↓
@listen(write_blog_sections)
optimize_and_finalize()           # Optimisation SEO + Scoring + Sauvegarde
```

---

## Endpoints API

### Base URL
- **Développement** : `http://localhost:9006`
- **Production** : Configuré selon `ENVIRONMENT`

---

## 📝 POST /api/blog/generate

Génère un article de blog optimisé SEO avec agents IA.

### Requête

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "topic": "Intelligence Artificielle et Marketing Digital en 2025",
  "goal": "Créer un guide complet sur l'utilisation de l'IA dans le marketing...",
  "target_word_count": 2500
}
```

**Paramètres:**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `topic` | string | ✅ Oui | Sujet principal de l'article |
| `goal` | string | ⚪ Non | Objectif détaillé et contexte (défaut: génération automatique) |
| `target_word_count` | integer | ⚪ Non | Nombre de mots cible (défaut: 2000) |

### Réponse (202 Accepted)

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending",
  "message": "Génération de l'article de blog démarrée",
  "created_at": "2025-10-20T14:30:00.123456"
}
```

### Codes de statut
- `202` : Requête acceptée, génération en cours
- `400` : Données invalides
- `503` : CrewAI non disponible

---

## 📊 GET /api/blog/status/{job_id}

Récupère le statut en temps réel d'une tâche de génération.

### Requête
```http
GET /api/blog/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Réponse (200 OK)

```json
{
  "status": "writing_chapters",
  "message": "Rédaction de l'article...",
  "progress": 65,
  "result": null,
  "content_type": "blog",
  "updated_at": "2025-10-20T14:32:15.789012"
}
```

**Statuts possibles:**
- `pending` : En attente de démarrage
- `generating_outline` : Recherche SEO et création du plan
- `writing_chapters` : Rédaction des sections
- `finalizing` : Optimisation SEO et scoring
- `completed` : Article terminé ✅
- `failed` : Erreur survenue ❌

### Codes de statut
- `200` : Statut récupéré
- `404` : Job non trouvé
- `400` : Job n'est pas un article de blog

---

## 📄 GET /api/blog/result/{job_id}

Récupère le résultat complet d'un article terminé.

### Requête
```http
GET /api/blog/result/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Réponse (200 OK)

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Intelligence Artificielle et Marketing Digital : Le Guide Complet 2025",
  "meta_description": "Découvrez comment l'IA révolutionne le marketing digital en 2025. Tendances, outils et stratégies actionnables pour booster votre ROI. Guide expert.",
  "introduction": "L'intelligence artificielle transforme radicalement le paysage du marketing digital...",
  "sections": [
    {
      "heading": "Les Tendances IA Incontournables en Marketing",
      "content": "En 2025, l'intelligence artificielle n'est plus une option mais une nécessité..."
    },
    {
      "heading": "Chatbots et Personnalisation à Grande Échelle",
      "content": "Les chatbots nouvelle génération, alimentés par GPT-4 et Claude..."
    }
    // ... autres sections
  ],
  "conclusion": "L'intelligence artificielle est désormais au cœur de toute stratégie marketing performante...",
  "tags": [
    "intelligence artificielle",
    "marketing digital",
    "IA marketing",
    "automatisation",
    "personnalisation",
    "chatbots",
    "prédiction comportementale",
    "ROI marketing"
  ],
  "main_keywords": [
    "intelligence artificielle marketing",
    "IA marketing digital",
    "marketing automation 2025",
    "personnalisation IA",
    "chatbots marketing"
  ],
  "seo_score": 92.5,
  "word_count": 2487,
  "readability_score": "Niveau professionnel - Score Flesch: 65/100",
  "full_content": "# Intelligence Artificielle et Marketing Digital...\n\n**Meta-description:**...",
  "generated_at": "2025-10-20T14:30:00.123456",
  "completed_at": "2025-10-20T14:35:42.987654"
}
```

### Structure du Résultat

| Champ | Type | Description |
|-------|------|-------------|
| `job_id` | string | Identifiant unique du job |
| `title` | string | Titre optimisé SEO (60-70 caractères) |
| `meta_description` | string | Meta-description persuasive (150-160 caractères) |
| `introduction` | string | Introduction captivante de l'article |
| `sections` | array | Sections avec `heading` et `content` |
| `conclusion` | string | Conclusion avec call-to-action |
| `tags` | array | Tags SEO recommandés (5-10 tags) |
| `main_keywords` | array | Mots-clés principaux ciblés |
| `seo_score` | float | Score de qualité SEO (0-100) |
| `word_count` | integer | Nombre total de mots |
| `readability_score` | string | Évaluation de lisibilité |
| `full_content` | string | Article complet en Markdown |
| `generated_at` | string | Date/heure de création |
| `completed_at` | string | Date/heure de complétion |

### Codes de statut
- `200` : Article récupéré avec succès
- `404` : Job non trouvé
- `400` : Article non terminé ou type incorrect

---

## 📋 GET /api/jobs/list

Liste toutes les tâches (livres et articles de blog).

### Réponse (200 OK)

```json
{
  "jobs": [
    {
      "job_id": "a1b2c3d4-...",
      "content_type": "blog",
      "status": "completed",
      "message": "Article de blog généré avec succès!",
      "progress": 100,
      "created_at": "2025-10-20T14:30:00.123456",
      "updated_at": "2025-10-20T14:35:42.987654"
    },
    {
      "job_id": "x9y8z7w6-...",
      "content_type": "book",
      "status": "writing_chapters",
      "message": "Rédaction des chapitres...",
      "progress": 60,
      "created_at": "2025-10-20T13:00:00.000000",
      "updated_at": "2025-10-20T14:15:30.456789"
    }
  ],
  "total": 2,
  "book_count": 1,
  "blog_count": 1
}
```

---

## 🏥 GET /health

Vérifie la santé de l'API.

### Réponse (200 OK)

```json
{
  "status": "healthy",
  "crewai_available": true,
  "features": ["books", "blog_articles"],
  "python_version": "3.11.5 (main, Sep 11 2023...)",
  "environment": "development",
  "webhook_enabled": true,
  "timestamp": "2025-10-20T14:40:00.123456"
}
```

---

## Exemple d'Utilisation Complet

### Python avec `requests`

```python
import requests
import time

# Configuration
API_URL = "http://localhost:9006"

# 1. Créer une requête de génération
blog_request = {
    "topic": "Les meilleures pratiques de cybersécurité pour les PME en 2025",
    "goal": """
        Créer un guide actionnable pour les PME qui veulent renforcer leur 
        cybersécurité. L'article doit couvrir les menaces actuelles, les 
        outils recommandés, et un plan d'action en 10 étapes.
    """,
    "target_word_count": 2000
}

# 2. Envoyer la requête
response = requests.post(f"{API_URL}/api/blog/generate", json=blog_request)
job_data = response.json()
job_id = job_data['job_id']

print(f"✅ Job créé: {job_id}")

# 3. Polling du statut
while True:
    status_response = requests.get(f"{API_URL}/api/blog/status/{job_id}")
    status = status_response.json()
    
    print(f"Status: {status['status']} - {status['message']} ({status['progress']}%)")
    
    if status['status'] == 'completed':
        print("✅ Article terminé!")
        break
    elif status['status'] == 'failed':
        print(f"❌ Erreur: {status.get('message')}")
        exit(1)
    
    time.sleep(2)  # Attendre 2 secondes avant le prochain check

# 4. Récupérer le résultat
result_response = requests.get(f"{API_URL}/api/blog/result/{job_id}")
article = result_response.json()

# 5. Afficher les informations
print(f"\n📄 Titre: {article['title']}")
print(f"📊 Score SEO: {article['seo_score']}/100")
print(f"📝 Nombre de mots: {article['word_count']}")
print(f"🏷️ Tags: {', '.join(article['tags'][:5])}")

# 6. Sauvegarder l'article
with open('article.md', 'w', encoding='utf-8') as f:
    f.write(article['full_content'])

print("\n💾 Article sauvegardé dans article.md")
```

### JavaScript / TypeScript (Next.js)

```typescript
// API Client
async function generateBlogArticle(topic: string, goal: string, targetWordCount: number = 2000) {
  const response = await fetch('http://localhost:9006/api/blog/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, goal, target_word_count: targetWordCount })
  });
  
  if (!response.ok) throw new Error('Erreur lors de la création du job');
  
  const data = await response.json();
  return data.job_id;
}

async function pollBlogStatus(jobId: string): Promise<BlogArticleResult> {
  while (true) {
    const response = await fetch(`http://localhost:9006/api/blog/status/${jobId}`);
    const status = await response.json();
    
    console.log(`Status: ${status.status} - ${status.progress}%`);
    
    if (status.status === 'completed') {
      // Récupérer le résultat final
      const resultResponse = await fetch(`http://localhost:9006/api/blog/result/${jobId}`);
      return await resultResponse.json();
    } else if (status.status === 'failed') {
      throw new Error(status.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s
  }
}

// Utilisation
const jobId = await generateBlogArticle(
  "Intelligence Artificielle et Marketing",
  "Guide complet pour les marketeurs",
  2500
);

const article = await pollBlogStatus(jobId);

console.log(`✅ Article généré: ${article.title}`);
console.log(`📊 Score SEO: ${article.seo_score}/100`);
console.log(`📝 ${article.word_count} mots`);
```

### cURL

```bash
# 1. Créer la génération
curl -X POST http://localhost:9006/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Développement durable et entreprises tech",
    "goal": "Article sur les pratiques écologiques dans la tech",
    "target_word_count": 1800
  }'

# Réponse: {"job_id": "abc123...", "status": "pending", ...}

# 2. Vérifier le statut
curl http://localhost:9006/api/blog/status/abc123...

# 3. Récupérer le résultat (quand completed)
curl http://localhost:9006/api/blog/result/abc123... > article.json
```

---

## Optimisation SEO

### Critères Évalués (Score /100)

1. **SEO Technique (40 points)**
   - Optimisation du titre (mot-clé, longueur, attractivité)
   - Meta-description (CTA, mot-clé, longueur)
   - Densité et distribution des mots-clés
   - Structure Hn (hiérarchie logique)
   - Potentiel featured snippets

2. **Qualité Rédactionnelle (30 points)**
   - Lisibilité (score Flesch, longueur phrases)
   - Qualité introduction et conclusion
   - Cohérence et fluidité
   - Exemples et données concrètes

3. **Engagement Utilisateur (20 points)**
   - Formatage web (paragraphes courts, listes)
   - Éléments interactifs (questions, CTA)
   - Temps de lecture estimé

4. **E-E-A-T et Crédibilité (10 points)**
   - Expertise démontrée
   - Crédibilité (sources, données)
   - Autorité et trustworthiness

### Interprétation du Score

- **90-100** : 🏆 Excellent - Prêt à publier
- **80-89** : ✅ Très bon - Qualité professionnelle
- **70-79** : 👍 Bon - Optimisations mineures possibles
- **60-69** : ⚠️ Acceptable - Optimisations recommandées
- **< 60** : ❌ À améliorer - Révision nécessaire

---

## Bonnes Pratiques

### 1. Définir un Objectif Clair
```json
{
  "topic": "Votre sujet",
  "goal": "Détaillez le contexte, le public cible, le ton souhaité, et les points clés à couvrir"
}
```

### 2. Adapter le Nombre de Mots
- **Article court** : 800-1200 mots (tutoriel rapide)
- **Article standard** : 1500-2500 mots (guide complet)
- **Article long-form** : 3000+ mots (pillar content)

### 3. Polling Efficace
- Intervalle recommandé : 2 secondes
- Timeout suggéré : 5-10 minutes max
- Afficher la progression pour l'UX

### 4. Gestion des Erreurs
```python
try:
    result = requests.get(f"{API_URL}/api/blog/result/{job_id}")
    result.raise_for_status()
    article = result.json()
except requests.HTTPError as e:
    if e.response.status_code == 400:
        print("Article pas encore terminé")
    elif e.response.status_code == 404:
        print("Job non trouvé")
```

---

## Webhooks (Optionnel)

L'API peut envoyer un webhook automatiquement quand l'article est terminé.

### Configuration
```bash
# .env
WEBHOOK_URL=https://votre-domaine.com/api/webhooks/completion
WEBHOOK_SECRET=votre-secret-key
ENVIRONMENT=production
```

### Payload Webhook
```json
{
  "job_id": "abc123...",
  "status": "completed",
  "content_type": "blog",
  "timestamp": "2025-10-20T14:35:42.987654",
  "data": {
    "title": "...",
    "meta_description": "...",
    "seo_score": 92.5,
    ...
  },
  "environment": "production"
}
```

---

## Dépannage

### L'API ne démarre pas
```bash
# Vérifier les variables d'environnement
cat .env
# Doit contenir OPENAI_API_KEY et SERPER_API_KEY

# Réinstaller les dépendances
pip install -r requirements.txt
crewai install
```

### Score SEO faible
- Vérifiez que le `goal` est détaillé et précis
- Augmentez le `target_word_count` si nécessaire
- Le sujet est-il trop large ou trop niche ?

### Timeout lors de la génération
- La génération peut prendre 3-8 minutes selon la complexité
- Augmentez le timeout côté client
- Vérifiez les logs de l'API pour les erreurs

---

## Performance

- **Temps moyen** : 3-6 minutes pour un article de 2000 mots
- **Concurrence** : Plusieurs jobs peuvent s'exécuter en parallèle
- **Stockage** : En mémoire (utilisez Redis/DB pour la production)

---

## Sécurité

### Recommandations Production

1. **Rate limiting** : Limiter le nombre de requêtes par IP
2. **Authentication** : Ajouter API keys ou JWT
3. **Validation** : Valider et sanitiser toutes les entrées
4. **CORS** : Restreindre les origines autorisées
5. **Webhook secret** : Toujours utiliser WEBHOOK_SECRET en production

---

## Support

Pour toute question ou problème :
- Consultez les logs de l'API : `tail -f api.log`
- Vérifiez la santé : `GET /health`
- Testez avec le script : `python test_blog_api.py`

---

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2025  
**Auteur** : Sorami AI Backend Team
