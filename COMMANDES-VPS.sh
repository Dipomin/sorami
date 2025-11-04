#!/bin/bash
# INSTRUCTIONS POUR RÉSOUDRE L'ERREUR 404
# Copiez et collez ces commandes UNE PAR UNE sur votre VPS

echo "════════════════════════════════════════════════════════════════"
echo "  RÉSOLUTION ERREUR 404 - COMMANDES À EXÉCUTER SUR LE VPS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ÉTAPE 1 : Vérifier l'état actuel
echo "📊 ÉTAPE 1 : Vérification de l'état actuel"
echo "-----------------------------------------------------------"
echo "Commande à exécuter :"
echo ""
echo "pm2 list && sudo systemctl status nginx"
echo ""
read -p "Appuyez sur ENTRÉE après avoir exécuté la commande ci-dessus..."
echo ""

# ÉTAPE 2 : Vérifier Nginx
echo "🔧 ÉTAPE 2 : Vérifier et démarrer Nginx"
echo "-----------------------------------------------------------"
echo "Si Nginx n'est PAS actif, exécutez :"
echo ""
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo ""
read -p "Nginx est-il maintenant actif? (y/n) " nginx_status
echo ""

if [ "$nginx_status" != "y" ]; then
    echo "⚠️  Vérifiez les logs Nginx :"
    echo "sudo journalctl -u nginx -n 50"
    echo ""
fi

# ÉTAPE 3 : Activer la configuration Nginx
echo "🔧 ÉTAPE 3 : Activer la configuration Nginx"
echo "-----------------------------------------------------------"
echo "Exécutez ces commandes :"
echo ""
echo "sudo ln -sf /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami"
echo "sudo rm -f /etc/nginx/sites-enabled/default"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""
read -p "Appuyez sur ENTRÉE après avoir exécuté ces commandes..."
echo ""

# ÉTAPE 4 : Vérifier PM2
echo "🔧 ÉTAPE 4 : Vérifier et démarrer l'application"
echo "-----------------------------------------------------------"
echo "Si l'application n'est PAS dans la liste PM2, exécutez :"
echo ""
echo "cd /home/sorami/sorami"
echo "pm2 start ecosystem.config.js"
echo "pm2 save"
echo ""
echo "Si l'application est 'errored' ou 'stopped', exécutez :"
echo ""
echo "pm2 restart sorami-frontend"
echo ""
read -p "Appuyez sur ENTRÉE après avoir exécuté ces commandes..."
echo ""

# ÉTAPE 5 : Vérifier le build
echo "🔧 ÉTAPE 5 : Vérifier le build Next.js"
echo "-----------------------------------------------------------"
echo "Vérifiez si le dossier .next existe :"
echo ""
echo "ls -la /home/sorami/sorami/.next"
echo ""
read -p "Le dossier .next existe-t-il? (y/n) " build_exists
echo ""

if [ "$build_exists" != "y" ]; then
    echo "⚠️  Build manquant ! Exécutez :"
    echo ""
    echo "cd /home/sorami/sorami"
    echo "npm install"
    echo "npx prisma generate"
    echo "npm run build"
    echo "pm2 restart sorami-frontend"
    echo ""
    read -p "Appuyez sur ENTRÉE après avoir exécuté ces commandes..."
fi
echo ""

# ÉTAPE 6 : Tests
echo "🧪 ÉTAPE 6 : Tests de connectivité"
echo "-----------------------------------------------------------"
echo "Testez si Next.js répond :"
echo ""
echo "curl -I http://localhost:3000"
echo ""
read -p "Quel est le code HTTP retourné? (ex: 200, 301, 404, 502) " local_code
echo ""

if [ "$local_code" == "200" ] || [ "$local_code" == "301" ] || [ "$local_code" == "302" ]; then
    echo "✅ Next.js répond correctement!"
else
    echo "❌ Next.js ne répond pas correctement"
    echo "Consultez les logs :"
    echo "pm2 logs sorami-frontend --lines 50"
    echo ""
fi

echo "Testez le site externe :"
echo ""
echo "curl -I http://sorami.app"
echo ""
read -p "Quel est le code HTTP retourné? (ex: 200, 301, 404) " external_code
echo ""

if [ "$external_code" == "200" ] || [ "$external_code" == "301" ] || [ "$external_code" == "302" ]; then
    echo "✅ Site accessible depuis l'extérieur!"
else
    echo "❌ Site non accessible"
    echo "Vérifiez les logs Nginx :"
    echo "sudo tail -50 /var/log/nginx/sorami_error.log"
    echo ""
fi

# ÉTAPE 7 : Résumé
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RÉSUMÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ "$local_code" == "200" ] && [ "$external_code" == "200" ]; then
    echo "🎉 SUCCÈS ! Le site devrait maintenant fonctionner"
    echo ""
    echo "Vérifications finales :"
    echo "1. Ouvrez http://sorami.app dans votre navigateur"
    echo "2. Vérifiez que vous pouvez vous connecter"
    echo "3. Testez une fonctionnalité (ex: génération de contenu)"
elif [ "$local_code" == "200" ] && [ "$external_code" != "200" ]; then
    echo "⚠️  L'application fonctionne localement mais pas depuis l'extérieur"
    echo ""
    echo "Problème probable : Configuration Nginx ou DNS"
    echo ""
    echo "Actions à faire :"
    echo "1. Vérifiez la configuration Nginx :"
    echo "   sudo nginx -t"
    echo "   sudo cat /etc/nginx/sites-enabled/sorami | grep -A 5 'location'"
    echo ""
    echo "2. Vérifiez que le domaine pointe vers votre VPS :"
    echo "   nslookup sorami.app"
    echo ""
    echo "3. Vérifiez le firewall :"
    echo "   sudo ufw status"
elif [ "$local_code" != "200" ]; then
    echo "❌ L'application Next.js ne répond pas correctement"
    echo ""
    echo "Actions à faire :"
    echo "1. Consultez les logs PM2 :"
    echo "   pm2 logs sorami-frontend --lines 100"
    echo ""
    echo "2. Vérifiez les variables d'environnement :"
    echo "   pm2 show sorami-frontend"
    echo ""
    echo "3. Essayez un redéploiement complet :"
    echo "   cd /home/sorami/sorami"
    echo "   rm -rf .next node_modules"
    echo "   npm install"
    echo "   npm run build"
    echo "   pm2 restart sorami-frontend"
else
    echo "⚠️  État indéterminé"
    echo ""
    echo "Utilisez les scripts de diagnostic :"
    echo "   ./quick-check.sh"
    echo "   ./diagnose-404.sh"
    echo "   ./fix-404.sh"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  COMMANDES UTILES"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Logs en temps réel :"
echo "  pm2 logs sorami-frontend"
echo ""
echo "Status des services :"
echo "  pm2 status"
echo "  sudo systemctl status nginx"
echo ""
echo "Redémarrer les services :"
echo "  pm2 restart sorami-frontend"
echo "  sudo systemctl restart nginx"
echo ""
echo "Tests de connectivité :"
echo "  curl -I http://localhost:3000"
echo "  curl -I http://sorami.app"
echo ""
echo "════════════════════════════════════════════════════════════════"
