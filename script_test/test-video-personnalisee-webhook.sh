#!/bin/bash

# Script de test pour le webhook de complétion des vidéos personnalisées
# Usage: ./test-video-personnalisee-webhook.sh [user_id]

# Configuration
WEBHOOK_URL="${NEXT_PUBLIC_WEBHOOK_URL:-http://localhost:3000}/api/webhooks/video-personnalisee-completion"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-sorami-webhook-secret-key-2025}"

# User ID (Clerk ID) - utiliser celui passé en argument ou une valeur de test
USER_ID="${1:-user_2pKc9FZqJ3XYzQwR5vL4NmH6sTa}"

# Générer un job ID unique avec timestamp
TIMESTAMP=$(date +%s)
JOB_ID="test-video-perso-${TIMESTAMP}"

# Générer date ISO 8601 pour JavaScript
ISO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🎬 Test du webhook de vidéo personnalisée"
echo "=========================================="
echo "📍 URL: $WEBHOOK_URL"
echo "🔑 User ID: $USER_ID"
echo "🆔 Job ID: $JOB_ID"
echo "🕒 Timestamp: $ISO_DATE"
echo ""

# Payload de test (structure conforme au GUIDE_FRONTEND_TOKEN_WEBHOOK.md)
PAYLOAD=$(cat <<EOF
{
  "job_id": "$JOB_ID",
  "status": "completed",
  "content_type": "video",
  "timestamp": "$ISO_DATE",
  "has_data": true,
  "environment": "development",
  "data": {
    "videos": [
      {
        "filename": "generated_video_1.mp4",
        "file_path": "videos/${JOB_ID}/video_1.mp4",
        "s3_key": "videos/${JOB_ID}/video_1.mp4",
        "s3_url": "https://sorami-storage.s3.amazonaws.com/videos/${JOB_ID}/video_1.mp4",
        "url": "https://sorami-storage.s3.amazonaws.com/videos/${JOB_ID}/video_1.mp4",
        "size_bytes": 15728640,
        "duration": "8.0",
        "aspect_ratio": "16:9",
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "created_at": "$ISO_DATE"
      }
    ],
    "job_id": "$JOB_ID",
    "user_id": "$USER_ID",
    "num_videos": 1,
    "metadata": {
      "model_name": "veo-2.0-generate-001",
      "model_version": "2.0",
      "processing_time": 180.5,
      "generation_time": 142.3,
      "download_time": 12.8,
      "prompt_used": "Une vidéo personnalisée générée à partir d'une image de référence",
      "num_videos_requested": 1,
      "num_videos_generated": 1,
      "config_used": {
        "aspect_ratio": "16:9",
        "duration_seconds": 8,
        "person_generation": "ALLOW_ALL"
      }
    },
    "generated_at": "$ISO_DATE",
    "success": true,
    "prompt": "Une vidéo personnalisée générée à partir d'une image de référence"
  }
}
EOF
)

echo "📦 Payload envoyé:"
echo "$PAYLOAD" | jq '.'
echo ""

echo "🚀 Envoi de la requête webhook..."
echo ""

# Envoyer la requête
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d "$PAYLOAD")

# Séparer le code de statut HTTP du corps de la réponse
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "📨 Réponse HTTP: $HTTP_CODE"
echo "📄 Corps de la réponse:"
echo "$HTTP_BODY" | jq '.'
echo ""

# Vérifier le résultat
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Webhook traité avec succès!"
  echo ""
  echo "🔍 Vérifications à effectuer:"
  echo "  1. Vérifier que VideoGeneration existe avec id: $JOB_ID"
  echo "  2. Vérifier que VideoFile a été créé avec s3_key: videos/${JOB_ID}/video_1.mp4"
  echo "  3. Vérifier la notification pour l'utilisateur $USER_ID"
  echo "  4. Vérifier le statut: COMPLETED avec progress: 100"
  echo ""
  echo "💡 Commandes Prisma Studio:"
  echo "  npx prisma studio"
  echo "  → Ouvrir VideoGeneration et chercher: $JOB_ID"
  echo "  → Ouvrir VideoFile et vérifier les fichiers liés"
  echo "  → Ouvrir Notification et vérifier les notifications récentes"
else
  echo "❌ Erreur HTTP $HTTP_CODE"
  echo ""
  echo "🔍 Actions de débogage:"
  echo "  1. Vérifier les logs du serveur Next.js"
  echo "  2. Vérifier que l'utilisateur $USER_ID existe dans la DB"
  echo "  3. Vérifier le WEBHOOK_SECRET dans .env.local"
  echo "  4. Vérifier que le serveur Next.js est démarré (npm run dev)"
fi

echo ""
echo "📊 Pour tester avec un vrai user_id:"
echo "  ./test-video-personnalisee-webhook.sh user_VOTRE_CLERK_ID"
