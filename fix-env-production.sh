#!/bin/bash

echo "🔧 Correction : Migration des variables Paystack vers .env.production"
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "❌ Erreur : .env introuvable"
    exit 1
fi

# Créer .env.production s'il n'existe pas
if [ ! -f .env.production ]; then
    echo "📝 Création de .env.production..."
    touch .env.production
fi

# Sauvegarder l'ancien .env.production
if [ -s .env.production ]; then
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Sauvegarde créée : .env.production.backup.*"
fi

# Extraire les variables Paystack de .env
echo ""
echo "🔍 Extraction des variables Paystack depuis .env..."
grep -E "^PAYSTACK_" .env > /tmp/paystack_vars.tmp 2>/dev/null

if [ ! -s /tmp/paystack_vars.tmp ]; then
    echo "❌ Aucune variable PAYSTACK_* trouvée dans .env"
    exit 1
fi

echo "✅ Variables trouvées :"
grep -E "^PAYSTACK_" .env | sed 's/=.*/=***masqué***/'

# Supprimer les anciennes variables Paystack de .env.production
grep -v "^PAYSTACK_" .env.production > /tmp/env_production_clean.tmp 2>/dev/null || touch /tmp/env_production_clean.tmp

# Ajouter les nouvelles variables Paystack
cat /tmp/env_production_clean.tmp > .env.production
echo "" >> .env.production
echo "# Variables Paystack (copiées depuis .env le $(date))" >> .env.production
cat /tmp/paystack_vars.tmp >> .env.production

# Nettoyer
rm /tmp/paystack_vars.tmp /tmp/env_production_clean.tmp

echo ""
echo "✅ .env.production mis à jour avec les variables Paystack"
echo ""
echo "📋 Vérification :"
grep -E "^PAYSTACK_" .env.production | sed 's/=.*/=***masqué***/'
echo ""
echo "🚀 Prochaine étape : pm2 restart all"

