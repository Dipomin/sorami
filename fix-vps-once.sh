#!/bin/bash
# Script de correction DÉFINITIVE des permissions VPS
# À exécuter UNE SEULE FOIS sur le VPS

set -e

echo "🔧 Correction DÉFINITIVE des permissions pour Sorami..."
echo ""
echo "Ce script va :"
echo "  1. Corriger toutes les permissions du répertoire"
echo "  2. Configurer sudo sans mot de passe pour npm/node"
echo "  3. Nettoyer complètement les dossiers de build"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : package.json non trouvé. Êtes-vous dans /home/sorami/sorami ?"
    exit 1
fi

echo "📂 Répertoire courant : $(pwd)"
echo ""

# Étape 1 : Corriger les permissions de TOUT le répertoire
echo "🔓 Correction des permissions (nécessite sudo)..."
sudo chown -R sorami:sorami /home/sorami/sorami
echo "✅ Permissions corrigées"
echo ""

# Étape 2 : Nettoyer complètement
echo "🧹 Nettoyage complet..."
sudo rm -rf node_modules .next package-lock.json .npm
echo "✅ Dossiers nettoyés"
echo ""

# Étape 3 : Nettoyer le cache npm
echo "🗑️  Nettoyage cache npm..."
npm cache clean --force
echo "✅ Cache nettoyé"
echo ""

# Étape 4 : Configurer sudo sans mot de passe pour les commandes de déploiement
echo "🔐 Configuration sudo sans mot de passe (nécessite sudo)..."
SUDOERS_FILE="/etc/sudoers.d/sorami-deploy"
echo "# Permet à sorami d'exécuter les commandes de nettoyage sans mot de passe" | sudo tee "$SUDOERS_FILE" > /dev/null
echo "sorami ALL=(ALL) NOPASSWD: /bin/rm, /bin/chown" | sudo tee -a "$SUDOERS_FILE" > /dev/null
sudo chmod 0440 "$SUDOERS_FILE"
echo "✅ Sudo configuré"
echo ""

# Étape 5 : Réinstaller les dépendances
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps
echo "✅ Dépendances installées"
echo ""

# Étape 6 : Générer Prisma
echo "🗄️  Génération Prisma..."
npx prisma generate
echo "✅ Prisma généré"
echo ""

# Étape 7 : Builder l'application
echo "🏗️  Build de l'application..."
npm run build
echo "✅ Build réussi"
echo ""

# Étape 8 : Redémarrer PM2
echo "🔄 Redémarrage PM2..."
pm2 reload sorami-frontend --update-env || pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2 redémarré"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Configuration terminée avec succès !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Les prochains déploiements GitHub Actions fonctionneront automatiquement."
echo ""
echo "📊 Statut actuel :"
pm2 status
