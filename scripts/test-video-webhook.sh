#!/bin/bash

# Script de test pour le webhook de complétion vidéo
# Usage: ./test-video-webhook.sh

BASE_URL="${1:-http://localhost:3000}"
WEBHOOK_URL="$BASE_URL/api/webhooks/video-completion"

echo "🧪 Test du Webhook Video Completion"
echo "URL: $WEBHOOK_URL"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Vérification de santé (GET)
echo -e "${BLUE}Test 1: Vérification de santé (GET)${NC}"
HEALTH_RESPONSE=$(curl -s -X GET "$WEBHOOK_URL")
echo "Response: $HEALTH_RESPONSE"
echo ""

# Test 2: Payload invalide (missing job_id)
echo -e "${BLUE}Test 2: Payload invalide (missing job_id)${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "content_type": "video"
  }')
echo "Response: $INVALID_RESPONSE"
echo ""

# Test 3: Statut pending
echo -e "${BLUE}Test 3: Webhook status PENDING${NC}"
PENDING_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "pending",
    "content_type": "video",
    "timestamp": "2025-10-23T14:00:00Z",
    "has_data": false,
    "environment": "development"
  }')
echo "Response: $PENDING_RESPONSE"
echo ""

# Test 4: Statut processing
echo -e "${BLUE}Test 4: Webhook status PROCESSING${NC}"
PROCESSING_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "processing",
    "content_type": "video",
    "timestamp": "2025-10-23T14:01:00Z",
    "has_data": false,
    "environment": "development"
  }')
echo "Response: $PROCESSING_RESPONSE"
echo ""

# Test 5: Statut generating
echo -e "${BLUE}Test 5: Webhook status GENERATING${NC}"
GENERATING_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "generating",
    "content_type": "video",
    "timestamp": "2025-10-23T14:02:00Z",
    "has_data": false,
    "environment": "development"
  }')
echo "Response: $GENERATING_RESPONSE"
echo ""

# Test 6: Statut downloading
echo -e "${BLUE}Test 6: Webhook status DOWNLOADING${NC}"
DOWNLOADING_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "downloading",
    "content_type": "video",
    "timestamp": "2025-10-23T14:02:30Z",
    "has_data": false,
    "environment": "development"
  }')
echo "Response: $DOWNLOADING_RESPONSE"
echo ""

# Test 7: Statut completed avec données
echo -e "${BLUE}Test 7: Webhook status COMPLETED avec données${NC}"
COMPLETED_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "completed",
    "content_type": "video",
    "timestamp": "2025-10-23T14:03:00Z",
    "has_data": true,
    "data": {
      "job_id": "test-job-123",
      "status": "completed",
      "videos": [
        {
          "filename": "test-video.mp4",
          "file_path": "/videos/test-job-123/test-video.mp4",
          "file_url": "https://s3.amazonaws.com/sorami-videos/test-video.mp4",
          "file_size": 15728640,
          "format": "mp4",
          "duration_seconds": 8,
          "aspect_ratio": "16:9",
          "dimensions": {
            "width": 1920,
            "height": 1080
          },
          "created_at": "2025-10-23T14:03:00Z"
        }
      ],
      "metadata": {
        "model_name": "veo-2.0-generate-001",
        "model_version": "2.0",
        "processing_time": 120.5,
        "generation_time": 90.2,
        "download_time": 30.3,
        "prompt_used": "Un coucher de soleil cinématographique sur l'\''océan",
        "num_videos_requested": 1,
        "num_videos_generated": 1,
        "config_used": {
          "aspect_ratio": "16:9",
          "duration_seconds": 8,
          "person_generation": "ALLOW_ALL"
        }
      },
      "generated_at": "2025-10-23T14:03:00Z",
      "success": true,
      "num_videos": 1,
      "prompt": "Un coucher de soleil cinématographique sur l'\''océan"
    },
    "environment": "development"
  }')
echo "Response: $COMPLETED_RESPONSE"
echo ""

# Test 8: Statut failed
echo -e "${BLUE}Test 8: Webhook status FAILED${NC}"
FAILED_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-456",
    "status": "failed",
    "content_type": "video",
    "timestamp": "2025-10-23T14:04:00Z",
    "has_data": false,
    "environment": "development"
  }')
echo "Response: $FAILED_RESPONSE"
echo ""

# Test 9: Test idempotence (double envoi)
echo -e "${BLUE}Test 9: Test idempotence (double envoi)${NC}"
IDEMPOTENT_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "completed",
    "content_type": "video",
    "timestamp": "2025-10-23T14:03:00Z",
    "has_data": true,
    "data": {
      "job_id": "test-job-123",
      "status": "completed",
      "videos": [],
      "generated_at": "2025-10-23T14:03:00Z",
      "success": true,
      "num_videos": 0
    },
    "environment": "development"
  }')
echo "Response: $IDEMPOTENT_RESPONSE"
echo ""

# Résumé
echo -e "${GREEN}✅ Tous les tests ont été exécutés${NC}"
echo ""
echo "Vérifiez les logs du serveur Next.js pour les détails de traitement"
echo "Vérifiez la base de données Prisma pour les enregistrements créés/mis à jour"
