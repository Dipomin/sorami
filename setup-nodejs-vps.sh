#!/bin/bash
# Script d'installation de Node.js sur le VPS Ubuntu

set -e

echo "🔧 Installation de Node.js et npm sur le VPS..."

# Vérifier si Node.js est déjà installé
if command -v node &> /dev/null; then
    echo "✅ Node.js est déjà installé : $(node -v)"
    echo "✅ npm version : $(npm -v)"
    exit 0
fi

# Installer Node.js 20.x (LTS) via NodeSource
echo "📥 Installation de Node.js 20.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
echo "✅ Node.js installé : $(node -v)"
echo "✅ npm installé : $(npm -v)"

# Installer PM2 globalement si pas déjà installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    sudo npm install -g pm2
    echo "✅ PM2 installé : $(pm2 -v)"
else
    echo "✅ PM2 déjà installé : $(pm2 -v)"
fi

echo ""
echo "✨ Installation terminée !"
echo ""
echo "🚀 Prochaines étapes :"
echo "1. Naviguez vers le répertoire de l'application : cd /home/sorami/sorami"
echo "2. Installez les dépendances : npm ci"
echo "3. Générez Prisma : npx prisma generate"
echo "4. Buildez l'application : npm run build"
echo "5. Démarrez avec PM2 : pm2 start ecosystem.config.js"
