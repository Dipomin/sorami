# 🔍 Guide de Monitoring et Maintenance - Sorami

## 📊 Monitoring de l'application

### PM2 Monitoring en temps réel

```bash
# Dashboard en temps réel
pm2 monit

# Status de l'application
pm2 status

# Informations détaillées
pm2 show sorami-frontend

# Logs en temps réel
pm2 logs sorami-frontend

# Logs filtrés
pm2 logs sorami-frontend --lines 100
pm2 logs sorami-frontend --err  # Erreurs uniquement
```

### Nginx Monitoring

```bash
# Logs d'accès en temps réel
sudo tail -f /var/log/nginx/sorami_access.log

# Logs d'erreurs
sudo tail -f /var/log/nginx/sorami_error.log

# Analyser les logs avec GoAccess (installer si nécessaire)
sudo apt install goaccess
sudo goaccess /var/log/nginx/sorami_access.log -o /tmp/report.html --log-format=COMBINED
```

### Ressources système

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Processus Node.js
ps aux | grep node

# Connexions réseau
netstat -tulpn | grep :3000
```

## 🛠️ Maintenance régulière

### Mise à jour de l'application

```bash
cd /home/sorami/sorami
./deploy.sh production
```

### Mise à jour du système

```bash
# Mises à jour de sécurité
sudo apt update
sudo apt upgrade -y

# Redémarrer si nécessaire
sudo reboot
```

### Mise à jour de Node.js

```bash
# Vérifier la version actuelle
node -v

# Mettre à jour via NVM
nvm install 20
nvm use 20
nvm alias default 20

# Redémarrer l'application
pm2 restart sorami-frontend
```

### Rotation des logs

Les logs sont automatiquement rotés par logrotate. Vérifier la configuration :

```bash
cat /etc/logrotate.d/sorami
```

Forcer la rotation manuellement :

```bash
sudo logrotate -f /etc/logrotate.d/sorami
```

### Nettoyage du cache

```bash
# Cache Nginx
sudo rm -rf /var/cache/nginx/sorami/*

# Cache npm
npm cache clean --force

# Fichiers temporaires
sudo rm -rf /tmp/*
```

## 💾 Backup et restauration

### Backup manuel de la base de données

```bash
# Créer un backup
mysqldump -h votre-host -u votre-user -p sorami | gzip > ~/backups/sorami_$(date +%Y%m%d_%H%M%S).sql.gz

# Lister les backups
ls -lh ~/backups/

# Télécharger un backup localement
scp sorami@votre-vps:~/backups/sorami_*.sql.gz ./
```

### Restaurer un backup

```bash
# Décompresser et restaurer
gunzip < ~/backups/sorami_YYYYMMDD_HHMMSS.sql.gz | mysql -h votre-host -u votre-user -p sorami
```

### Backup des fichiers de l'application

```bash
# Backup complet du code
tar -czf ~/backups/sorami_app_$(date +%Y%m%d).tar.gz /home/sorami/sorami

# Backup des variables d'environnement (ATTENTION: contient des secrets!)
cp /home/sorami/sorami/.env.production ~/backups/.env.production.backup
chmod 600 ~/backups/.env.production.backup
```

## 🚨 Gestion des incidents

### L'application ne répond plus

```bash
# 1. Vérifier le statut PM2
pm2 status

# 2. Consulter les logs
pm2 logs sorami-frontend --lines 50 --err

# 3. Redémarrer l'application
pm2 restart sorami-frontend

# 4. Si ça ne fonctionne pas, rebuild
cd /home/sorami/sorami
npm run build
pm2 restart sorami-frontend
```

### Erreur 502 Bad Gateway

```bash
# 1. Vérifier que l'application tourne
pm2 status

# 2. Vérifier que le port 3000 est libre
sudo lsof -i :3000

# 3. Redémarrer Nginx
sudo systemctl restart nginx

# 4. Consulter les logs Nginx
sudo tail -f /var/log/nginx/sorami_error.log
```

### Manque d'espace disque

```bash
# 1. Identifier les gros fichiers
du -sh /home/sorami/* | sort -h

# 2. Nettoyer les logs anciens
find /home/sorami/logs -name "*.log" -mtime +7 -delete

# 3. Nettoyer les backups anciens
find /home/sorami/backups -name "*.sql.gz" -mtime +30 -delete

# 4. Nettoyer les anciens builds
cd /home/sorami/sorami
rm -rf .next.backup.*
```

### Fuite mémoire

```bash
# 1. Vérifier l'utilisation mémoire
pm2 monit

# 2. Redémarrer avec limite mémoire
pm2 restart sorami-frontend --max-memory-restart 1G

# 3. Augmenter la limite Node.js dans ecosystem.config.js
# node_args: '--max-old-space-size=2048'
```

## 🔐 Sécurité

### Renouvellement SSL

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew --force-renewal

# Vérifier l'expiration
sudo certbot certificates
```

### Audit de sécurité

```bash
# Vérifier les ports ouverts
sudo ss -tulpn

# Vérifier le firewall
sudo ufw status

# Logs fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### Mise à jour des dépendances

```bash
cd /home/sorami/sorami

# Audit de sécurité npm
npm audit

# Corriger les vulnérabilités
npm audit fix

# Mise à jour des dépendances mineures
npm update

# Rebuild et redéployer
npm run build
pm2 restart sorami-frontend
```

## 📈 Optimisation des performances

### Analyser les performances

```bash
# Temps de réponse Nginx
awk '{print $10}' /var/log/nginx/sorami_access.log | grep -E '^[0-9]' | sort -n | tail -20

# Statistiques PM2
pm2 describe sorami-frontend
```

### Optimiser Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger sans interruption
sudo nginx -s reload

# Vider le cache
sudo rm -rf /var/cache/nginx/sorami/*
sudo systemctl reload nginx
```

### Optimiser PM2

```bash
# Augmenter le nombre d'instances (mode cluster)
pm2 scale sorami-frontend 4

# Redémarrer avec stratégie de cluster
pm2 reload sorami-frontend
```

## 📱 Alertes et notifications

### Configurer des alertes email (exemple avec msmtp)

```bash
# Installer msmtp
sudo apt install msmtp msmtp-mta

# Configurer ~/.msmtprc
cat > ~/.msmtprc << 'EOF'
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        ~/.msmtp.log

account        gmail
host           smtp.gmail.com
port           587
from           votre-email@gmail.com
user           votre-email@gmail.com
password       votre-mot-de-passe-app

account default : gmail
EOF

chmod 600 ~/.msmtprc
```

### Script de monitoring automatique

```bash
cat > ~/monitor.sh << 'EOF'
#!/bin/bash

# Vérifier si l'application répond
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Application ne répond pas!" | mail -s "ALERTE Sorami" admin@sorami.app
    pm2 restart sorami-frontend
fi

# Vérifier l'espace disque
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Espace disque: ${DISK_USAGE}%" | mail -s "ALERTE Disque Sorami" admin@sorami.app
fi
EOF

chmod +x ~/monitor.sh

# Ajouter au cron (toutes les 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/sorami/monitor.sh") | crontab -
```

## 📊 Métriques à surveiller

### KPIs à monitorer

| Métrique | Seuil d'alerte | Action |
|----------|----------------|--------|
| CPU usage | > 80% | Augmenter les ressources VPS |
| RAM usage | > 85% | Restart PM2 ou upgrade VPS |
| Disk usage | > 80% | Nettoyer logs/backups |
| Response time | > 2s | Optimiser code/DB queries |
| Error rate | > 5% | Vérifier logs d'erreurs |
| Uptime | < 99% | Investiguer causes |

### Dashboard de monitoring (optionnel)

Installer PM2 Plus pour un dashboard avancé :

```bash
pm2 link <secret_key> <public_key>
pm2 install pm2-server-monit
```

---

## 🆘 Contacts support

- **Documentation** : `/docs` et `DEPLOYMENT.md`
- **Logs** : `/home/sorami/logs/`
- **Backups** : `/home/sorami/backups/`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 30 Octobre 2025
