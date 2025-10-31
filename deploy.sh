#!/bin/bash

##############################################################################
# Script de déploiement automatisé - Sorami Frontend
# Usage: ./deploy.sh [environment]
# Environnements disponibles: production, staging
##############################################################################

set -e  # Exit on error

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sorami-frontend"
APP_DIR="/home/sorami/sorami"
ENV=${1:-production}
BACKUP_DIR="/home/sorami/backups"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que l'utilisateur est 'sorami'
if [ "$USER" != "sorami" ]; then
    log_error "Ce script doit être exécuté avec l'utilisateur 'sorami'"
    exit 1
fi

# Vérifier que l'environnement est valide
if [ "$ENV" != "production" ] && [ "$ENV" != "staging" ]; then
    log_error "Environnement invalide. Utilisez 'production' ou 'staging'"
    exit 1
fi

log_info "🚀 Déploiement de Sorami Frontend - Environnement: $ENV"
echo "=============================================="

# 1. Backup de la base de données
log_info "📦 Backup de la base de données..."
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

if command -v mysqldump &> /dev/null; then
    log_info "Création du backup MySQL..."
    # Remplacer avec vos credentials
    # mysqldump -h host -u user -ppassword sorami | gzip > $BACKUP_DIR/sorami_$DATE.sql.gz
    log_warning "⚠️  Backup MySQL désactivé - configurez vos credentials dans le script"
else
    log_warning "mysqldump non disponible - skip backup"
fi

# 2. Vérifier que le répertoire existe
if [ ! -d "$APP_DIR" ]; then
    log_error "Le répertoire $APP_DIR n'existe pas"
    exit 1
fi

cd $APP_DIR

# 3. Sauvegarder l'ancien build
log_info "💾 Sauvegarde de l'ancien build..."
if [ -d ".next" ]; then
    mv .next .next.backup.$DATE 2>/dev/null || true
fi

# 4. Pull des dernières modifications
log_info "📥 Récupération des dernières modifications..."
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_info "Branche actuelle: $CURRENT_BRANCH"

# Stash les changements locaux s'il y en a
if ! git diff-index --quiet HEAD --; then
    log_warning "Changements locaux détectés - stash en cours..."
    git stash save "Auto-stash before deploy $DATE"
fi

git pull origin $CURRENT_BRANCH

COMMIT_HASH=$(git rev-parse --short HEAD)
log_success "✅ Code mis à jour - Commit: $COMMIT_HASH"

# 5. Vérifier le fichier d'environnement
log_info "🔧 Vérification de l'environnement..."
ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
    log_error "Fichier $ENV_FILE manquant!"
    log_error ""
    log_error "📝 Pour créer le fichier, exécutez :"
    log_error "   nano $ENV_FILE"
    log_error ""
    log_error "📋 Variables requises :"
    log_error "   DATABASE_URL=\"mysql://user:pass@host:3306/sorami\""
    log_error "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_live_...\""
    log_error "   CLERK_SECRET_KEY=\"sk_live_...\""
    log_error "   PAYSTACK_SECRET_KEY=\"sk_live_...\""
    log_error "   PAYSTACK_PUBLIC_KEY=\"pk_live_...\""
    log_error "   AWS_ACCESS_KEY_ID=\"AKIA...\""
    log_error "   AWS_SECRET_ACCESS_KEY=\"...\""
    log_error "   AWS_S3_BUCKET_NAME=\"sorami-production\""
    log_error "   NEXT_PUBLIC_API_URL=\"https://api.sorami.app\""
    log_error "   WEBHOOK_SECRET=\"sorami-webhook-secret-key-2025\""
    log_error ""
    log_error "💡 Ou copiez depuis l'exemple :"
    log_error "   cp .env.production.example $ENV_FILE"
    log_error "   nano $ENV_FILE  # Puis éditez avec vos vraies valeurs"
    exit 1
fi

# Copier le fichier d'environnement vers .env (utilisé par Next.js)
log_info "Configuration de .env pour le build..."
cp $ENV_FILE .env
log_success "✅ Variables d'environnement configurées ($ENV_FILE → .env)"

# 6. Installer les dépendances
log_info "📦 Installation des dépendances..."
npm ci --production=false

# 7. Prisma - Générer le client et migrations
log_info "🔄 Configuration de Prisma..."
npx prisma generate

log_info "🗄️  Application des migrations de base de données..."
if npx prisma migrate deploy; then
    log_success "✅ Migrations appliquées avec succès"
else
    log_error "❌ Échec des migrations - vérifiez la connexion à la base de données"
    
    # Restaurer l'ancien build en cas d'erreur
    if [ -d ".next.backup.$DATE" ]; then
        log_info "Restauration de l'ancien build..."
        rm -rf .next
        mv .next.backup.$DATE .next
    fi
    exit 1
fi

# 8. Build de l'application
log_info "🏗️  Build de l'application Next.js..."
if npm run build; then
    log_success "✅ Build réussi"
    
    # Supprimer l'ancien backup si le build est OK
    rm -rf .next.backup.* 2>/dev/null || true
else
    log_error "❌ Échec du build"
    
    # Restaurer l'ancien build
    if [ -d ".next.backup.$DATE" ]; then
        log_info "Restauration de l'ancien build..."
        rm -rf .next
        mv .next.backup.$DATE .next
    fi
    exit 1
fi

# 9. Health check avant redémarrage
log_info "🏥 Health check de l'application actuelle..."
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    log_info "Application en cours d'exécution"
else
    log_warning "Application non démarrée - premier déploiement"
fi

# 10. Redémarrer l'application avec PM2
log_info "🔄 Redémarrage de l'application..."

if pm2 describe $APP_NAME > /dev/null 2>&1; then
    # Application existante - reload graceful
    log_info "Reload graceful de l'application..."
    pm2 reload $APP_NAME --update-env
else
    # Première installation
    log_info "Premier démarrage de l'application..."
    pm2 start ecosystem.config.js
fi

pm2 save

log_success "✅ Application redémarrée"

# 11. Vérifier le statut
log_info "📊 Vérification du statut..."
sleep 3

if pm2 describe $APP_NAME | grep -q "online"; then
    log_success "✅ Application en ligne"
else
    log_error "❌ Application non démarrée correctement"
    log_info "Consultez les logs: pm2 logs $APP_NAME"
    exit 1
fi

# 12. Test de santé HTTP
log_info "🌐 Test de santé HTTP..."
sleep 2

if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log_success "✅ Application répond correctement"
else
    log_warning "⚠️  Application ne répond pas encore - vérifiez les logs"
fi

# 13. Nettoyer les anciens fichiers
log_info "🧹 Nettoyage..."
find $BACKUP_DIR -name "sorami_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# 14. Afficher les informations de déploiement
echo ""
echo "=============================================="
log_success "🎉 Déploiement terminé avec succès!"
echo "=============================================="
echo ""
echo "📊 Informations de déploiement:"
echo "   - Environnement: $ENV"
echo "   - Commit: $COMMIT_HASH"
echo "   - Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔗 Commandes utiles:"
echo "   - Logs:      pm2 logs $APP_NAME"
echo "   - Status:    pm2 status"
echo "   - Monitor:   pm2 monit"
echo "   - Restart:   pm2 restart $APP_NAME"
echo ""

# 15. Notification (optionnelle)
# Vous pouvez ajouter une notification Slack, Discord, email, etc.
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"✅ Sorami Frontend déployé avec succès"}' \
#   YOUR_WEBHOOK_URL

exit 0
