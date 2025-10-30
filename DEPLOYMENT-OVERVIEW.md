# 📦 Package de Déploiement Complet - Sorami Frontend

## 📋 Vue d'ensemble

Ce package contient tous les fichiers nécessaires pour déployer l'application Sorami Frontend sur un VPS en production.

## 📁 Structure des fichiers de déploiement

```
sorami/
├── 📄 DEPLOYMENT.md              # Documentation complète de déploiement (PRINCIPAL)
├── 📄 QUICKSTART-DEPLOY.md       # Guide rapide (démarrer ici)
├── 📄 README-DEPLOY.md           # Vue d'ensemble et usage des scripts
├── 📄 MONITORING.md              # Guide de monitoring et maintenance
│
├── 🔧 setup-vps.sh               # Configuration initiale du VPS (exécuter une fois)
├── 🚀 deploy.sh                  # Script de déploiement automatique
├── ⚙️ ecosystem.config.js        # Configuration PM2
├── 🌐 nginx-sorami.conf          # Configuration Nginx optimisée
│
├── 🐳 Dockerfile                 # Image Docker (optionnel)
├── 🐳 docker-compose.yml         # Orchestration Docker (optionnel)
├── 📝 .dockerignore              # Exclusions Docker
│
├── 🤖 .github/workflows/
│   └── deploy.yml                # Pipeline CI/CD GitHub Actions
│
└── 📄 .env.example               # Template des variables d'environnement
```

## 🎯 Par où commencer ?

### Option 1 : Déploiement rapide (recommandé) ⚡

**Temps estimé** : 25-30 minutes

1. **Lisez** : `QUICKSTART-DEPLOY.md` - Guide pas à pas
2. **Exécutez** : `setup-vps.sh` sur votre VPS
3. **Configurez** : `.env.production`
4. **Déployez** : `./deploy.sh production`

### Option 2 : Déploiement avec CI/CD 🤖

**Temps estimé** : 45 minutes (configuration initiale)

1. **Lisez** : `DEPLOYMENT.md` - Documentation complète
2. **Configurez** : VPS + GitHub Secrets
3. **Push** : Git push → déploiement automatique

### Option 3 : Déploiement Docker 🐳

**Temps estimé** : 30 minutes

1. **Utilisez** : `Dockerfile` + `docker-compose.yml`
2. **Exécutez** : `docker-compose up -d`

## 📚 Documentation détaillée

### 1. DEPLOYMENT.md (À LIRE EN PREMIER)
**Contenu** :
- ✅ Prérequis détaillés
- ✅ Architecture de déploiement
- ✅ Configuration du VPS étape par étape
- ✅ Déploiement manuel complet
- ✅ Configuration CI/CD
- ✅ Configuration SSL/HTTPS
- ✅ Monitoring et logs
- ✅ Maintenance
- ✅ Troubleshooting complet

### 2. QUICKSTART-DEPLOY.md
**Contenu** :
- ⚡ Guide rapide (5 étapes)
- ⚡ Commandes essentielles
- ⚡ Checklist de vérification
- ⚡ Problèmes fréquents

### 3. README-DEPLOY.md
**Contenu** :
- 📖 Vue d'ensemble des scripts
- 📖 Utilisation détaillée de chaque script
- 📖 Configuration CI/CD
- 📖 Troubleshooting

### 4. MONITORING.md
**Contenu** :
- 📊 Monitoring de l'application
- 📊 Maintenance régulière
- 📊 Backups et restauration
- 📊 Gestion des incidents
- 📊 Optimisation des performances

## 🔧 Scripts principaux

### setup-vps.sh
**Usage** : Configuration initiale du VPS (une seule fois)
```bash
sudo bash setup-vps.sh
```

**Ce qu'il fait** :
- ✅ Installation de Node.js 20 LTS
- ✅ Installation de PM2
- ✅ Installation de Nginx
- ✅ Configuration du firewall
- ✅ Configuration de fail2ban
- ✅ Création de l'utilisateur sorami
- ✅ Configuration des backups automatiques

### deploy.sh
**Usage** : Déploiement de l'application
```bash
./deploy.sh production  # Production
./deploy.sh staging     # Staging
```

**Ce qu'il fait** :
- ✅ Backup de la base de données
- ✅ Pull des dernières modifications Git
- ✅ Installation des dépendances
- ✅ Migrations Prisma
- ✅ Build Next.js
- ✅ Restart PM2 (graceful)
- ✅ Health check

## ⚙️ Fichiers de configuration

### ecosystem.config.js
Configuration PM2 pour :
- Mode cluster (2 instances)
- Restart automatique
- Limite mémoire
- Logs structurés

### nginx-sorami.conf
Configuration Nginx optimisée :
- SSL/TLS (A+ sur SSL Labs)
- HTTP/2
- Compression Gzip
- Cache des assets
- Rate limiting
- Headers de sécurité

## 🤖 CI/CD avec GitHub Actions

### Workflow automatique
**Triggers** :
- Push sur `main`
- Déclenchement manuel

**Jobs** :
1. Tests & Lint
2. Build de test
3. Déploiement sur VPS
4. Health check
5. Notifications (optionnel)

**Configuration requise** :
- `VPS_HOST` : IP du VPS
- `VPS_USER` : sorami
- `VPS_SSH_KEY` : Clé privée SSH
- `ENV_PRODUCTION` : Variables d'environnement

## 🐳 Déploiement Docker (optionnel)

### Avantages
- ✅ Isolation complète
- ✅ Portabilité
- ✅ Reproductibilité
- ✅ Facile à scaler

### Usage
```bash
# Build l'image
docker build -t sorami-frontend .

# Lancer avec Docker Compose
docker-compose up -d

# Voir les logs
docker-compose logs -f app
```

## 🔒 Sécurité

### Checklist de sécurité
- [ ] Firewall UFW activé (ports 22, 80, 443)
- [ ] fail2ban configuré
- [ ] SSH par clé uniquement (pas de mot de passe)
- [ ] Root login désactivé
- [ ] SSL/TLS avec Let's Encrypt
- [ ] Headers de sécurité configurés
- [ ] Rate limiting activé
- [ ] Secrets dans variables d'environnement (jamais dans le code)
- [ ] Backups automatiques configurés

## 📊 Monitoring

### Métriques à surveiller
- CPU usage (< 80%)
- RAM usage (< 85%)
- Disk usage (< 80%)
- Response time (< 2s)
- Error rate (< 5%)
- Uptime (> 99%)

### Outils
- PM2 Dashboard : `pm2 monit`
- PM2 Logs : `pm2 logs sorami-frontend`
- Nginx Logs : `/var/log/nginx/sorami_*.log`
- System Monitoring : `htop`

## 🆘 Support et troubleshooting

### Problèmes fréquents

| Problème | Solution rapide | Documentation |
|----------|----------------|---------------|
| App offline | `pm2 restart sorami-frontend` | MONITORING.md |
| 502 Bad Gateway | Vérifier PM2 + restart Nginx | DEPLOYMENT.md §9 |
| Erreur DB | Vérifier DATABASE_URL | MONITORING.md |
| SSL expiré | `sudo certbot renew` | DEPLOYMENT.md §6 |

### Commandes de diagnostic
```bash
# Status complet
pm2 status && sudo systemctl status nginx && df -h

# Logs d'erreurs
pm2 logs sorami-frontend --err

# Test de santé
curl http://localhost:3000/api/health
```

## 🔄 Workflow de mise à jour

### En production
```bash
# 1. Se connecter au VPS
ssh sorami@votre-vps

# 2. Aller dans le dossier
cd ~/sorami

# 3. Lancer le déploiement
./deploy.sh production

# 4. Vérifier
pm2 status
pm2 logs sorami-frontend --lines 50
```

### Avec CI/CD
```bash
# 1. Commit et push sur main
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 2. GitHub Actions déploie automatiquement
# 3. Vérifier dans l'onglet Actions de GitHub
```

## 📈 Architecture de production

```
┌─────────────────────────────────┐
│      Internet / Cloudflare      │
└────────────┬────────────────────┘
             │ HTTPS (443)
             ▼
┌─────────────────────────────────┐
│     Nginx (Reverse Proxy)       │
│  - SSL Termination              │
│  - Rate Limiting                │
│  - Static Files Cache           │
└────────────┬────────────────────┘
             │ HTTP (3000)
             ▼
┌─────────────────────────────────┐
│     PM2 Process Manager         │
│  - Cluster Mode (2 instances)   │
│  - Auto Restart                 │
│  - Load Balancing               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│     Next.js Application         │
│  - Server-Side Rendering        │
│  - API Routes                   │
│  - Static Generation            │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌────────┐ ┌───┐ ┌────────┐
│ MySQL  │ │S3 │ │ CrewAI │
│   DB   │ │AWS│ │Backend │
└────────┘ └───┘ └────────┘
```

## ✅ Checklist finale avant déploiement

### Infrastructure
- [ ] VPS Ubuntu 22.04 LTS (2GB+ RAM)
- [ ] Domaine DNS configuré
- [ ] Accès SSH root

### Configuration
- [ ] Variables d'environnement complètes
- [ ] Clerk configuré (production keys)
- [ ] Paystack configuré (live keys)
- [ ] AWS S3 configuré (production bucket)
- [ ] Base de données accessible

### Sécurité
- [ ] Firewall activé
- [ ] SSL/TLS configuré
- [ ] Secrets sécurisés
- [ ] Backups configurés

### Tests
- [ ] Application accessible en HTTPS
- [ ] Authentification fonctionne
- [ ] Upload S3 fonctionne
- [ ] Webhooks reçus
- [ ] Paiements fonctionnent

## 🎓 Ressources d'apprentissage

- **Next.js Deployment** : https://nextjs.org/docs/deployment
- **PM2 Documentation** : https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation** : https://nginx.org/en/docs/
- **Let's Encrypt** : https://letsencrypt.org/docs/
- **Docker Deployment** : https://docs.docker.com/

## 📞 Support

- **Email** : support@sorami.app
- **Documentation** : `/docs`
- **GitHub Issues** : https://github.com/Dipomin/sorami/issues

---

## 🎉 Prêt à déployer ?

1. **Commencez par** : `QUICKSTART-DEPLOY.md`
2. **Si besoin d'aide** : `DEPLOYMENT.md`
3. **Pour le monitoring** : `MONITORING.md`

---

**Version** : 1.0.0  
**Date** : 30 Octobre 2025  
**Auteur** : Équipe Sorami  
**Licence** : Propriétaire
