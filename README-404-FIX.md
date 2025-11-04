# 🚨 Résolution Erreur 404 - Index Principal

> **Erreur actuelle** : `404 Not Found - nginx/1.24.0 (Ubuntu)`  
> **Impact** : Site en production inaccessible  
> **Temps de résolution estimé** : 5-15 minutes

---

## 🎯 Action Immédiate (Recommandé)

### 1️⃣ Sur votre machine locale

Transférez les scripts sur le VPS :

```bash
cd /Users/inoverfly/Documents/qg-projects/sorami/front
scp diagnose-404.sh fix-404.sh quick-check.sh sorami@IP-VPS:/home/sorami/sorami/
```

### 2️⃣ Sur le VPS

Connectez-vous et lancez la correction :

```bash
ssh sorami@IP-VPS
cd /home/sorami/sorami
chmod +x diagnose-404.sh fix-404.sh quick-check.sh

# Diagnostic rapide (10 secondes)
./quick-check.sh

# Si problème détecté, correction automatique
./fix-404.sh
```

### 3️⃣ Vérification

Testez dans votre navigateur : **http://sorami.app**

✅ **Si ça marche** : Problème résolu !  
❌ **Si ça ne marche pas** : Consultez les guides détaillés ci-dessous

---

## 📚 Documentation Complète

### 🚀 Guides Pratiques

| Document | Description | Quand l'utiliser |
|----------|-------------|------------------|
| **[SOLUTION-IMMEDIATE-404.md](./SOLUTION-IMMEDIATE-404.md)** | Guide de résolution rapide et pratique | ⭐ **COMMENCEZ ICI** - Première lecture recommandée |
| **[GUIDE-VISUEL-404.md](./GUIDE-VISUEL-404.md)** | Diagrammes et arbres de décision | Pour comprendre visuellement le problème |
| **[FIX-404-GUIDE.md](./FIX-404-GUIDE.md)** | Guide exhaustif avec 7 causes courantes | Quand la solution rapide ne suffit pas |
| **[SCRIPTS-README.md](./SCRIPTS-README.md)** | Documentation des scripts | Pour comprendre les outils disponibles |

### 🛠️ Scripts Disponibles

| Script | Durée | Description | Usage |
|--------|-------|-------------|-------|
| **quick-check.sh** | ~10s | Vérification santé rapide | Diagnostic express |
| **diagnose-404.sh** | ~30s | Analyse complète du système | Investigation approfondie |
| **fix-404.sh** | ~2-5min | Correction automatique | Résolution automatisée |
| **deploy.sh** | ~5-10min | Déploiement complet avec checks | Déploiement sécurisé |

---

## 🔍 Causes Fréquentes (Top 7)

### 1. Configuration Nginx non activée ⭐ (80% des cas)

```bash
sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

### 2. Application PM2 non démarrée

```bash
cd /home/sorami/sorami
pm2 start ecosystem.config.js
pm2 save
```

### 3. Build Next.js manquant

```bash
cd /home/sorami/sorami
npm run build
pm2 restart sorami-frontend
```

### 4. Nginx non actif

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Port 3000 non en écoute

```bash
pm2 logs sorami-frontend
pm2 restart sorami-frontend
```

### 6. Permissions incorrectes

```bash
sudo chown -R sorami:sorami /home/sorami/sorami
```

### 7. DNS mal configuré

Vérifiez que `sorami.app` pointe vers l'IP de votre VPS dans votre registrar de domaine.

---

## 📊 Flowchart de Résolution

```
[Site 404] 
    │
    ├─→ [quick-check.sh] ─→ Tous ✅ ? ─→ Vérifier DNS
    │                           │
    │                           ❌
    │                           │
    ├─→ [diagnose-404.sh] ─→ Identifier le problème
    │                           │
    │                           ▼
    ├─→ [fix-404.sh] ────→ Correction automatique
    │                           │
    │                           ├─→ ✅ Résolu!
    │                           │
    │                           ├─→ ❌ Persiste
    │                           │
    ├─→ [Manuel: FIX-404-GUIDE.md]
    │                           │
    │                           ├─→ ✅ Résolu!
    │                           │
    │                           ├─→ ❌ Toujours KO
    │                           │
    └─→ [Option nucléaire: Redéploiement complet]
```

---

## 🎯 Vérification Post-Résolution

Une fois corrigé, validez avec cette checklist :

```bash
# ✅ Checklist
[ ] sudo systemctl status nginx → active
[ ] pm2 list → sorami-frontend online
[ ] curl -I http://localhost:3000 → 200
[ ] curl -I http://sorami.app → 200 ou 301
[ ] Ouvrir dans navigateur → site s'affiche
[ ] Se connecter → auth fonctionne
[ ] pm2 logs → pas d'erreur
```

---

## 🆘 Support et Escalade

### Niveau 1 : Self-Service (0-30 min)
1. Exécutez `quick-check.sh`
2. Lancez `fix-404.sh`
3. Consultez `SOLUTION-IMMEDIATE-404.md`

### Niveau 2 : Diagnostic Approfondi (30-60 min)
1. Exécutez `diagnose-404.sh`
2. Consultez `FIX-404-GUIDE.md`
3. Suivez les solutions manuelles

### Niveau 3 : Redéploiement (60-90 min)
1. Option nucléaire (voir `SOLUTION-IMMEDIATE-404.md`)
2. Redéploiement complet avec `deploy.sh production`

### Niveau 4 : Assistance Technique (>90 min)
1. Collectez les logs :
   ```bash
   ./diagnose-404.sh > diagnostic.log
   pm2 logs sorami-frontend --lines 100 > pm2.log
   sudo tail -100 /var/log/nginx/sorami_error.log > nginx.log
   ```
2. Créez une issue GitHub avec :
   - Les 3 fichiers de logs
   - Capture d'écran de l'erreur
   - Liste des actions déjà tentées
   - Infos système (`node -v`, `nginx -V`, `uname -a`)

---

## 🔗 Liens Utiles

### Documentation Projet
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement complet
- [README.md](./README.md) - Documentation principale
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Architecture du projet

### Outils de Monitoring
- PM2 Keymetrics : https://keymetrics.io
- Uptime Robot : https://uptimerobot.com
- Nginx Log Analyzer : https://goaccess.io

### Ressources Externes
- Nginx Documentation : https://nginx.org/en/docs/
- PM2 Documentation : https://pm2.keymetrics.io/docs/
- Next.js Deployment : https://nextjs.org/docs/deployment

---

## 📈 Prévention Future

Pour éviter ce problème à l'avenir :

### 1. Monitoring Automatique
```bash
# Installer pm2-logrotate pour gérer les logs
pm2 install pm2-logrotate

# Configurer un uptime monitor (Uptime Robot, Better Uptime, etc.)
```

### 2. Tests Avant Déploiement
```bash
# Toujours tester en local avant
npm run build
npm start
# Vérifier http://localhost:3000
```

### 3. Utiliser le Script de Déploiement
```bash
# Au lieu de commandes manuelles
./deploy.sh production
```

### 4. Backup Réguliers
```bash
# Base de données
mysqldump -u user -p sorami > backup_$(date +%Y%m%d).sql

# Configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz /etc/nginx /home/sorami/sorami/.env*
```

### 5. Documentation des Changements
- Gardez un changelog des modifications
- Notez les configurations spéciales
- Documentez les problèmes et solutions

---

## 📝 Historique des Versions

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 2025-11-04 | Création des outils de diagnostic et résolution 404 |

---

## 👥 Contributeurs

- **Équipe Sorami** - Création et maintenance
- **Documentation** - Guides complets et scripts automatisés

---

## 📞 Contact

Pour toute question ou problème persistant :
- 📧 Email : support@sorami.app
- 💬 GitHub Issues : https://github.com/Dipomin/sorami/issues
- 📱 Équipe technique : Contact direct

---

**Dernière mise à jour** : 4 novembre 2025  
**Status** : ✅ Prêt pour utilisation en production
