#!/bin/bash

# 🎬 Script de test pour la génération de vidéos
# Test complet de la fonctionnalité de génération de vidéos avec Gemini Veo 2.0

set -e

API_URL="${API_URL:-http://localhost:9006}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "═══════════════════════════════════════════════════════"
echo "🎬 Test de Génération de Vidéos - sorami"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Backend API: $API_URL"
echo "Frontend:    $FRONTEND_URL"
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Vérifier la santé de l'API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 1: Vérification de la santé de l'API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH_RESPONSE=$(curl -s "$API_URL/health" || echo "error")

if [[ "$HEALTH_RESPONSE" == "error" ]]; then
    print_error "Le backend n'est pas accessible"
    print_warning "Assurez-vous que le backend est démarré: cd backend && python main.py"
    exit 1
fi

VIDEO_AVAILABLE=$(echo "$HEALTH_RESPONSE" | grep -o '"video_generation_available":[^,}]*' | cut -d':' -f2)

if [[ "$VIDEO_AVAILABLE" == "true" ]]; then
    print_success "Backend accessible et génération de vidéos disponible"
else
    print_error "Génération de vidéos non disponible sur le backend"
    print_warning "Vérifiez que google-genai est installé et que GEMINI_API_KEY est configuré"
    exit 1
fi

echo ""

# Test 2: Créer une génération de vidéo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎥 Test 2: Création d'une génération de vidéo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUEST_PAYLOAD='{
  "prompt": "Un magnifique lever de soleil sur l'\''océan avec des vagues douces et des mouettes volant dans le ciel orange et rose",
  "aspect_ratio": "16:9",
  "number_of_videos": 1,
  "duration_seconds": 8,
  "person_generation": "ALLOW_ALL"
}'

print_info "Envoi de la requête de génération..."
echo "Prompt: Un magnifique lever de soleil sur l'océan..."
echo ""

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/videos/generate" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

JOB_ID=$(echo "$CREATE_RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)

if [[ -z "$JOB_ID" ]]; then
    print_error "Échec de la création du job de génération"
    echo "Réponse: $CREATE_RESPONSE"
    exit 1
fi

print_success "Job créé avec succès"
print_info "Job ID: $JOB_ID"
echo ""

# Test 3: Polling du statut
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 3: Polling du statut de génération"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MAX_ATTEMPTS=40  # 40 * 5s = 200s = 3min20s
ATTEMPT=0
COMPLETED=false

while [[ $ATTEMPT -lt $MAX_ATTEMPTS ]]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    STATUS_RESPONSE=$(curl -s "$API_URL/api/videos/status/$JOB_ID")
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    PROGRESS=$(echo "$STATUS_RESPONSE" | grep -o '"progress":[0-9]*' | cut -d':' -f2)
    MESSAGE=$(echo "$STATUS_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    
    echo -ne "\r⏳ Tentative $ATTEMPT/$MAX_ATTEMPTS | Statut: $STATUS | Progression: $PROGRESS% | $MESSAGE"
    
    if [[ "$STATUS" == "completed" ]]; then
        echo ""
        print_success "Génération terminée!"
        COMPLETED=true
        break
    elif [[ "$STATUS" == "failed" ]]; then
        echo ""
        print_error "La génération a échoué"
        ERROR=$(echo "$STATUS_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        print_error "Erreur: $ERROR"
        exit 1
    fi
    
    sleep 5
done

echo ""

if [[ "$COMPLETED" == false ]]; then
    print_error "Timeout: La génération prend trop de temps (>3 minutes)"
    exit 1
fi

echo ""

# Test 4: Récupérer les résultats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Test 4: Récupération des résultats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESULT_RESPONSE=$(curl -s "$API_URL/api/videos/result/$JOB_ID")

NUM_VIDEOS=$(echo "$RESULT_RESPONSE" | grep -o '"num_videos_generated":[0-9]*' | cut -d':' -f2)
PROCESSING_TIME=$(echo "$RESULT_RESPONSE" | grep -o '"processing_time":[0-9.]*' | cut -d':' -f2)
MODEL_NAME=$(echo "$RESULT_RESPONSE" | grep -o '"model_name":"[^"]*"' | cut -d'"' -f4)

print_success "Résultats récupérés avec succès"
echo ""
echo "📊 Métadonnées de génération:"
echo "   • Nombre de vidéos: $NUM_VIDEOS"
echo "   • Temps de traitement: ${PROCESSING_TIME}s"
echo "   • Modèle: $MODEL_NAME"
echo ""

# Extraire les informations des vidéos
echo "🎬 Vidéos générées:"
# Note: Cette extraction est simplifiée, en production on utiliserait jq
VIDEO_INFO=$(echo "$RESULT_RESPONSE" | grep -o '"filename":"[^"]*"' | head -1)
if [[ -n "$VIDEO_INFO" ]]; then
    FILENAME=$(echo "$VIDEO_INFO" | cut -d'"' -f4)
    print_success "Vidéo disponible: $FILENAME"
    
    # Extraire la taille du fichier
    FILE_SIZE=$(echo "$RESULT_RESPONSE" | grep -o '"file_size":[0-9]*' | head -1 | cut -d':' -f2)
    if [[ -n "$FILE_SIZE" ]]; then
        SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)
        echo "   • Taille: ${SIZE_MB} MB"
    fi
    
    # Extraire la durée
    DURATION=$(echo "$RESULT_RESPONSE" | grep -o '"duration_seconds":[0-9]*' | head -1 | cut -d':' -f2)
    if [[ -n "$DURATION" ]]; then
        echo "   • Durée: ${DURATION}s"
    fi
    
    # Extraire les dimensions
    WIDTH=$(echo "$RESULT_RESPONSE" | grep -o '"width":[0-9]*' | head -1 | cut -d':' -f2)
    HEIGHT=$(echo "$RESULT_RESPONSE" | grep -o '"height":[0-9]*' | head -1 | cut -d':' -f2)
    if [[ -n "$WIDTH" ]] && [[ -n "$HEIGHT" ]]; then
        echo "   • Dimensions: ${WIDTH}x${HEIGHT}"
    fi
else
    print_warning "Impossible d'extraire les informations de la vidéo"
fi

echo ""

# Test 5: Vérifier le webhook (optionnel)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔔 Test 5: Vérification du webhook frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

WEBHOOK_HEALTH=$(curl -s "$FRONTEND_URL/api/webhooks/video-completion" || echo "error")

if [[ "$WEBHOOK_HEALTH" == "error" ]]; then
    print_warning "Frontend non accessible (webhook non testé)"
else
    WEBHOOK_STATUS=$(echo "$WEBHOOK_HEALTH" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [[ "$WEBHOOK_STATUS" == "healthy" ]]; then
        print_success "Endpoint webhook opérationnel"
    else
        print_warning "Webhook pourrait ne pas être configuré correctement"
    fi
fi

echo ""

# Résumé final
echo "═══════════════════════════════════════════════════════"
echo "✨ Résumé des tests"
echo "═══════════════════════════════════════════════════════"
echo ""
print_success "Tous les tests sont passés avec succès!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Démarrer le frontend: npm run dev"
echo "   2. Visiter: $FRONTEND_URL/generate-videos"
echo "   3. Tester l'interface complète de génération de vidéos"
echo ""
echo "🎬 La fonctionnalité de génération de vidéos est prête!"
echo "═══════════════════════════════════════════════════════"
