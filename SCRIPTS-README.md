# Scripts Sorami Frontend

Ce dossier contient des scripts utiles pour tester et maintenir l'application.

## 💳 Gestion des plans Paystack

### `sync-paystack-plans.mjs`
Synchronise les plans d'abonnement depuis Paystack vers la base de données locale.

```bash
node scripts/sync-paystack-plans.mjs
```

**Utilisation** :
- À exécuter après toute modification des plans sur Paystack
- Recommandé : configurer en cron job (toutes les heures)
- Utile pour maintenir le cache local à jour

**Output** :
- Liste tous les plans trouvés sur Paystack
- Affiche les plans synchronisés avec détails (montant, intervalle)
- Résumé groupé par intervalle (mensuel/annuel)

### `test-plans-api.mjs`
Teste l'endpoint `/api/plans` et affiche les résultats.

```bash
# Démarrer le serveur dans un terminal
npm run dev

# Dans un autre terminal, tester l'API
node scripts/test-plans-api.mjs
```

**Vérifie** :
- Disponibilité de l'API
- Statut de la réponse
- Source des données (Paystack ou cache)
- Liste des plans disponibles par intervalle

### `pre-deploy-check.sh`
Vérification complète avant déploiement en production.

```bash
./scripts/pre-deploy-check.sh
```

**Vérifie** :
- Variables d'environnement (PAYSTACK_SECRET_KEY, DATABASE_URL)
- Présence de tous les fichiers modifiés
- Dépendances installées (node_modules, Prisma)
- Connexion à la base de données
- État du build Next.js
- Syntaxe TypeScript

**Output** :
- ✓ Succès : nombre de tests réussis
- ⚠ Avertissements : points à vérifier
- ✗ Erreurs : problèmes bloquants

**Exit codes** :
- `0` : Tout est OK ou seulement des avertissements
- `1` : Des erreurs bloquantes ont été détectées

## 🔧 Workflows recommandés

### Avant chaque déploiement
```bash
# 1. Vérifier que tout est en ordre
./scripts/pre-deploy-check.sh

# 2. Si OK, synchroniser les plans
node scripts/sync-paystack-plans.mjs

# 3. Déployer
npm run build
pm2 restart ecosystem.config.js
```

### Après modification des plans sur Paystack
```bash
# Resynchroniser immédiatement
node scripts/sync-paystack-plans.mjs
```

### Tests locaux
```bash
# 1. Démarrer le serveur
npm run dev

# 2. Dans un autre terminal, tester l'API
node scripts/test-plans-api.mjs
```

### Maintenance régulière (production)
```bash
# Configurer un cron job pour synchroniser automatiquement
# Ajouter à crontab :
0 * * * * cd /path/to/sorami/front && node scripts/sync-paystack-plans.mjs >> /var/log/paystack-sync.log 2>&1
```

## 📋 Scripts Disponibles

### 1. `diagnose-404.sh` - Diagnostic Complet

**Usage :**
```bash
chmod +x diagnose-404.sh
./diagnose-404.sh
```

**Ce qu'il fait :**
- ✅ Vérifie l'état de Nginx (actif/inactif)
- ✅ Vérifie la configuration Nginx (syntaxe, liens symboliques)
- ✅ Vérifie PM2 et l'application Next.js
- ✅ Teste la connectivité localhost:3000
- ✅ Vérifie les ports en écoute (80, 443, 3000)
- ✅ Vérifie le build Next.js (.next)
- ✅ Analyse les logs Nginx
- ✅ Vérifie les certificats SSL
- ✅ Teste les requêtes externes
- ✅ Fournit des recommandations d'actions

**Quand l'utiliser :**
- Erreur 404 Nginx
- Site inaccessible
- Après un déploiement qui échoue
- Pour un audit général du système

---

### 2. `fix-404.sh` - Correction Automatique

**Usage :**
```bash
chmod +x fix-404.sh
./fix-404.sh
```

**Ce qu'il fait :**
- 🔧 Démarre Nginx s'il est arrêté
- 🔧 Active la configuration Nginx si elle ne l'est pas
- 🔧 Supprime la config Nginx par défaut qui peut interférer
- 🔧 Teste et recharge la configuration Nginx
- 🔧 Installe PM2 si nécessaire
- 🔧 Build l'application si le dossier .next manque
- 🔧 Démarre/redémarre l'application PM2
- 🔧 Effectue des tests de connectivité
- 🔧 Affiche l'état final du système

**Quand l'utiliser :**
- Après avoir exécuté `diagnose-404.sh`
- Pour une correction rapide automatisée
- Quand vous savez que c'est un problème classique

---

### 3. `deploy.sh` - Déploiement Automatisé

**Usage :**
```bash
chmod +x deploy.sh
./deploy.sh production   # ou staging
```

**Ce qu'il fait :**
- 📦 Backup de la base de données
- 📥 Pull du code depuis Git
- 📦 Installation des dépendances
- 🗄️ Migrations Prisma
- 🏗️ Build Next.js
- 🔄 Redémarrage PM2
- 🏥 Health checks
- ✅ Vérification finale

**Quand l'utiliser :**
- Pour un déploiement complet
- Après avoir pushé du nouveau code
- Mise à jour de production

---

## 🚨 Scénarios Courants

### Scénario 1 : Erreur 404 après déploiement

```bash
# Étape 1 : Diagnostic
./diagnose-404.sh

# Étape 2 : Correction automatique
./fix-404.sh

# Étape 3 : Si problème persiste, consultez les logs
pm2 logs sorami-frontend --lines 50
sudo tail -50 /var/log/nginx/sorami_error.log
```

### Scénario 2 : Site ne démarre pas après reboot VPS

```bash
# Vérifier et redémarrer tous les services
sudo systemctl start nginx
pm2 resurrect  # ou pm2 start ecosystem.config.js

# Puis vérifier
./diagnose-404.sh
```

### Scénario 3 : Build corrompu

```bash
cd /home/sorami/sorami

# Nettoyer complètement
rm -rf .next node_modules
npm cache clean --force

# Rebuild
npm install
npm run build

# Redémarrer
pm2 restart sorami-frontend

# Vérifier
./diagnose-404.sh
```

### Scénario 4 : Configuration Nginx modifiée

```bash
# Tester la syntaxe
sudo nginx -t

# Si erreur, vérifier le fichier
sudo nano /etc/nginx/sites-available/sorami

# Après correction
sudo systemctl reload nginx

# Vérifier
curl -I http://localhost:3000
curl -I http://sorami.app
```

---

## 📊 Comprendre les Codes HTTP

| Code | Signification | Action |
|------|---------------|--------|
| 200 | OK | ✅ Tout fonctionne |
| 301/302 | Redirection | ✅ Normal (HTTP → HTTPS) |
| 404 | Not Found | ❌ Problème de configuration |
| 502 | Bad Gateway | ❌ Next.js ne répond pas |
| 503 | Service Unavailable | ❌ Nginx ne peut pas joindre Next.js |
| 000 | No response | ❌ Service complètement down |

---

## 🔍 Logs Importants

### Logs PM2
```bash
# Logs en temps réel
pm2 logs sorami-frontend

# Dernières 50 lignes
pm2 logs sorami-frontend --lines 50

# Logs d'erreur uniquement
pm2 logs sorami-frontend --err --lines 50
```

### Logs Nginx
```bash
# Erreurs
sudo tail -50 /var/log/nginx/sorami_error.log

# Accès
sudo tail -50 /var/log/nginx/sorami_access.log

# En temps réel
sudo tail -f /var/log/nginx/sorami_error.log
```

### Logs Système
```bash
# Nginx service
sudo journalctl -u nginx -n 50

# Tout le système
sudo journalctl -n 100
```

---

## ✅ Checklist Post-Déploiement

Après chaque déploiement, vérifiez :

- [ ] **Nginx** : `sudo systemctl status nginx` → active
- [ ] **PM2** : `pm2 list` → sorami-frontend online
- [ ] **Build** : `ls /home/sorami/sorami/.next` → exists
- [ ] **Localhost** : `curl -I http://localhost:3000` → 200
- [ ] **Domain** : `curl -I http://sorami.app` → 200 ou 301
- [ ] **API** : `curl -I http://sorami.app/api/health` → 200
- [ ] **Logs** : `pm2 logs sorami-frontend --lines 20` → no errors
- [ ] **Browser** : Ouvrir https://sorami.app → fonctionne

---

## 🆘 En Cas d'Urgence

Si le site est complètement down et que rien ne fonctionne :

```bash
# 1. Arrêter tout
pm2 stop all
sudo systemctl stop nginx

# 2. Nettoyer
cd /home/sorami/sorami
rm -rf .next node_modules

# 3. Rebuild from scratch
git fetch origin
git reset --hard origin/main
npm install
npx prisma generate
npm run build

# 4. Redémarrer
pm2 start ecosystem.config.js
pm2 save
sudo systemctl start nginx

# 5. Attendre 30 secondes
sleep 30

# 6. Vérifier
./diagnose-404.sh
```

---

## 📞 Support

Si aucune solution ne fonctionne après avoir suivi ce guide :

1. **Collectez les informations** :
   ```bash
   ./diagnose-404.sh > diagnostic.log
   pm2 logs sorami-frontend --lines 100 > pm2.log
   sudo tail -100 /var/log/nginx/sorami_error.log > nginx.log
   ```

2. **Créez une issue GitHub** avec :
   - Les 3 fichiers de logs
   - Description du problème
   - Étapes déjà tentées
   - Configuration système (`nginx -V`, `node -v`, `npm -v`)

3. **Informations système utiles** :
   ```bash
   # Versions
   node -v
   npm -v
   pm2 -v
   nginx -V
   
   # Système
   uname -a
   df -h
   free -h
   ```

---

## 🎓 Prévention

Pour éviter ces problèmes :

1. **Toujours tester en local avant de déployer**
   ```bash
   npm run build
   npm start
   ```

2. **Utiliser le script de déploiement officiel**
   ```bash
   ./deploy.sh production
   ```

3. **Configurer le monitoring**
   - PM2 Keymetrics
   - Uptime Robot
   - Logs centralisés

4. **Backups automatiques**
   - Base de données quotidienne
   - Configurations Nginx
   - Variables d'environnement

5. **Tests automatisés**
   - Health checks après déploiement
   - Smoke tests sur les endpoints critiques

---

**Dernière mise à jour** : 4 novembre 2025  
**Mainteneur** : Équipe Sorami
