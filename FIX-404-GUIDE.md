# 🔧 Guide de Résolution - Erreur 404 Nginx

## 🎯 Symptôme
```
404 Not Found
nginx/1.24.0 (Ubuntu)
```

## 📊 Diagnostic Rapide

### Étape 1 : Lancer le script de diagnostic

Sur votre VPS, en tant qu'utilisateur `sorami` :

```bash
cd /home/sorami/sorami
chmod +x diagnose-404.sh
./diagnose-404.sh
```

Le script identifiera automatiquement le problème.

---

## 🔍 Causes Fréquentes et Solutions

### ❌ Cause 1 : Application Next.js non démarrée

**Symptômes :**
- PM2 ne liste pas `sorami-frontend`
- Port 3000 non en écoute

**Solution :**
```bash
cd /home/sorami/sorami

# Vérifier le build
ls -la .next

# Si .next manque, builder
npm install
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save

# Vérifier
pm2 status
pm2 logs sorami-frontend
```

---

### ❌ Cause 2 : Configuration Nginx manquante ou mal configurée

**Symptômes :**
- Nginx actif mais renvoie 404
- Configuration dans sites-available mais pas dans sites-enabled

**Solution :**
```bash
# Vérifier la configuration
sudo nginx -t

# Si le fichier existe mais n'est pas activé
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami

# Supprimer la configuration par défaut si elle interfère
sudo rm /etc/nginx/sites-enabled/default

# Recharger Nginx
sudo systemctl reload nginx
```

**Vérifier le fichier de configuration** (`/etc/nginx/sites-available/sorami`) :

```nginx
# Doit contenir
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name sorami.app www.sorami.app;
    
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### ❌ Cause 3 : Next.js écoute sur le mauvais port

**Symptômes :**
- PM2 indique que l'app est online
- Mais `curl http://localhost:3000` échoue

**Solution :**
```bash
# Vérifier la configuration PM2
cat ecosystem.config.js | grep -A 3 "env:"

# Doit contenir PORT: 3000
# Si différent, modifier et redémarrer
pm2 restart sorami-frontend --update-env

# Vérifier les variables d'environnement
pm2 show sorami-frontend | grep PORT
```

---

### ❌ Cause 4 : Build Next.js corrompu ou incomplet

**Symptômes :**
- `.next` existe mais l'app crash au démarrage
- Erreurs dans `pm2 logs`

**Solution :**
```bash
cd /home/sorami/sorami

# Nettoyer complètement
rm -rf .next
rm -rf node_modules
npm cache clean --force

# Réinstaller et rebuilder
npm install
npm run build

# Redémarrer
pm2 restart sorami-frontend
```

---

### ❌ Cause 5 : Firewall bloque les ports

**Symptômes :**
- Tout fonctionne en local
- Mais erreur 404 depuis l'extérieur

**Solution :**
```bash
# Vérifier le firewall
sudo ufw status

# Autoriser les ports nécessaires
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Si vous utilisez iptables
sudo iptables -L -n

# Autoriser
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

---

### ❌ Cause 6 : Problème de permissions

**Symptômes :**
- Erreurs "Permission denied" dans les logs Nginx
- `/var/cache/nginx` inaccessible

**Solution :**
```bash
# Vérifier les permissions du répertoire
ls -la /home/sorami/sorami

# Corriger si nécessaire
sudo chown -R sorami:sorami /home/sorami/sorami

# Permissions du cache Nginx
sudo mkdir -p /var/cache/nginx/sorami
sudo chown -R www-data:www-data /var/cache/nginx
sudo chmod -R 755 /var/cache/nginx
```

---

### ❌ Cause 7 : DNS mal configuré

**Symptômes :**
- `curl http://localhost:3000` fonctionne
- Mais l'URL du domaine ne résout pas

**Solution :**
```bash
# Vérifier la résolution DNS
nslookup sorami.app
dig sorami.app

# Vérifier que l'IP correspond à votre VPS
curl -I http://$(curl -s ifconfig.me)

# Si problème DNS, configurer dans votre registrar :
# A Record : sorami.app -> IP_VPS
# A Record : www.sorami.app -> IP_VPS
```

---

## 🚀 Procédure de Redéploiement Complet

Si rien ne fonctionne, redéploiement from scratch :

```bash
# 1. Arrêter l'application
pm2 stop sorami-frontend
pm2 delete sorami-frontend

# 2. Nettoyer
cd /home/sorami/sorami
rm -rf .next node_modules

# 3. Pull du code
git fetch origin
git reset --hard origin/main

# 4. Installer et builder
npm install
npx prisma generate
npm run build

# 5. Redémarrer
pm2 start ecosystem.config.js
pm2 save

# 6. Recharger Nginx
sudo systemctl reload nginx

# 7. Vérifier
pm2 logs sorami-frontend --lines 50
curl -I http://localhost:3000
curl -I http://sorami.app
```

---

## 📋 Checklist de Vérification

- [ ] **Nginx** : `sudo systemctl status nginx` → actif
- [ ] **PM2** : `pm2 list` → sorami-frontend online
- [ ] **Port 3000** : `curl http://localhost:3000` → 200 ou 301
- [ ] **Build** : `ls /home/sorami/sorami/.next` → existe
- [ ] **Config Nginx** : `/etc/nginx/sites-enabled/sorami` → existe
- [ ] **Syntax Nginx** : `sudo nginx -t` → OK
- [ ] **Logs** : `pm2 logs sorami-frontend` → pas d'erreur
- [ ] **DNS** : `nslookup sorami.app` → pointe vers VPS
- [ ] **Firewall** : `sudo ufw status` → ports 80/443 ouverts

---

## 📱 Tests de Validation

Une fois résolu, testez :

```bash
# Test 1 : Localhost
curl -I http://localhost:3000
# Attendu : 200 OK ou 301

# Test 2 : HTTP
curl -I http://sorami.app
# Attendu : 301 redirect vers HTTPS

# Test 3 : HTTPS
curl -I https://sorami.app
# Attendu : 200 OK

# Test 4 : API
curl -I https://sorami.app/api/health
# Attendu : 200 OK
```

---

## 🆘 Logs à Consulter

Si le problème persiste :

```bash
# Logs PM2
pm2 logs sorami-frontend --lines 100

# Logs Nginx erreurs
sudo tail -100 /var/log/nginx/sorami_error.log

# Logs Nginx accès
sudo tail -100 /var/log/nginx/sorami_access.log

# Logs système
sudo journalctl -u nginx -n 100
```

---

## 📞 Support

Si aucune solution ne fonctionne :

1. Exécutez le script de diagnostic complet
2. Collectez tous les logs
3. Créez une issue GitHub avec :
   - Output du script `diagnose-404.sh`
   - Logs PM2
   - Logs Nginx
   - Configuration système (`nginx -V`, `node -v`, `pm2 -v`)

---

## 🎓 Prévention

Pour éviter ces problèmes à l'avenir :

1. **Utilisez le script de déploiement** : `./deploy.sh production`
2. **Configurez le monitoring** : PM2 Keymetrics ou Uptime Robot
3. **Automatisez avec GitHub Actions** (voir DEPLOYMENT.md)
4. **Backups réguliers** de la base de données
5. **Tests avant déploiement** : `npm run build` en local

---

**Dernière mise à jour** : 4 novembre 2025
