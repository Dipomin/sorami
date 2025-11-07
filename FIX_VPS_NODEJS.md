# 🚨 Fix VPS Deployment - Node.js manquant

## Problème
```
-bash: line 11: npm: command not found
Error: Process completed with exit code 127
```

**Cause** : Node.js et npm ne sont pas installés sur le VPS Ubuntu.

## ✅ Solution Rapide

### Option 1 : Script automatique

1. **Copiez le script sur le VPS** :
```bash
scp setup-nodejs-vps.sh sorami@VPS_IP:/home/sorami/
```

2. **Connectez-vous au VPS** :
```bash
ssh sorami@VPS_IP
```

3. **Exécutez le script** :
```bash
chmod +x setup-nodejs-vps.sh
./setup-nodejs-vps.sh
```

### Option 2 : Installation manuelle

**Connectez-vous au VPS et exécutez** :

```bash
# 1. Installer Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Vérifier l'installation
node -v   # Devrait afficher v20.x.x
npm -v    # Devrait afficher 10.x.x

# 3. Installer PM2 globalement
sudo npm install -g pm2

# 4. Vérifier PM2
pm2 -v
```

### Option 3 : Installation rapide (une ligne)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs && sudo npm install -g pm2
```

## 🔄 Après l'installation

1. **Retournez dans le répertoire de l'app** :
```bash
cd /home/sorami/sorami
```

2. **Installez les dépendances** :
```bash
npm ci
```

3. **Générez Prisma** :
```bash
npx prisma generate
npx prisma migrate deploy
```

4. **Buildez l'application** :
```bash
npm run build
```

5. **Démarrez avec PM2** :
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Suivez les instructions
```

## ✅ Vérification

```bash
# Vérifier que Node.js est installé
node -v
npm -v

# Vérifier que l'app tourne
pm2 status
pm2 logs sorami-frontend
```

## 🚀 Re-déclencher le déploiement

Une fois Node.js installé, re-déclenchez le workflow GitHub Actions :
- Allez sur : https://github.com/Dipomin/sorami/actions
- Cliquez sur "Re-run jobs"

Ou pushez un commit :
```bash
git commit --allow-empty -m "trigger: retry deployment after Node.js installation"
git push origin main
```

## 📝 Notes

- **Version Node.js** : 20.x LTS (recommandé pour Next.js 15)
- **Version npm** : 10.x (fournie avec Node.js 20)
- **PM2** : Nécessaire pour gérer le processus en production

## ❗ Prévention Future

Le workflow a été mis à jour pour vérifier si Node.js est installé avant de continuer. Si Node.js manque, il affichera un message d'erreur clair avec les instructions.

---

**Date** : 7 Novembre 2025  
**Status** : ⚠️ Action requise - Installation Node.js sur VPS
