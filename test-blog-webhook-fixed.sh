#!/bin/bash

# Script pour tester le webhook de complétion du blog avec le nouveau système d'ID

# URL du webhook
WEBHOOK_URL="http://localhost:3000/api/webhooks/blog-completion"

# Secret du webhook
WEBHOOK_SECRET="sorami-webhook-secret-key-2025"

# ID du job backend (UUID généré par Python)
BACKEND_JOB_ID="e8ce9f1e-2892-4f9b-977b-a7688ed93c4c"

# Payload du webhook
PAYLOAD='{
  "job_id": "'"$BACKEND_JOB_ID"'",
  "status": "completed",
  "blog_data": {
    "title": "Comment Écrire un Article de Blog Engageant en 2025",
    "content": "## Introduction\n\nDans le paysage numérique actuel...\n\n## Comprendre Votre Audience\n\nLa clé du succès...\n\n## Structurer Votre Article\n\n### 1. Le Titre Accrocheur\n\nUn titre captivant...\n\n### 2. Introduction Percutante\n\nLes premières lignes...\n\n### 3. Développement Structuré\n\nOrganisez votre contenu...\n\n### 4. Conclusion et Call-to-Action\n\nTerminez en beauté...\n\n## Optimisation SEO\n\nPour maximiser la visibilité...\n\n## Conclusion\n\nÉcrire un article de blog engageant nécessite...",
    "meta_description": "Découvrez comment rédiger des articles de blog captivants qui engagent vos lecteurs et améliorent votre SEO en 2025. Guide complet avec exemples pratiques.",
    "keywords": ["article de blog", "rédaction web", "SEO", "content marketing", "engagement"],
    "estimated_reading_time": 8,
    "word_count": 2060,
    "seo_score": 87,
    "structure": {
      "sections": [
        {
          "title": "Introduction",
          "word_count": 150,
          "subsections": []
        },
        {
          "title": "Comprendre Votre Audience",
          "word_count": 300,
          "subsections": []
        },
        {
          "title": "Structurer Votre Article",
          "word_count": 850,
          "subsections": [
            "Le Titre Accrocheur",
            "Introduction Percutante",
            "Développement Structuré",
            "Conclusion et Call-to-Action"
          ]
        },
        {
          "title": "Optimisation SEO",
          "word_count": 450,
          "subsections": []
        },
        {
          "title": "Conclusion",
          "word_count": 310,
          "subsections": []
        }
      ]
    }
  }
}'

echo "🚀 Test du webhook de complétion du blog"
echo "========================================="
echo "Webhook URL: $WEBHOOK_URL"
echo "Backend Job ID: $BACKEND_JOB_ID"
echo ""

# Envoi de la requête
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $WEBHOOK_SECRET" \
  -d "$PAYLOAD")

# Extraction du code HTTP et du body
http_code=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS:/d')

echo "📊 Réponse:"
echo "HTTP Status: $http_code"
echo "Body: $body" | jq '.' 2>/dev/null || echo "Body: $body"
echo ""

if [ "$http_code" = "200" ]; then
  echo "✅ Webhook traité avec succès!"
else
  echo "❌ Erreur lors du traitement du webhook (HTTP $http_code)"
fi
