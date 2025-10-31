# 🔍 Guide de Monitoring à Distance - Sorami Frontend

## 📊 Solutions de surveillance sans SSH

### ✅ Option 1 : Dashboard de logs intégré (Recommandé)

**Interface web pour consulter les logs en temps réel**

**Accès** : https://sorami.app/dashboard/logs

**Fonctionnalités** :
- ✅ Consultation logs PM2, Nginx, système
- ✅ Filtrage par niveau (error, warn, info)
- ✅ Rafraîchissement automatique (5s)
- ✅ Téléchargement des logs
- ✅ Interface moderne et intuitive

**Configuration requise sur le VPS** :

```bash
# Donner les permissions nécessaires à l'utilisateur sorami
sudo usermod -aG adm sorami
sudo chmod 644 /var/log/nginx/sorami_error.log
```

---

### 🔔 Option 2 : Notifications par email (À configurer)

Recevez des alertes automatiques par email en cas d'erreur critique.

**Installation** :

```bash
# Sur le VPS
npm install nodemailer
```

**Configuration dans `.env.production`** :

```bash
# Email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
ALERT_EMAIL="admin@sorami.app"
```

**Script de monitoring** (`monitoring-alerts.js`) :

```javascript
// Surveillez les logs et envoyez des emails en cas d'erreur
// À exécuter via cron toutes les 5 minutes
```

---

### 📱 Option 3 : Services externes de monitoring

#### **A. Uptime Robot** (Gratuit)

**Site** : https://uptimerobot.com

**Configuration** :
1. Créer un compte gratuit
2. Ajouter un nouveau monitor :
   - Type : HTTP(s)
   - URL : https://sorami.app/api/health
   - Interval : 5 minutes
3. Configurer les notifications (email, SMS, Slack)

**Avantages** :
- ✅ Alertes immédiates si le site est down
- ✅ Historique de disponibilité
- ✅ Notifications multi-canal
- ✅ Gratuit jusqu'à 50 monitors

#### **B. Better Uptime** (Gratuit)

**Site** : https://betteruptime.com

**Configuration** :
1. Créer un compte
2. Ajouter le endpoint de santé
3. Configurer les alertes (email, Slack, Discord, SMS)

**Avantages** :
- ✅ Interface moderne
- ✅ Status page public
- ✅ Incidents tracking
- ✅ Intégrations multiples

#### **C. Sentry.io** (Gratuit jusqu'à 5k événements/mois)

**Site** : https://sentry.io

**Installation** :

```bash
npm install @sentry/nextjs
```

**Configuration** :

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project-id",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Avantages** :
- ✅ Tracking d'erreurs JavaScript
- ✅ Stack traces complets
- ✅ Performance monitoring
- ✅ Alertes personnalisables

---

### 📈 Option 4 : PM2 Plus (ex Keymetrics)

**Site** : https://pm2.io

**Installation sur le VPS** :

```bash
# Lier PM2 à PM2 Plus
pm2 link <secret_key> <public_key>
```

**Avantages** :
- ✅ Monitoring CPU/RAM en temps réel
- ✅ Logs centralisés
- ✅ Alertes automatiques
- ✅ Redémarrage à distance
- ✅ Gratuit pour 1 serveur

**Accès** : Dashboard web sur https://app.pm2.io

---

### 📊 Option 5 : Grafana + Prometheus (Avancé)

**Pour production à grande échelle**

**Stack complète** :
- **Prometheus** : Collecte de métriques
- **Grafana** : Visualisation
- **Node Exporter** : Métriques système
- **Loki** : Agrégation de logs

**Installation** : Voir `MONITORING-ADVANCED.md`

---

## 🎯 Solution recommandée pour débuter

### 1️⃣ **Dashboard de logs intégré** (Immédiat)

```bash
# Accédez à https://sorami.app/dashboard/logs
# Consultez les logs en temps réel
```

### 2️⃣ **Uptime Robot** (5 minutes de config)

```
1. Créer compte sur uptimerobot.com
2. Ajouter monitor pour https://sorami.app/api/health
3. Configurer email de notification
```

### 3️⃣ **PM2 Plus** (10 minutes de config)

```bash
# Sur le VPS
pm2 link <votre-key>
# Accès dashboard sur pm2.io
```

**Résultat** : Surveillance complète sans jamais se connecter en SSH ! 🎉

---

## 📋 Checklist de monitoring

### Surveillance basique (Minimum requis)
- [ ] Dashboard logs accessible (/dashboard/logs)
- [ ] Uptime monitoring actif (Uptime Robot)
- [ ] Email de notification configuré
- [ ] Health check endpoint fonctionnel (/api/health)

### Surveillance avancée (Recommandé)
- [ ] PM2 Plus configuré
- [ ] Sentry installé pour tracking erreurs JS
- [ ] Alertes par email automatiques
- [ ] Status page public (Better Uptime)

### Surveillance production (Entreprise)
- [ ] Grafana + Prometheus déployé
- [ ] Logs centralisés avec Loki
- [ ] APM (Application Performance Monitoring)
- [ ] Backup automatique des logs

---

## 🔧 Configuration du dashboard de logs

### Sur le VPS

```bash
# 1. Donner accès aux logs Nginx
sudo usermod -aG adm sorami
sudo chmod 644 /var/log/nginx/sorami_error.log

# 2. Configurer logrotate (rotation automatique)
sudo nano /etc/logrotate.d/sorami

# Contenu :
/var/log/nginx/sorami_*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data adm
    sharedscripts
}

# 3. Redémarrer l'application
cd ~/sorami
./deploy.sh production
```

---

## 📱 Accéder aux logs depuis votre téléphone

### Via le dashboard web

1. Ouvrez https://sorami.app/dashboard/logs sur mobile
2. Connectez-vous avec vos identifiants
3. Consultez les logs en temps réel

### Via l'API directement

```bash
# Utiliser curl avec authentification
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://sorami.app/api/admin/logs?type=pm2&lines=50"
```

---

## 🆘 Alertes recommandées à configurer

### Alertes critiques (Immédiat)
- ❌ Application down (> 1 minute)
- ❌ Erreur 500 récurrente (> 10/minute)
- ❌ Erreur de base de données
- ❌ CPU > 90% (> 5 minutes)
- ❌ RAM > 90% (> 5 minutes)
- ❌ Disque > 90%

### Alertes importantes (1 heure)
- ⚠️ Temps de réponse > 3s
- ⚠️ Erreurs 4xx anormales
- ⚠️ Certificat SSL expire dans 7 jours
- ⚠️ Backup non effectué

### Alertes informatives (24 heures)
- ℹ️ Mise à jour disponible
- ℹ️ Nouveau déploiement réussi
- ℹ️ Rapport quotidien de santé

---

## 📞 Support et ressources

- 📖 **Documentation PM2** : https://pm2.io/docs/
- 🔍 **Uptime Robot Docs** : https://uptimerobot.com/docs/
- 🐛 **Sentry Docs** : https://docs.sentry.io/
- 📊 **Grafana Tutorials** : https://grafana.com/tutorials/

---

## 🎉 Résumé rapide

**Pour surveiller sans SSH** :

1. ✅ **Consultez** : https://sorami.app/dashboard/logs
2. 🔔 **Alertes** : Configurez Uptime Robot (5 min)
3. 📊 **Métriques** : Activez PM2 Plus (10 min)
4. 🐛 **Erreurs** : Installez Sentry (optionnel)

**Vous n'aurez plus besoin de SSH pour 95% des cas !** 🚀

---

**Dernière mise à jour** : 31 Octobre 2025  
**Version** : 1.0.0
