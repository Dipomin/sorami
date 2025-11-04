#!/bin/bash

##############################################################################
# Script de diagnostic pour erreur 404 - Sorami Frontend
# Usage: ./diagnose-404.sh
# À exécuter sur le VPS en tant qu'utilisateur sorami
##############################################################################

set +e  # Continue on error for diagnostic

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Diagnostic 404 - Sorami Frontend              ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# 1. Vérifier Nginx
echo -e "${CYAN}━━━ 1. État de Nginx ━━━${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx est actif${NC}"
    nginx -v 2>&1
else
    echo -e "${RED}❌ Nginx n'est PAS actif${NC}"
    echo "   Démarrez Nginx: sudo systemctl start nginx"
fi
echo ""

# 2. Vérifier la configuration Nginx
echo -e "${CYAN}━━━ 2. Configuration Nginx ━━━${NC}"
if [ -f "/etc/nginx/sites-enabled/sorami" ]; then
    echo -e "${GREEN}✅ Configuration Nginx trouvée: /etc/nginx/sites-enabled/sorami${NC}"
    
    # Vérifier la syntaxe
    if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
        echo -e "${GREEN}✅ Syntaxe Nginx valide${NC}"
    else
        echo -e "${RED}❌ Erreur de syntaxe Nginx:${NC}"
        sudo nginx -t 2>&1
    fi
else
    echo -e "${RED}❌ Configuration Nginx manquante: /etc/nginx/sites-enabled/sorami${NC}"
    echo "   Créez le lien symbolique:"
    echo "   sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/"
fi
echo ""

# 3. Vérifier PM2 et l'application Next.js
echo -e "${CYAN}━━━ 3. État de PM2 et Next.js ━━━${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 est installé${NC}"
    
    if pm2 describe sorami-frontend > /dev/null 2>&1; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="sorami-frontend") | .pm2_env.status' 2>/dev/null || echo "unknown")
        
        if [ "$STATUS" == "online" ]; then
            echo -e "${GREEN}✅ Application sorami-frontend est ONLINE${NC}"
            pm2 describe sorami-frontend | grep -E "status|uptime|restarts|cpu|memory"
        else
            echo -e "${RED}❌ Application sorami-frontend n'est PAS online (status: $STATUS)${NC}"
            echo "   Consultez les logs: pm2 logs sorami-frontend"
        fi
    else
        echo -e "${RED}❌ Application sorami-frontend non trouvée dans PM2${NC}"
        echo "   Démarrez l'application: pm2 start ecosystem.config.js"
    fi
    
    echo ""
    echo "Liste de toutes les apps PM2:"
    pm2 list
else
    echo -e "${RED}❌ PM2 n'est PAS installé${NC}"
    echo "   Installez PM2: npm install -g pm2"
fi
echo ""

# 4. Vérifier que Next.js répond sur localhost:3000
echo -e "${CYAN}━━━ 4. Test de connexion localhost:3000 ━━━${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    echo -e "${GREEN}✅ Next.js répond sur localhost:3000 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Next.js ne répond PAS sur localhost:3000 (HTTP $HTTP_CODE)${NC}"
    echo "   Vérifiez que l'application est démarrée"
fi
echo ""

# 5. Vérifier les ports en écoute
echo -e "${CYAN}━━━ 5. Ports en écoute ━━━${NC}"
echo "Port 80 (HTTP):"
if sudo netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    echo -e "${GREEN}✅ Port 80 en écoute${NC}"
    sudo netstat -tlnp | grep ":80 "
else
    echo -e "${RED}❌ Port 80 non en écoute${NC}"
fi

echo ""
echo "Port 443 (HTTPS):"
if sudo netstat -tlnp 2>/dev/null | grep -q ":443 "; then
    echo -e "${GREEN}✅ Port 443 en écoute${NC}"
    sudo netstat -tlnp | grep ":443 "
else
    echo -e "${RED}❌ Port 443 non en écoute${NC}"
fi

echo ""
echo "Port 3000 (Next.js):"
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo -e "${GREEN}✅ Port 3000 en écoute${NC}"
    netstat -tlnp | grep ":3000 "
else
    echo -e "${RED}❌ Port 3000 non en écoute${NC}"
fi
echo ""

# 6. Vérifier le répertoire de l'application
echo -e "${CYAN}━━━ 6. Répertoire de l'application ━━━${NC}"
APP_DIR="/home/sorami/sorami"
if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire trouvé: $APP_DIR${NC}"
    
    if [ -d "$APP_DIR/.next" ]; then
        echo -e "${GREEN}✅ Build Next.js trouvé (.next/)${NC}"
        echo "   Taille du build: $(du -sh $APP_DIR/.next 2>/dev/null | cut -f1)"
    else
        echo -e "${RED}❌ Build Next.js manquant (.next/)${NC}"
        echo "   Lancez: npm run build"
    fi
    
    if [ -f "$APP_DIR/package.json" ]; then
        echo -e "${GREEN}✅ package.json trouvé${NC}"
    else
        echo -e "${RED}❌ package.json manquant${NC}"
    fi
    
    if [ -d "$APP_DIR/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules trouvé${NC}"
    else
        echo -e "${RED}❌ node_modules manquant${NC}"
        echo "   Lancez: npm install"
    fi
else
    echo -e "${RED}❌ Répertoire de l'application manquant: $APP_DIR${NC}"
fi
echo ""

# 7. Vérifier les logs Nginx
echo -e "${CYAN}━━━ 7. Dernières erreurs Nginx ━━━${NC}"
if [ -f "/var/log/nginx/sorami_error.log" ]; then
    echo "Dernières 10 lignes du log d'erreur:"
    sudo tail -10 /var/log/nginx/sorami_error.log 2>/dev/null || echo "Aucune erreur récente"
else
    echo -e "${YELLOW}⚠️  Fichier de log non trouvé: /var/log/nginx/sorami_error.log${NC}"
fi
echo ""

# 8. Vérifier les certificats SSL
echo -e "${CYAN}━━━ 8. Certificats SSL ━━━${NC}"
if [ -f "/etc/letsencrypt/live/sorami.app/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificat SSL trouvé${NC}"
    echo "   Expiration:"
    sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/sorami.app/fullchain.pem 2>/dev/null || echo "   Impossible de lire"
else
    echo -e "${YELLOW}⚠️  Certificat SSL manquant${NC}"
    echo "   Configuration HTTP seulement?"
fi
echo ""

# 9. Test de requête externe
echo -e "${CYAN}━━━ 9. Test de requête externe ━━━${NC}"
echo "Test HTTP sur votre domaine:"
EXTERNAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://sorami.app 2>/dev/null || echo "000")
echo "   HTTP Code: $EXTERNAL_CODE"

if [ "$EXTERNAL_CODE" == "301" ] || [ "$EXTERNAL_CODE" == "302" ]; then
    echo -e "${GREEN}✅ Redirection HTTPS active${NC}"
elif [ "$EXTERNAL_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Site accessible${NC}"
elif [ "$EXTERNAL_CODE" == "404" ]; then
    echo -e "${RED}❌ Erreur 404 confirmée${NC}"
else
    echo -e "${RED}❌ Erreur: $EXTERNAL_CODE${NC}"
fi
echo ""

# 10. Résumé et recommandations
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Résumé et Actions Recommandées               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Déterminer le problème principal
if ! systemctl is-active --quiet nginx; then
    echo -e "${RED}🔥 PROBLÈME CRITIQUE: Nginx non actif${NC}"
    echo "   1. sudo systemctl start nginx"
    echo "   2. sudo systemctl enable nginx"
elif ! pm2 describe sorami-frontend > /dev/null 2>&1; then
    echo -e "${RED}🔥 PROBLÈME CRITIQUE: Application non démarrée dans PM2${NC}"
    echo "   1. cd /home/sorami/sorami"
    echo "   2. pm2 start ecosystem.config.js"
    echo "   3. pm2 save"
elif [ ! -d "/home/sorami/sorami/.next" ]; then
    echo -e "${RED}🔥 PROBLÈME CRITIQUE: Build Next.js manquant${NC}"
    echo "   1. cd /home/sorami/sorami"
    echo "   2. npm install"
    echo "   3. npm run build"
    echo "   4. pm2 restart sorami-frontend"
elif [ "$HTTP_CODE" == "000" ]; then
    echo -e "${RED}🔥 PROBLÈME CRITIQUE: Next.js ne répond pas sur localhost:3000${NC}"
    echo "   1. pm2 logs sorami-frontend --lines 50"
    echo "   2. Vérifiez les erreurs dans les logs"
    echo "   3. pm2 restart sorami-frontend"
elif [ ! -f "/etc/nginx/sites-enabled/sorami" ]; then
    echo -e "${RED}🔥 PROBLÈME: Configuration Nginx non activée${NC}"
    echo "   1. sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/"
    echo "   2. sudo nginx -t"
    echo "   3. sudo systemctl reload nginx"
else
    echo -e "${YELLOW}⚠️  Analyse manuelle requise${NC}"
    echo "   Consultez les logs détaillés:"
    echo "   - pm2 logs sorami-frontend"
    echo "   - sudo tail -50 /var/log/nginx/sorami_error.log"
    echo "   - sudo tail -50 /var/log/nginx/sorami_access.log"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Diagnostic terminé. Pour plus d'aide, contactez l'équipe technique."
echo ""
