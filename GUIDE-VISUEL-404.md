# 🚨 Résolution Erreur 404 - Guide Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    ERREUR 404 NGINX                          │
│                                                              │
│  "404 Not Found - nginx/1.24.0 (Ubuntu)"                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Transférer les scripts sur le VPS                │
└─────────────────────────────────────────────────────────────┘

Sur votre machine locale:
$ scp diagnose-404.sh fix-404.sh sorami@IP-VPS:/home/sorami/sorami/

                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: Connexion au VPS                                  │
└─────────────────────────────────────────────────────────────┘

$ ssh sorami@IP-VPS
$ cd /home/sorami/sorami
$ chmod +x diagnose-404.sh fix-404.sh

                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: Diagnostic                                        │
└─────────────────────────────────────────────────────────────┘

$ ./diagnose-404.sh

Le script analyse:
✓ État de Nginx
✓ Configuration Nginx
✓ Application PM2
✓ Port 3000 (Next.js)
✓ Ports 80/443
✓ Build Next.js
✓ Logs
✓ Certificats SSL
✓ Tests externes

                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: Correction Automatique                            │
└─────────────────────────────────────────────────────────────┘

$ ./fix-404.sh

Le script corrige:
🔧 Démarre Nginx
🔧 Active la configuration
🔧 Installe PM2 si besoin
🔧 Build l'application
🔧 Redémarre PM2
🔧 Teste la connectivité

                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  RÉSULTAT ATTENDU                                           │
└─────────────────────────────────────────────────────────────┘

✅ Nginx: active
✅ PM2: sorami-frontend online
✅ localhost:3000 → HTTP 200
✅ sorami.app → HTTP 200/301
✅ Site accessible dans le navigateur
```

---

## 🎯 Arbre de Décision

```
                        Site affiche 404?
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   OUI                 NON
                    │                   │
                    ▼                   ▼
            ./diagnose-404.sh      Tout va bien! ✅
                    │
                    ▼
        ┌───────────┴───────────┐
        │                       │
    Nginx actif?            PM2 online?
        │                       │
       NON                     NON
        │                       │
        ▼                       ▼
    Start Nginx            Start PM2
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
            ./fix-404.sh
                    │
                    ▼
            Vérifier résultat
                    │
        ┌───────────┴───────────┐
        │                       │
       OK                     KO
        │                       │
        ▼                       ▼
    ✅ Résolu!        Redéploiement complet
                              │
                              ▼
                    ./deploy.sh production
```

---

## 📊 Tableau de Diagnostic Rapide

| Symptôme | Cause Probable | Solution Rapide |
|----------|---------------|-----------------|
| 🔴 404 Nginx | Config non activée | `sudo ln -s /etc/nginx/sites-available/sorami /etc/nginx/sites-enabled/` |
| 🔴 502 Bad Gateway | Next.js ne répond pas | `pm2 restart sorami-frontend` |
| 🔴 503 Service Unavailable | PM2 non démarré | `pm2 start ecosystem.config.js` |
| 🟡 Connection refused | Nginx arrêté | `sudo systemctl start nginx` |
| 🟡 Redirect loop | Config SSL problème | Vérifier certificats SSL |
| 🔴 Page blanche | Build manquant | `npm run build && pm2 restart sorami-frontend` |

---

## 🔍 Checklist de Vérification Visuelle

```
┌─────────────────────────────────────────────────┐
│  CHECKLIST POST-CORRECTION                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  [ ] Nginx Status                               │
│      $ sudo systemctl status nginx              │
│      → ✅ active (running)                      │
│                                                 │
│  [ ] PM2 Status                                 │
│      $ pm2 list                                 │
│      → ✅ sorami-frontend | online              │
│                                                 │
│  [ ] Next.js Local                              │
│      $ curl -I http://localhost:3000            │
│      → ✅ HTTP/1.1 200 OK                       │
│                                                 │
│  [ ] Site Externe                               │
│      $ curl -I http://sorami.app                │
│      → ✅ HTTP/1.1 200 OK ou 301                │
│                                                 │
│  [ ] Navigateur                                 │
│      Ouvrir https://sorami.app                  │
│      → ✅ Site s'affiche                        │
│                                                 │
│  [ ] Logs Clean                                 │
│      $ pm2 logs sorami-frontend --lines 10      │
│      → ✅ Pas d'erreur                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Scripts Disponibles

```
┌─────────────────────────────────────────────────────────┐
│  SCRIPTS DE RÉSOLUTION                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  quick-check.sh                                         │
│  ├─ Durée: ~10 secondes                                │
│  ├─ Usage: Vérification rapide                         │
│  └─ Output: ✅/❌ pour chaque service                   │
│                                                         │
│  diagnose-404.sh                                        │
│  ├─ Durée: ~30 secondes                                │
│  ├─ Usage: Diagnostic complet                          │
│  └─ Output: Analyse détaillée + recommandations        │
│                                                         │
│  fix-404.sh                                             │
│  ├─ Durée: ~2-5 minutes                                │
│  ├─ Usage: Correction automatique                      │
│  └─ Output: Actions effectuées + résultat              │
│                                                         │
│  deploy.sh production                                   │
│  ├─ Durée: ~5-10 minutes                               │
│  ├─ Usage: Déploiement complet                         │
│  └─ Output: Build + deploy + vérifications             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Commandes Essentielles

### Vérifications Rapides

```bash
# Status global
pm2 status && sudo systemctl status nginx

# Test local
curl -I http://localhost:3000

# Test externe
curl -I http://sorami.app

# Logs en temps réel
pm2 logs sorami-frontend
```

### Corrections Rapides

```bash
# Redémarrer Nginx
sudo systemctl restart nginx

# Redémarrer PM2
pm2 restart sorami-frontend

# Rebuild
npm run build && pm2 restart sorami-frontend

# Tout redémarrer
pm2 restart all && sudo systemctl restart nginx
```

### Nettoyage

```bash
# Cache
npm cache clean --force

# Build
rm -rf .next node_modules

# Rebuild complet
npm install && npm run build
```

---

## 🎓 Comprendre l'Architecture

```
┌─────────────────────────────────────────────────────┐
│  INTERNET                                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  DNS (sorami.app → IP du VPS)                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  FIREWALL VPS (ports 80, 443)                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  NGINX (Reverse Proxy)                              │
│  - Port 80/443 → localhost:3000                    │
│  - SSL/TLS                                          │
│  - Cache                                            │
│  - Compression                                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  PM2 (Process Manager)                              │
│  - Gère Next.js                                     │
│  - Auto-restart                                     │
│  - Logs                                             │
│  - Cluster mode                                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  NEXT.JS (Application)                              │
│  - Port 3000                                        │
│  - Server-side rendering                            │
│  - API routes                                       │
│  - Static assets                                    │
└─────────────────────────────────────────────────────┘
```

**Point de défaillance le plus courant**: Le lien Nginx → Next.js

---

## 🆘 En Cas d'Urgence

### Option Nucléaire (15 minutes de downtime)

```bash
# 1. Arrêter tout
pm2 stop all
sudo systemctl stop nginx

# 2. Nettoyer
cd /home/sorami/sorami
rm -rf .next node_modules

# 3. Reset Git
git fetch origin
git reset --hard origin/main

# 4. Rebuild
npm install
npx prisma generate
npm run build

# 5. Redémarrer
pm2 start ecosystem.config.js
pm2 save
sudo systemctl start nginx

# 6. Attendre & vérifier
sleep 30
./quick-check.sh
```

---

## 📞 Obtenir de l'Aide

Si rien ne fonctionne après 30 minutes :

1. **Collectez les logs**
   ```bash
   ./diagnose-404.sh > diagnostic.log
   pm2 logs sorami-frontend --lines 100 > pm2.log
   sudo tail -100 /var/log/nginx/sorami_error.log > nginx.log
   ```

2. **Créez une issue GitHub** avec :
   - Les 3 fichiers de logs
   - Capture d'écran de l'erreur
   - Ce que vous avez déjà essayé

3. **Informations système**
   ```bash
   node -v
   npm -v
   nginx -V
   uname -a
   ```

---

**Créé le**: 4 novembre 2025  
**Version**: 1.0  
**Mainteneur**: Équipe Sorami
