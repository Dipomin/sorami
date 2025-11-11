# 🚀 Guide de Déploiement Sorami Frontend

## Vue d'ensemble

Ce projet utilise **GitHub Actions** pour le déploiement automatique sur le VPS en production. Les déploiements se déclenchent automatiquement à chaque push sur la branche `main`.

## 📋 Prérequis VPS

### Installation initiale sur le VPS

1. **Connectez-vous au VPS** :
   ```bash
   ssh sorami@your-vps-ip
   ```

2. **Installez Node.js 20.x** :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node -v  # Vérifier la version
   ```

3. **Installez PM2 globalement** :
   ```bash
   sudo npm install -g pm2
   pm2 -v  # Vérifier l'installation
   ```

4. **Configurez PM2 pour démarrer au boot** :
   ```bash
   pm2 startup
   # Suivre les instructions affichées
   ```

5. **Clonez le repository** (si pas déjà fait) :
   ```bash
   cd /home/sorami
   git clone git@github.com:Dipomin/sorami.git
   cd sorami
   ```

6. **Créez le fichier `.env.production`** avec toutes les variables d'environnement

7. **Premier déploiement manuel** :
   ```bash
   chmod +x deploy-manual.sh
   ./deploy-manual.sh
   ```

## 🔄 Déploiement Automatique (GitHub Actions)

### Configuration des Secrets GitHub

Dans **Settings → Secrets and variables → Actions**, ajoutez :

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | IP ou domaine du VPS | `123.45.67.89` |
| `VPS_USER` | Nom d'utilisateur SSH | `sorami` |
| `VPS_SSH_KEY` | Clé privée SSH | Contenu de `~/.ssh/id_rsa` |
| `ENV_PRODUCTION` | Contenu de `.env.production` | Toutes les variables |
| `DATABASE_URL` | URL de la base de données | `mysql://user:pass@host:3306/sorami` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clé secrète Clerk | `sk_live_...` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJal...` |
| Autres secrets AWS, Paystack, etc. | Voir `.env.example` | ... |

### Workflow de déploiement

Le workflow `.github/workflows/deploy.yml` s'exécute automatiquement :

1. **Tests & Lint** - Validation du code
2. **Build Test** - Compilation de test
3. **Deploy to VPS** - Déploiement sur le VPS
   - Pull des dernières modifications
   - Installation des dépendances
   - Génération Prisma
   - Build Next.js
   - **Démarrage ou redémarrage PM2** (gère le premier déploiement)
4. **Health Check** - Vérification que l'application répond
5. **Rollback automatique** - En cas d'échec

### Déclencher manuellement un déploiement

Allez dans **Actions → Deploy to Production → Run workflow**

## 🛠️ Déploiement Manuel

Si vous avez besoin de déployer manuellement (hors GitHub Actions) :

### Sur le VPS directement

```bash
ssh sorami@your-vps-ip
cd /home/sorami/sorami
./deploy-manual.sh
```

### Depuis votre machine locale (via SSH)

```bash
ssh sorami@your-vps-ip 'bash -s' < deploy-manual.sh
```

## 📊 Gestion de l'Application

### Commandes PM2 utiles

```bash
# Statut de l'application
pm2 status sorami-frontend

# Voir les logs en temps réel
pm2 logs sorami-frontend

# Redémarrer l'application
pm2 restart sorami-frontend

# Recharger sans downtime
pm2 reload sorami-frontend

# Arrêter l'application
pm2 stop sorami-frontend

# Monitoring des ressources
pm2 monit

# Sauvegarder la config PM2
pm2 save

# Liste des processus sauvegardés
pm2 startup
```

### Vérifier l'application

```bash
# Test HTTP local
curl http://localhost:3000

# Vérifier les logs d'erreur
pm2 logs sorami-frontend --err

# Vérifier les logs de sortie
pm2 logs sorami-frontend --out

# Fichiers de logs
tail -f /home/sorami/logs/err.log
tail -f /home/sorami/logs/out.log
```

## 🔧 Configuration PM2

Le fichier `ecosystem.config.js` configure PM2 :

- **Nom** : `sorami-frontend`
- **Mode** : Cluster (2 instances)
- **Mémoire max** : 1 GB par instance
- **Port** : 3000
- **Auto-restart** : Oui
- **Logs** : `/home/sorami/logs/`

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifier les logs PM2 :
   ```bash
   pm2 logs sorami-frontend --lines 100
   ```

2. Vérifier les variables d'environnement :
   ```bash
   cat /home/sorami/sorami/.env.production
   ```

3. Tester le build manuellement :
   ```bash
   cd /home/sorami/sorami
   npm run build
   ```

### Erreur "Process not found" lors du déploiement

✅ **CORRIGÉ** - Le workflow vérifie maintenant si le processus existe avant de le recharger.

Si le problème persiste :
```bash
# Sur le VPS
pm2 delete sorami-frontend
pm2 start ecosystem.config.js --env production
pm2 save
```

### Problème de permissions

```bash
# Corriger les permissions
sudo chown -R sorami:sorami /home/sorami/sorami
chmod +x /home/sorami/sorami/deploy-manual.sh
```

### Base de données non accessible

1. Vérifier la connexion :
   ```bash
   npx prisma db push --preview-feature
   ```

2. Vérifier les migrations :
   ```bash
   npx prisma migrate status
   ```

### Rollback manuel

```bash
cd /home/sorami/sorami
git log --oneline -10  # Voir les commits récents
git reset --hard <commit-hash>  # Revenir à un commit précédent
./deploy-manual.sh  # Redéployer
```

## 📈 Monitoring

### Nginx (si configuré)

```bash
sudo nginx -t  # Tester la config
sudo systemctl status nginx
sudo systemctl reload nginx
```

### Métriques système

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Processus Node.js
ps aux | grep node
```

## 🔐 Sécurité

- ✅ Les secrets sont stockés dans GitHub Secrets
- ✅ SSH avec clés (pas de mot de passe)
- ✅ Variables d'environnement sécurisées
- ✅ HTTPS via Nginx + Let's Encrypt (si configuré)

## 📞 Support

En cas de problème :
1. Vérifier les logs PM2
2. Vérifier les logs GitHub Actions
3. Consulter ce README
4. Contacter l'équipe DevOps

---

**Dernière mise à jour** : 11 novembre 2025
