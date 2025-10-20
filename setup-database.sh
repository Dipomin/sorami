#!/bin/bash

# Script d'installation et configuration de la base de données sorami
# Utilisation: ./setup-database.sh [environment]
# Exemple: ./setup-database.sh development

set -e

ENVIRONMENT=${1:-development}
echo "🚀 Configuration de la base de données pour l'environnement: $ENVIRONMENT"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    echo "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier PostgreSQL (optionnel)
    if command -v psql &> /dev/null; then
        log_info "PostgreSQL détecté"
    else
        log_warning "PostgreSQL non détecté - assurez-vous d'avoir une base de données configurée"
    fi
    
    log_info "Prérequis vérifiés"
}

# Installation des dépendances
install_dependencies() {
    echo "📦 Installation des dépendances Prisma..."
    
    # Installer les dépendances principales si pas déjà installées
    if [ ! -d "node_modules/@prisma" ]; then
        npm install @prisma/client prisma
    fi
    
    # Installer les dépendances de développement
    npm install --save-dev @types/bcryptjs @types/node ts-node typescript
    
    # Installer bcryptjs pour le seeding
    npm install bcryptjs
    
    log_info "Dépendances installées"
}

# Configuration de l'environnement
setup_environment() {
    echo "⚙️  Configuration de l'environnement..."
    
    # Copier le fichier .env.example si .env n'existe pas
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        log_warning "Fichier .env créé depuis .env.example - Veuillez le configurer"
        log_warning "Notamment DATABASE_URL et autres variables sensibles"
    elif [ ! -f ".env" ]; then
        log_error "Aucun fichier .env ou .env.example trouvé"
        exit 1
    fi
    
    log_info "Environnement configuré"
}

# Génération du client Prisma
generate_client() {
    echo "🔧 Génération du client Prisma..."
    npx prisma generate
    log_info "Client Prisma généré"
}

# Validation du schéma
validate_schema() {
    echo "✅ Validation du schéma Prisma..."
    npx prisma validate
    log_info "Schéma validé"
}

# Migration de la base de données
migrate_database() {
    echo "🗄️  Migration de la base de données..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # En production, utiliser migrate deploy
        npx prisma migrate deploy
        log_info "Migration de production appliquée"
    else
        # En développement, utiliser migrate dev
        npx prisma migrate dev --name init
        log_info "Migration de développement appliquée"
    fi
}

# Seeding de la base de données
seed_database() {
    if [ "$ENVIRONMENT" != "production" ]; then
        echo "🌱 Seeding de la base de données..."
        npx ts-node prisma/seed.ts
        log_info "Base de données seedée avec succès"
    else
        log_warning "Seeding ignoré en production"
    fi
}

# Ouverture de Prisma Studio (optionnel)
open_studio() {
    if [ "$ENVIRONMENT" = "development" ]; then
        read -p "Voulez-vous ouvrir Prisma Studio ? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🎨 Ouverture de Prisma Studio..."
            npx prisma studio
        fi
    fi
}

# Fonction principale
main() {
    echo "🎯 sorami Database Setup"
    echo "======================"
    
    check_prerequisites
    install_dependencies
    setup_environment
    validate_schema
    generate_client
    migrate_database
    seed_database
    
    log_info "Configuration terminée avec succès!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Vérifiez votre fichier .env"
    echo "2. Configurez vos variables d'environnement"
    echo "3. Lancez votre application avec 'npm run dev'"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "- npx prisma studio    # Interface d'administration"
    echo "- npx prisma generate  # Régénérer le client"
    echo "- npx prisma migrate dev # Nouvelle migration"
    echo ""
    
    open_studio
}

# Gestion des erreurs
trap 'log_error "Erreur lors de la configuration. Vérifiez les logs ci-dessus."' ERR

# Exécution
main