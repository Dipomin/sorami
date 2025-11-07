#!/bin/bash
# Script de correction des permissions pour le déploiement VPS

set -e

echo "🔧 Correction des permissions pour Sorami..."

# Naviguer vers le répertoire
cd /home/sorami/sorami || {
    echo "❌ Erreur : Répertoire /home/sorami/sorami non trouvé"
    exit 1
}

echo "📂 Répertoire courant : $(pwd)"

# Corriger les permissions du répertoire complet
echo "🔓 Correction des permissions du répertoire..."
sudo chown -R sorami:sorami /home/sorami/sorami

# Supprimer node_modules s'il existe (avec sudo si nécessaire)
if [ -d "node_modules" ]; then
    echo "🗑️  Suppression de node_modules..."
    sudo rm -rf node_modules
fi

# Supprimer .next s'il existe (avec sudo si nécessaire)
if [ -d ".next" ]; then
    echo "🗑️  Suppression de .next..."
    sudo rm -rf .next
fi

# Supprimer package-lock.json s'il existe
if [ -f "package-lock.json" ]; then
    echo "🗑️  Suppression de package-lock.json..."
    rm -f package-lock.json
fi

# Supprimer le cache npm
echo "🧹 Nettoyage du cache npm..."
npm cache clean --force

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
npm install --legacy-peer-deps

# Générer Prisma
echo "🗄️  Génération Prisma..."
npx prisma generate

# Builder l'application
echo "🏗️  Build de l'application..."
npm run build

# Redémarrer PM2
echo "🔄 Redémarrage PM2..."
pm2 reload sorami-frontend --update-env || pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Corrections terminées avec succès !"
echo ""
echo "📊 Statut PM2 :"
pm2 status
