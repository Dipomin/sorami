# 🚀 Guide de Déploiement Complet - Sorami Frontend

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de déploiement](#architecture-de-déploiement)
3. [Configuration du VPS](#configuration-du-vps)
4. [Déploiement manuel](#déploiement-manuel)
5. [CI/CD avec GitHub Actions](#cicd-avec-github-actions)
6. [Configuration SSL](#configuration-ssl)
7. [Monitoring et logs](#monitoring-et-logs)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Infrastructure requise

- **VPS** : Ubuntu 22.04 LTS (minimum 2GB RAM, 2 vCPUs, 40GB SSD)
- **Domaine** : configuré avec DNS pointant vers votre VPS
- **Backend** : api.sorami.app (déjà déployé)
- **Base de données** : MySQL 8.0+ accessible depuis le VPS
- **AWS S3** : Bucket configuré pour le stockage

### Services externes

- ✅ **Clerk** : Authentication SaaS
- ✅ **Paystack** : Paiements
- ✅ **AWS S3** : Stockage de fichiers
- ✅ **CrewAI Backend** : api.sorami.app

---

## 🏗️ Architecture de déploiement

```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN             │
│            (Cloudflare)                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Nginx Reverse Proxy             │
│         (SSL Termination)               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         PM2 Process Manager             │
│    ┌─────────────────────────────┐     │
│    │   Next.js App (Port 3000)   │     │
│    │   - Server-Side Rendering   │     │
│    │   - API Routes              │     │
│    │   - Static Assets           │     │
│    └─────────────────────────────┘     │
└─────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│ MySQL  │  │ AWS S3  │  │ Backend  │
│   DB   │  │ Storage │  │ CrewAI   │
└────────┘  └─────────┘  └──────────┘
```

---

## 🖥️ Configuration du VPS

### 1. Connexion initiale

```bash
ssh root@votre-ip-vps
```

### 2. Créer un utilisateur dédié

```bash
# Créer l'utilisateur sorami
adduser sorami
usermod -aG sudo sorami

# Configurer SSH pour l'utilisateur
mkdir -p /home/sorami/.ssh
cp ~/.ssh/authorized_keys /home/sorami/.ssh/
chown -R sorami:sorami /home/sorami/.ssh
chmod 700 /home/sorami/.ssh
chmod 600 /home/sorami/.ssh/authorized_keys

# Se connecter avec le nouvel utilisateur
su - sorami
```

### 3. Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban
```

### 4. Configurer le firewall

```bash
# Autoriser SSH, HTTP et HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 5. Installer Node.js 20 LTS

```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Installer Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Vérifier l'installation
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 6. Installer PM2 (Process Manager)

```bash
npm install -g pm2
pm2 startup systemd -u sorami --hp /home/sorami
```

### 7. Installer Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 Déploiement manuel

### 1. Cloner le repository

```bash
cd /home/sorami
git clone https://github.com/Dipomin/sorami.git
cd sorami
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.production
nano .env.production
```

Contenu du `.env.production` :

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sorami.app

# Base de données MySQL
DATABASE_URL="mysql://username:password@host:3306/sorami"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Paystack (Production Keys)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=votre-secret-webhook

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=sorami-production

# Backend CrewAI
NEXT_PUBLIC_API_URL=https://api.sorami.app
CREWAI_API_URL=https://api.sorami.app
CREWAI_API_KEY=votre-api-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@sorami.app
SMTP_PASSWORD=votre-app-password
SMTP_FROM="Sorami <noreply@sorami.app>"

# Webhook Secret (pour sécurité)
WEBHOOK_SECRET=votre-secret-webhook-unique

# Monitoring (Optionnel)
SENTRY_DSN=https://...
```

### 3. Installer les dépendances

```bash
npm ci --production=false
```

### 4. Setup Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# (Optionnel) Seed la base de données
npx prisma db seed
```

### 5. Build l'application

```bash
npm run build
```

### 6. Lancer avec PM2

```bash
# Créer le fichier de configuration PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sorami-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/sorami/sorami',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/sorami/logs/err.log',
    out_file: '/home/sorami/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
}
EOF

# Créer le dossier de logs
mkdir -p /home/sorami/logs

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
```

### 7. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/sorami
```

Contenu du fichier Nginx :

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=sorami_limit:10m rate=10r/s;

# Upstream Next.js
upstream nextjs_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sorami.app www.sorami.app;
    
    # Challenge ACME pour Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sorami.app www.sorami.app;
    
    # Certificats SSL (généré par Certbot)
    ssl_certificate /etc/letsencrypt/live/sorami.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sorami.app/privkey.pem;
    
    # SSL Configuration moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Limiter les requêtes
    limit_req zone=sorami_limit burst=20 nodelay;
    
    # Taille maximale des uploads
    client_max_body_size 100M;
    
    # Logs
    access_log /var/log/nginx/sorami_access.log;
    error_log /var/log/nginx/sorami_error.log;
    
    # Proxy vers Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        
        # Headers de proxy
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache des assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }
    
    # Next.js specific paths
    location /_next/static {
        proxy_pass http://nextjs_backend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /_next/image {
        proxy_pass http://nextjs_backend;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d sorami.app -d www.sorami.app

# Renouvellement automatique (déjà configuré)
sudo certbot renew --dry-run
```

---

## 🔄 CI/CD avec GitHub Actions

Le workflow CI/CD est configuré dans `.github/workflows/deploy.yml` (voir script ci-dessous).

### Configuration des secrets GitHub

Allez dans **Settings → Secrets and variables → Actions** et ajoutez :

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | IP ou domaine de votre VPS |
| `VPS_USER` | Utilisateur SSH (sorami) |
| `VPS_SSH_KEY` | Clé privée SSH pour l'accès au VPS |
| `ENV_PRODUCTION` | Contenu complet du fichier `.env.production` |

### Générer une clé SSH pour le déploiement

Sur votre machine locale :

```bash
# Générer une paire de clés dédiée
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/sorami_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/sorami_deploy.pub sorami@votre-vps

# Copier la clé privée pour GitHub Secrets
cat ~/.ssh/sorami_deploy
# Copiez tout le contenu (y compris BEGIN et END)
```

---

## 📊 Monitoring et logs

### Consulter les logs PM2

```bash
# Logs en temps réel
pm2 logs sorami-frontend

# Logs des 100 dernières lignes
pm2 logs sorami-frontend --lines 100

# Logs d'erreurs uniquement
pm2 logs sorami-frontend --err

# Monitoring en temps réel
pm2 monit
```

### Consulter les logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/sorami_access.log

# Logs d'erreurs
sudo tail -f /var/log/nginx/sorami_error.log
```

### Dashboard PM2 (optionnel)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔧 Maintenance

### Mise à jour de l'application

```bash
cd /home/sorami/sorami
git pull origin main
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload sorami-frontend --update-env
```

### Backup de la base de données

```bash
# Script de backup automatique
cat > /home/sorami/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/sorami/backups"
mkdir -p $BACKUP_DIR

# Backup MySQL
mysqldump -h host -u user -ppassword sorami | gzip > $BACKUP_DIR/sorami_$DATE.sql.gz

# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs rm -f

echo "Backup completed: sorami_$DATE.sql.gz"
EOF

chmod +x /home/sorami/backup-db.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter : 0 2 * * * /home/sorami/backup-db.sh
```

### Redémarrer l'application

```bash
# Redémarrage graceful
pm2 reload sorami-frontend

# Redémarrage complet
pm2 restart sorami-frontend

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs sorami-frontend --err

# Vérifier si le port 3000 est libre
sudo lsof -i :3000

# Redémarrer depuis zéro
pm2 delete sorami-frontend
pm2 start ecosystem.config.js
```

### Erreurs de base de données

```bash
# Vérifier la connexion MySQL
npx prisma db pull

# Réinitialiser le client Prisma
npx prisma generate --force
```

### Erreurs SSL/HTTPS

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew --force-renewal

# Tester la configuration Nginx
sudo nginx -t
```

### Problèmes de mémoire

```bash
# Augmenter la limite mémoire PM2
pm2 delete sorami-frontend
# Modifier max_memory_restart dans ecosystem.config.js
pm2 start ecosystem.config.js
```

### Erreurs Clerk/Auth

- Vérifiez que les URLs de callback sont configurées dans Clerk Dashboard
- URLs autorisées : `https://sorami.app/*`
- Webhook URL : `https://sorami.app/api/webhooks/clerk`

---

## 📈 Performance et optimisation

### Configuration Node.js

```bash
# Augmenter la limite de mémoire Node.js
export NODE_OPTIONS="--max-old-space-size=2048"
```

### Cache et CDN

Configurer Cloudflare ou un autre CDN :
- Cache les assets statiques
- Protection DDoS
- Compression Brotli/Gzip
- HTTP/3 support

---

## 🔐 Sécurité

### Hardening du serveur

```bash
# Désactiver le login root SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

# Redémarrer SSH
sudo systemctl restart sshd

# Installer fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### Rotation des secrets

Pensez à renouveler régulièrement :
- Clés API Clerk
- Secrets Paystack
- Credentials AWS S3
- Webhook secrets

---

## 📞 Support

- **Documentation** : `/docs`
- **Issues** : GitHub Issues
- **Email** : support@sorami.app

---

## ✅ Checklist de déploiement

- [ ] VPS configuré avec Ubuntu 22.04 LTS
- [ ] Node.js 20 LTS installé
- [ ] PM2 installé et configuré
- [ ] Nginx installé et configuré
- [ ] SSL/TLS avec Let's Encrypt
- [ ] Variables d'environnement configurées
- [ ] Base de données accessible et migrée
- [ ] AWS S3 configuré
- [ ] Clerk configuré (URLs de production)
- [ ] Paystack configuré (clés de production)
- [ ] CI/CD GitHub Actions configuré
- [ ] Monitoring et logs configurés
- [ ] Backup automatique configuré
- [ ] Firewall configuré
- [ ] DNS configuré correctement
- [ ] Tests de production effectués

---

**Version** : 1.0.0  
**Dernière mise à jour** : 30 Octobre 2025
