#!/bin/bash
# Script pour corriger les conflits de configuration Nginx après Certbot
# À exécuter sur le VPS après l'obtention du certificat SSL

set -e

echo "🔧 Correction des conflits de configuration Nginx..."

# 1. Sauvegarder la configuration actuelle
echo "📦 Sauvegarde de la configuration actuelle..."
sudo cp /etc/nginx/sites-available/sorami /etc/nginx/sites-available/sorami.backup-$(date +%Y%m%d-%H%M%S)

# 2. Désactiver le site temporairement
echo "⏸️  Désactivation temporaire du site..."
sudo rm -f /etc/nginx/sites-enabled/sorami

# 3. Copier la configuration complète (qui inclut déjà SSL)
echo "📝 Application de la configuration complète..."
sudo cp ~/sorami/nginx-sorami.conf /etc/nginx/sites-available/sorami

# 4. Réactiver le site
echo "✅ Réactivation du site..."
sudo ln -sf /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami

# 5. Tester la configuration
echo "🧪 Test de la configuration..."
if sudo nginx -t; then
    echo "✅ Configuration valide !"
    
    # 6. Recharger Nginx
    echo "🔄 Rechargement de Nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✨ Configuration corrigée avec succès !"
    echo ""
    echo "🔍 Vérification finale :"
    sudo nginx -t 2>&1 | grep -i "warn" || echo "✅ Aucun avertissement détecté"
else
    echo "❌ Erreur dans la configuration !"
    echo "🔙 Restauration de la sauvegarde..."
    sudo cp /etc/nginx/sites-available/sorami.backup-* /etc/nginx/sites-available/sorami
    sudo ln -sf /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami
    exit 1
fi

echo ""
echo "📊 Statut des services :"
sudo systemctl status nginx --no-pager -l | head -n 5

echo ""
echo "🎉 Terminé ! Votre configuration Nginx est maintenant optimale."
