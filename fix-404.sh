#!/bin/bash

##############################################################################
# Script de correction automatique - Erreur 404 Nginx
# Usage: ./fix-404.sh
# À exécuter sur le VPS en tant qu'utilisateur sorami
##############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="/home/sorami/sorami"
APP_NAME="sorami-frontend"

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

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Correction automatique - Erreur 404           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    log_error "Répertoire $APP_DIR non trouvé"
    exit 1
fi

cd $APP_DIR

# 1. Vérifier et corriger Nginx
log_info "🔧 Étape 1 : Vérification de Nginx..."

if ! systemctl is-active --quiet nginx; then
    log_warning "Nginx non actif, tentative de démarrage..."
    sudo systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        log_success "✅ Nginx démarré"
    else
        log_error "❌ Impossible de démarrer Nginx"
        log_info "Vérifiez manuellement: sudo systemctl status nginx"
        exit 1
    fi
else
    log_success "✅ Nginx actif"
fi

# Vérifier la configuration Nginx
if [ ! -f "/etc/nginx/sites-enabled/sorami" ]; then
    log_warning "Configuration Nginx non activée"
    
    if [ -f "/etc/nginx/sites-available/sorami" ]; then
        log_info "Activation de la configuration..."
        sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami
        log_success "✅ Configuration activée"
    else
        log_error "❌ Fichier /etc/nginx/sites-available/sorami manquant"
        log_info "Copiez nginx-sorami.conf vers /etc/nginx/sites-available/sorami"
        exit 1
    fi
fi

# Supprimer la config par défaut si elle existe
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    log_warning "Configuration Nginx par défaut trouvée, suppression..."
    sudo rm /etc/nginx/sites-enabled/default
    log_success "✅ Configuration par défaut supprimée"
fi

# Tester la configuration Nginx
log_info "Test de la configuration Nginx..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    log_success "✅ Configuration Nginx valide"
    
    log_info "Rechargement de Nginx..."
    sudo systemctl reload nginx
    log_success "✅ Nginx rechargé"
else
    log_error "❌ Configuration Nginx invalide"
    sudo nginx -t
    exit 1
fi

# 2. Vérifier et corriger PM2
log_info "🔧 Étape 2 : Vérification de PM2..."

if ! command -v pm2 &> /dev/null; then
    log_error "PM2 non installé"
    log_info "Installation de PM2..."
    npm install -g pm2
    log_success "✅ PM2 installé"
fi

# Vérifier si l'app est démarrée
if ! pm2 describe $APP_NAME > /dev/null 2>&1; then
    log_warning "Application non trouvée dans PM2"
    
    # Vérifier le build
    if [ ! -d ".next" ]; then
        log_warning "Build manquant, construction en cours..."
        
        log_info "Installation des dépendances..."
        npm install
        
        log_info "Génération du client Prisma..."
        npx prisma generate
        
        log_info "Build de l'application..."
        npm run build
        
        log_success "✅ Build terminé"
    fi
    
    log_info "Démarrage de l'application..."
    pm2 start ecosystem.config.js
    pm2 save
    log_success "✅ Application démarrée"
else
    # Vérifier le statut
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .pm2_env.status' 2>/dev/null || echo "unknown")
    
    if [ "$STATUS" == "online" ]; then
        log_success "✅ Application online"
        
        # Rebuild si le dossier .next est trop ancien (> 24h)
        if [ -d ".next" ]; then
            NEXT_AGE=$(find .next -maxdepth 0 -mmin +1440 2>/dev/null | wc -l)
            if [ "$NEXT_AGE" -gt 0 ]; then
                log_warning "Build ancien détecté (>24h), rebuild recommandé"
                
                read -p "Voulez-vous rebuilder l'application? (y/N) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log_info "Rebuild en cours..."
                    
                    pm2 stop $APP_NAME
                    npm install
                    npx prisma generate
                    npm run build
                    pm2 start $APP_NAME
                    
                    log_success "✅ Application rebuilée et redémarrée"
                fi
            fi
        fi
    else
        log_warning "Application non online (status: $STATUS), redémarrage..."
        pm2 restart $APP_NAME
        
        # Attendre que l'app démarre
        sleep 5
        
        NEW_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$NEW_STATUS" == "online" ]; then
            log_success "✅ Application redémarrée"
        else
            log_error "❌ Application ne démarre pas"
            log_info "Consultez les logs: pm2 logs $APP_NAME"
            exit 1
        fi
    fi
fi

# 3. Tests de connectivité
log_info "🔧 Étape 3 : Tests de connectivité..."

sleep 3

# Test localhost:3000
log_info "Test de Next.js sur localhost:3000..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    log_success "✅ Next.js répond (HTTP $HTTP_CODE)"
else
    log_error "❌ Next.js ne répond pas (HTTP $HTTP_CODE)"
    log_info "Vérifiez les logs: pm2 logs $APP_NAME"
    exit 1
fi

# Test domaine externe
log_info "Test du domaine sorami.app..."
EXTERNAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://sorami.app 2>/dev/null || echo "000")

if [ "$EXTERNAL_CODE" == "200" ] || [ "$EXTERNAL_CODE" == "301" ] || [ "$EXTERNAL_CODE" == "302" ]; then
    log_success "✅ Site accessible (HTTP $EXTERNAL_CODE)"
elif [ "$EXTERNAL_CODE" == "404" ]; then
    log_error "❌ Erreur 404 persistante"
    log_info "Vérifiez la configuration Nginx et les logs"
else
    log_warning "⚠️  Code HTTP inhabituel: $EXTERNAL_CODE"
fi

# 4. Afficher l'état final
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  État Final du Système                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

echo "📊 Status Nginx:"
systemctl is-active nginx && echo -e "${GREEN}   ✅ Actif${NC}" || echo -e "${RED}   ❌ Inactif${NC}"

echo ""
echo "📊 Status PM2:"
pm2 list | grep -E "name|$APP_NAME"

echo ""
echo "🌐 Tests de connectivité:"
echo "   - localhost:3000 : HTTP $HTTP_CODE"
echo "   - sorami.app : HTTP $EXTERNAL_CODE"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Correction terminée                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EXTERNAL_CODE" == "200" ] || [ "$EXTERNAL_CODE" == "301" ] || [ "$EXTERNAL_CODE" == "302" ]; then
    log_success "🎉 Le site devrait maintenant être accessible"
    echo ""
    echo "🔗 Testez dans votre navigateur :"
    echo "   - http://sorami.app"
    echo "   - https://sorami.app (si SSL configuré)"
else
    log_warning "⚠️  Des problèmes persistent"
    echo ""
    echo "📋 Actions supplémentaires :"
    echo "   1. Consultez les logs : pm2 logs $APP_NAME"
    echo "   2. Vérifiez Nginx : sudo tail -50 /var/log/nginx/sorami_error.log"
    echo "   3. Exécutez le diagnostic : ./diagnose-404.sh"
fi

echo ""
