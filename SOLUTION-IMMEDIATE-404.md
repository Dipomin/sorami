# 🚨 SOLUTION IMMÉDIATE - Erreur 404 Nginx sur VPS

## 🎯 Problème Actuel

Votre site en production affiche :
```
404 Not Found
nginx/1.24.0 (Ubuntu)
```

## ⚡ Solution Rapide (5 minutes)

### Connectez-vous à votre VPS

```bash
ssh sorami@votre-ip-vps
```

### Étape 1 : Transférer les scripts de diagnostic

**Sur votre machine locale** (dans le dossier du projet) :

```bash
# Transférer les scripts vers le VPS
scp diagnose-404.sh fix-404.sh sorami@votre-ip-vps:/home/sorami/sorami/
```

### Étape 2 : Sur le VPS, exécuter le diagnostic

```bash
cd /home/sorami/sorami
chmod +x diagnose-404.sh fix-404.sh
./diagnose-404.sh
```

Le script vous dira exactement quel est le problème.

### Étape 3 : Lancer la correction automatique

```bash
./fix-404.sh
```

Ce script va :
- ✅ Vérifier et démarrer Nginx
- ✅ Activer la bonne configuration
- ✅ Vérifier PM2 et l'application
- ✅ Rebuilder si nécessaire
- ✅ Effectuer des tests

---

## 🔍 Si les scripts ne résolvent pas le problème

### Vérification Manuelle 1 : Nginx

```bash
# Vérifier que Nginx tourne
sudo systemctl status nginx

# Si non actif, démarrer
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier la configuration
sudo nginx -t

# Si erreur, corriger puis recharger
sudo systemctl reload nginx
```

### Vérification Manuelle 2 : Configuration Nginx

```bash
# Vérifier que la config est activée
ls -la /etc/nginx/sites-enabled/

# Si sorami n'apparaît pas, créer le lien
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami

# Supprimer la config par défaut qui peut interférer
sudo rm /etc/nginx/sites-enabled/default

# Recharger
sudo systemctl reload nginx
```

### Vérification Manuelle 3 : Application Next.js

```bash
# Vérifier PM2
pm2 list

# Si sorami-frontend n'apparaît pas ou est offline
cd /home/sorami/sorami

# Vérifier qu'il y a un build
ls -la .next

# Si .next manque, builder
npm install
npx prisma generate
npm run build

# Démarrer
pm2 start ecosystem.config.js
pm2 save

# Vérifier les logs
pm2 logs sorami-frontend --lines 50
```

### Vérification Manuelle 4 : Test de connectivité

```bash
# Test 1 : Next.js directement
curl -I http://localhost:3000
# Devrait retourner 200 ou 301

# Test 2 : Via Nginx
curl -I http://sorami.app
# Devrait retourner 200 ou 301

# Si 404, vérifier les logs Nginx
sudo tail -50 /var/log/nginx/sorami_error.log
```

---

## 🎯 Causes Probables et Solutions

### Cause la Plus Probable : Configuration Nginx non activée

**Solution :**
```bash
cd /home/sorami/sorami

# Copier la configuration vers Nginx
sudo cp nginx-sorami.conf /etc/nginx/sites-available/sorami

# Activer
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/sorami

# Supprimer le default
sudo rm /etc/nginx/sites-enabled/default

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### Cause 2 : Application PM2 non démarrée

**Solution :**
```bash
cd /home/sorami/sorami

# Vérifier le fichier ecosystem.config.js
cat ecosystem.config.js

# Démarrer
pm2 start ecosystem.config.js
pm2 save
pm2 list
```

### Cause 3 : Build Next.js manquant

**Solution :**
```bash
cd /home/sorami/sorami

# Rebuild complet
rm -rf .next node_modules
npm install
npx prisma generate
npm run build

# Redémarrer
pm2 restart sorami-frontend
```

---

## 📊 Comment Vérifier que C'est Résolu

```bash
# Test 1 : Application locale
curl -I http://localhost:3000
# ✅ Attendu : HTTP/1.1 200 OK (ou 301/302)

# Test 2 : Nginx
sudo systemctl status nginx
# ✅ Attendu : active (running)

# Test 3 : PM2
pm2 list
# ✅ Attendu : sorami-frontend | online

# Test 4 : Site externe
curl -I http://sorami.app
# ✅ Attendu : HTTP/1.1 200 OK (ou 301 redirect vers HTTPS)

# Test 5 : Dans votre navigateur
# Ouvrir : http://sorami.app
# ✅ Attendu : Site s'affiche correctement
```

---

## 🆘 Si Rien Ne Fonctionne

### Option 1 : Redéploiement Complet

```bash
cd /home/sorami/sorami

# Arrêter tout
pm2 stop all
pm2 delete all

# Nettoyer
rm -rf .next node_modules

# Pull du code
git fetch origin
git reset --hard origin/main

# Rebuild
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Redémarrer
pm2 start ecosystem.config.js
pm2 save

# Vérifier Nginx
sudo systemctl restart nginx

# Attendre 30 secondes
sleep 30

# Tester
curl -I http://localhost:3000
curl -I http://sorami.app
```

### Option 2 : Vérifier les Variables d'Environnement

```bash
cd /home/sorami/sorami

# Vérifier que le fichier .env existe
ls -la .env*

# Si .env.production existe
cat .env.production

# Vérifier les variables critiques
pm2 show sorami-frontend | grep env
```

Variables requises :
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 📞 Collecte d'Informations pour le Support

Si vous devez demander de l'aide, collectez ces informations :

```bash
# 1. Diagnostic complet
./diagnose-404.sh > diagnostic-$(date +%Y%m%d-%H%M%S).log

# 2. Logs PM2
pm2 logs sorami-frontend --lines 100 > pm2-logs-$(date +%Y%m%d-%H%M%S).log

# 3. Logs Nginx
sudo tail -100 /var/log/nginx/sorami_error.log > nginx-error-$(date +%Y%m%d-%H%M%S).log
sudo tail -100 /var/log/nginx/sorami_access.log > nginx-access-$(date +%Y%m%d-%H%M%S).log

# 4. Configuration système
echo "=== Versions ===" > system-info-$(date +%Y%m%d-%H%M%S).log
node -v >> system-info-$(date +%Y%m%d-%H%M%S).log
npm -v >> system-info-$(date +%Y%m%d-%H%M%S).log
pm2 -v >> system-info-$(date +%Y%m%d-%H%M%S).log
nginx -v 2>> system-info-$(date +%Y%m%d-%H%M%S).log
echo "\n=== Système ===" >> system-info-$(date +%Y%m%d-%H%M%S).log
uname -a >> system-info-$(date +%Y%m%d-%H%M%S).log
df -h >> system-info-$(date +%Y%m%d-%H%M%S).log
free -h >> system-info-$(date +%Y%m%d-%H%M%S).log

# Télécharger ces fichiers sur votre machine locale
# Puis créer une issue GitHub avec ces logs
```

---

## ✅ Checklist Finale

Une fois le problème résolu, vérifiez que tout fonctionne :

- [ ] `sudo systemctl status nginx` → actif
- [ ] `pm2 list` → sorami-frontend online
- [ ] `curl -I http://localhost:3000` → 200 ou 301
- [ ] `curl -I http://sorami.app` → 200 ou 301
- [ ] Ouvrir http://sorami.app dans le navigateur → site s'affiche
- [ ] Se connecter → authentification fonctionne
- [ ] Tester une fonctionnalité → génération de contenu fonctionne
- [ ] Vérifier les logs → pas d'erreur : `pm2 logs sorami-frontend`

---

## 🎓 Prévention Future

Pour éviter ce problème à l'avenir :

1. **Utilisez toujours le script de déploiement** :
   ```bash
   ./deploy.sh production
   ```

2. **Configurez un monitoring** :
   - Uptime Robot pour surveiller le site
   - PM2 Keymetrics pour les performances

3. **Testez avant de déployer** :
   ```bash
   npm run build
   npm start
   # Vérifier que ça marche en local
   ```

4. **Gardez les logs** :
   ```bash
   pm2 install pm2-logrotate
   ```

---

**Créé le** : 4 novembre 2025  
**Pour** : Résolution urgente erreur 404 Nginx  
**Contact** : Équipe Sorami
