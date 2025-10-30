# ⚡ Guide de Démarrage Rapide - Déploiement VPS

## 🎯 Déploiement en 5 minutes

### Prérequis
- ✅ VPS Ubuntu 22.04 LTS (2GB RAM minimum)
- ✅ Domaine configuré (DNS A record vers votre VPS)
- ✅ Accès SSH root au VPS
- ✅ Backend déployé sur api.sorami.app

---

## 🚀 Étapes de déploiement

### 1️⃣ Configuration initiale du VPS (10 minutes)

```bash
# Se connecter au VPS en root
ssh root@votre-ip-vps

# Télécharger et exécuter le script de setup
wget https://raw.githubusercontent.com/Dipomin/sorami/main/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh

# Attendre la fin de l'installation (~5-10 min)
# Redémarrer le serveur
sudo reboot
```

### 2️⃣ Configuration de l'application (5 minutes)

```bash
# Se reconnecter avec l'utilisateur sorami
ssh sorami@votre-ip-vps

# Cloner le repository
git clone https://github.com/Dipomin/sorami.git
cd sorami

# Créer le fichier d'environnement
cp .env.example .env.production

# Éditer avec vos valeurs
nano .env.production
```

**Variables essentielles à configurer :**
```bash
DATABASE_URL="mysql://user:pass@host:3306/sorami"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="sorami-production"
NEXT_PUBLIC_API_URL="https://api.sorami.app"
```

### 3️⃣ Configuration Nginx et SSL (3 minutes)

```bash
# Copier la configuration Nginx
sudo cp nginx-sorami.conf /etc/nginx/sites-available/sorami
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Obtenir le certificat SSL
sudo certbot --nginx -d sorami.app -d www.sorami.app

# Recharger Nginx
sudo systemctl reload nginx
```

### 4️⃣ Premier déploiement (5 minutes)

```bash
# Lancer le script de déploiement
chmod +x deploy.sh
./deploy.sh production

# Vérifier le statut
pm2 status
pm2 logs sorami-frontend

# Tester l'application
curl http://localhost:3000
curl https://sorami.app
```

### 5️⃣ Vérification (2 minutes)

```bash
# Vérifier que tout fonctionne
pm2 status                    # Doit être "online"
sudo systemctl status nginx   # Doit être "active"
curl -I https://sorami.app    # Doit retourner 200

# Consulter les logs
pm2 logs sorami-frontend --lines 50
```

---

## ✅ Checklist de vérification

### Avant le déploiement
- [ ] VPS accessible en SSH
- [ ] Domaine DNS configuré (A record)
- [ ] Credentials de production disponibles :
  - [ ] Base de données MySQL
  - [ ] Clerk (production keys)
  - [ ] Paystack (live keys)
  - [ ] AWS S3 (production bucket)

### Après le déploiement
- [ ] Application accessible en HTTPS
- [ ] Redirection HTTP → HTTPS fonctionne
- [ ] PM2 status = "online"
- [ ] Certificat SSL valide
- [ ] Logs PM2 sans erreurs critiques
- [ ] Authentification Clerk fonctionne
- [ ] Upload S3 fonctionne
- [ ] Webhooks reçus du backend

---

## 🔧 Commandes utiles

```bash
# Status de l'application
pm2 status
pm2 monit

# Logs
pm2 logs sorami-frontend
sudo tail -f /var/log/nginx/sorami_error.log

# Redémarrer
pm2 restart sorami-frontend
sudo systemctl reload nginx

# Mise à jour
cd ~/sorami
./deploy.sh production

# Backup manuel
~/backup.sh
```

---

## 🆘 Problèmes fréquents

### ❌ "Application offline" dans PM2
```bash
pm2 logs sorami-frontend --err
cd ~/sorami
npm run build
pm2 restart sorami-frontend
```

### ❌ Erreur 502 Bad Gateway
```bash
pm2 restart sorami-frontend
sudo systemctl reload nginx
```

### ❌ Certificat SSL non valide
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### ❌ Erreur de connexion à la base de données
```bash
# Vérifier DATABASE_URL dans .env.production
nano ~/sorami/.env.production

# Tester la connexion
cd ~/sorami
npx prisma db pull
```

---

## 📞 Support

- 📖 **Documentation complète** : `DEPLOYMENT.md`
- 🔍 **Monitoring** : `MONITORING.md`
- 🚀 **Scripts** : `README-DEPLOY.md`

---

## 🎉 C'est tout !

Votre application Sorami est maintenant déployée en production !

🔗 **Application** : https://sorami.app  
📊 **Dashboard** : https://sorami.app/dashboard  
🏥 **Health Check** : https://sorami.app/api/health

---

**Temps total estimé** : 25-30 minutes  
**Version** : 1.0.0  
**Date** : 30 Octobre 2025
