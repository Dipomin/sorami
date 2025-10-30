# 🚀 Scripts de Déploiement - Sorami Frontend

Ce dossier contient tous les scripts et configurations nécessaires pour déployer Sorami Frontend sur un VPS.

## 📁 Fichiers de déploiement

### 📄 Documentation

- **`DEPLOYMENT.md`** - Guide complet de déploiement sur VPS
- **`MONITORING.md`** - Guide de monitoring et maintenance
- **`README-DEPLOY.md`** - Ce fichier

### 🔧 Scripts de configuration

- **`setup-vps.sh`** - Configuration initiale du VPS (à exécuter une seule fois)
- **`deploy.sh`** - Script de déploiement automatique
- **`ecosystem.config.js`** - Configuration PM2 pour la gestion du processus Node.js
- **`nginx-sorami.conf`** - Configuration Nginx optimisée

### 🤖 CI/CD

- **`.github/workflows/deploy.yml`** - Pipeline GitHub Actions pour déploiement automatique

## 🎯 Quick Start

### 1️⃣ Configuration initiale du VPS (une seule fois)

```bash
# Sur votre VPS, en tant que root
wget https://raw.githubusercontent.com/Dipomin/sorami/main/setup-vps.sh
sudo bash setup-vps.sh
```

Ce script va :
- ✅ Mettre à jour le système
- ✅ Installer Node.js 20 LTS
- ✅ Installer PM2 (process manager)
- ✅ Installer Nginx
- ✅ Configurer le firewall (UFW)
- ✅ Configurer fail2ban
- ✅ Créer l'utilisateur `sorami`
- ✅ Configurer les backups automatiques

### 2️⃣ Configuration du domaine et SSL

```bash
# Se connecter avec l'utilisateur sorami
ssh sorami@votre-vps-ip

# Configurer Nginx
sudo cp nginx-sorami.conf /etc/nginx/sites-available/sorami
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtenir le certificat SSL avec Let's Encrypt
sudo certbot --nginx -d sorami.app -d www.sorami.app
```

### 3️⃣ Premier déploiement

```bash
# Cloner le repository
cd /home/sorami
git clone https://github.com/Dipomin/sorami.git
cd sorami

# Configurer les variables d'environnement
cp .env.example .env.production
nano .env.production  # Éditer avec vos valeurs de production

# Lancer le déploiement
./deploy.sh production
```

### 4️⃣ Configuration CI/CD (optionnel mais recommandé)

#### A. Générer une clé SSH pour GitHub Actions

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/sorami_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/sorami_deploy.pub sorami@votre-vps-ip

# Afficher la clé privée (à copier dans GitHub Secrets)
cat ~/.ssh/sorami_deploy
```

#### B. Configurer les secrets GitHub

Allez dans **Settings → Secrets and variables → Actions** de votre repo GitHub et ajoutez :

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | IP ou domaine de votre VPS (ex: `123.45.67.89`) |
| `VPS_USER` | `sorami` |
| `VPS_SSH_KEY` | Contenu de la clé privée SSH générée ci-dessus |
| `ENV_PRODUCTION` | Contenu complet de votre fichier `.env.production` |

#### C. Tester le workflow

Une fois les secrets configurés, chaque push sur `main` déclenchera automatiquement :
1. ✅ Tests et lint
2. ✅ Build de test
3. ✅ Déploiement sur le VPS
4. ✅ Health check
5. 📧 Notifications

Vous pouvez aussi déclencher un déploiement manuel depuis l'onglet **Actions** de GitHub.

## 📖 Utilisation des scripts

### Script de déploiement (`deploy.sh`)

```bash
# Déploiement en production
./deploy.sh production

# Déploiement en staging
./deploy.sh staging
```

**Ce que fait le script :**
1. 💾 Backup de la base de données
2. 📥 Pull des dernières modifications Git
3. 📦 Installation des dépendances npm
4. 🔄 Migrations Prisma
5. 🏗️ Build Next.js
6. 🔄 Restart PM2 (graceful reload)
7. 🏥 Health check
8. 🧹 Nettoyage

### Configuration PM2 (`ecosystem.config.js`)

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Redémarrer (graceful reload)
pm2 reload sorami-frontend

# Voir les logs
pm2 logs sorami-frontend

# Monitoring en temps réel
pm2 monit

# Sauvegarder la configuration PM2
pm2 save
```

### Configuration Nginx

Le fichier `nginx-sorami.conf` contient une configuration optimisée avec :
- ✅ SSL/TLS avec Let's Encrypt
- ✅ HTTP/2
- ✅ Compression Gzip
- ✅ Cache des assets statiques
- ✅ Rate limiting
- ✅ Headers de sécurité
- ✅ Protection DDoS de base

## 🔍 Monitoring et maintenance

### Commandes utiles

```bash
# Status de l'application
pm2 status

# Logs en temps réel
pm2 logs sorami-frontend

# Logs Nginx
sudo tail -f /var/log/nginx/sorami_access.log
sudo tail -f /var/log/nginx/sorami_error.log

# Redémarrer Nginx
sudo systemctl reload nginx

# Vérifier l'utilisation des ressources
htop
df -h
```

### Backups automatiques

Les backups sont configurés pour s'exécuter tous les jours à 2h du matin via cron :

```bash
# Voir les backups
ls -lh /home/sorami/backups/

# Exécuter un backup manuel
/home/sorami/backup.sh
```

### Mise à jour de l'application

```bash
cd /home/sorami/sorami
./deploy.sh production
```

## 🛠️ Troubleshooting

### L'application ne démarre pas

```bash
pm2 logs sorami-frontend --err
pm2 restart sorami-frontend
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'app tourne
pm2 status

# Vérifier le port
sudo lsof -i :3000

# Redémarrer
pm2 restart sorami-frontend
sudo systemctl reload nginx
```

### Problèmes de base de données

```bash
cd /home/sorami/sorami
npx prisma generate
npx prisma migrate deploy
pm2 restart sorami-frontend
```

### Certificat SSL expiré

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 📊 Architecture de déploiement

```
Internet
   ↓
Cloudflare/CDN (optionnel)
   ↓
Nginx (Port 80/443)
   ↓ Reverse Proxy
PM2 (Process Manager)
   ↓ Cluster Mode (2+ instances)
Next.js App (Port 3000)
   ↓
┌────────────┬─────────────┬──────────┐
│   MySQL    │   AWS S3    │ Backend  │
│     DB     │   Storage   │ CrewAI   │
└────────────┴─────────────┴──────────┘
```

## 📋 Checklist de déploiement

### Configuration initiale (une fois)
- [ ] VPS configuré (Ubuntu 22.04 LTS)
- [ ] DNS configuré (A record vers IP du VPS)
- [ ] Script `setup-vps.sh` exécuté
- [ ] Utilisateur `sorami` créé
- [ ] Node.js 20 LTS installé
- [ ] PM2 installé et configuré
- [ ] Nginx installé
- [ ] SSL avec Let's Encrypt configuré
- [ ] Firewall UFW activé
- [ ] fail2ban configuré

### Variables d'environnement
- [ ] DATABASE_URL configuré
- [ ] Clerk (PUBLISHABLE_KEY + SECRET_KEY)
- [ ] Paystack (SECRET_KEY + PUBLIC_KEY)
- [ ] AWS S3 (ACCESS_KEY + SECRET + BUCKET)
- [ ] NEXT_PUBLIC_API_URL = https://api.sorami.app
- [ ] SMTP configuré pour les emails
- [ ] WEBHOOK_SECRET défini

### Déploiement
- [ ] Repository cloné dans `/home/sorami/sorami`
- [ ] `.env.production` configuré
- [ ] Dépendances installées (`npm ci`)
- [ ] Prisma migré (`npx prisma migrate deploy`)
- [ ] Application buildée (`npm run build`)
- [ ] PM2 démarré (`pm2 start ecosystem.config.js`)
- [ ] Nginx configuré et rechargé
- [ ] Application accessible via HTTPS

### CI/CD (optionnel)
- [ ] Clé SSH générée et ajoutée au VPS
- [ ] Secrets GitHub configurés
- [ ] Workflow testé avec un push

### Tests post-déploiement
- [ ] Site accessible en HTTPS
- [ ] Redirection HTTP → HTTPS fonctionne
- [ ] Authentification Clerk fonctionne
- [ ] Génération de contenu fonctionne
- [ ] Upload S3 fonctionne
- [ ] Webhooks reçus correctement
- [ ] Paiements Paystack fonctionnent

## 🔗 Ressources

- **Documentation complète** : `DEPLOYMENT.md`
- **Guide de monitoring** : `MONITORING.md`
- **Backend API** : https://api.sorami.app
- **Clerk Dashboard** : https://dashboard.clerk.com
- **Paystack Dashboard** : https://dashboard.paystack.com
- **AWS S3 Console** : https://s3.console.aws.amazon.com

## 📞 Support

Pour toute question :
- 📧 Email : support@sorami.app
- 📖 Documentation : `/docs`
- 🐛 Issues : GitHub Issues

---

**Version** : 1.0.0  
**Dernière mise à jour** : 30 Octobre 2025  
**Auteur** : Équipe Sorami
