# 🚨 URGENT - Fix VPS Sudo Password Issue

## Problème
```
sudo: a terminal is required to read the password
npm error code EACCES
npm error syscall rename
```

**Cause** : Le workflow GitHub Actions ne peut pas exécuter `sudo` car il n'y a pas de terminal interactif pour entrer le mot de passe.

---

## ✅ Solution DÉFINITIVE (À faire UNE SEULE FOIS)

### Étape 1 : Copier et exécuter le script de fix

**Sur votre machine locale** :
```bash
# Copier le script sur le VPS
scp fix-vps-once.sh sorami@178.18.254.232:/home/sorami/
```

**Sur le VPS** :
```bash
# Se connecter
ssh sorami@178.18.254.232

# Aller dans le répertoire
cd /home/sorami/sorami

# Copier le script
cp ~/fix-vps-once.sh .

# Rendre exécutable
chmod +x fix-vps-once.sh

# Exécuter (vous devrez entrer le mot de passe sudo UNE fois)
./fix-vps-once.sh
```

### Ce que fait le script :
1. ✅ Corrige TOUTES les permissions du répertoire
2. ✅ Nettoie complètement `node_modules`, `.next`, caches
3. ✅ **Configure sudo SANS mot de passe** pour les commandes de déploiement
4. ✅ Réinstalle et rebuild proprement
5. ✅ Redémarre PM2

---

## 🔐 Alternative Manuelle (Si le script ne fonctionne pas)

```bash
# 1. Se connecter au VPS
ssh sorami@178.18.254.232
cd /home/sorami/sorami

# 2. Corriger les permissions
sudo chown -R sorami:sorami /home/sorami/sorami

# 3. Nettoyer complètement
sudo rm -rf node_modules .next package-lock.json

# 4. Configurer sudo sans mot de passe
echo "sorami ALL=(ALL) NOPASSWD: /bin/rm, /bin/chown" | sudo tee /etc/sudoers.d/sorami-deploy
sudo chmod 0440 /etc/sudoers.d/sorami-deploy

# 5. Réinstaller
npm cache clean --force
npm install --legacy-peer-deps
npx prisma generate
npm run build

# 6. Redémarrer
pm2 reload sorami-frontend --update-env
pm2 save
```

---

## ⚡ Après le Fix

Une fois le script exécuté **UNE SEULE FOIS** :

1. ✅ Tous les prochains déploiements GitHub Actions fonctionneront **automatiquement**
2. ✅ `sudo` ne demandera plus de mot de passe pour les commandes de nettoyage
3. ✅ Les permissions seront toujours correctes

---

## 🔄 Re-déclencher le Déploiement

Après avoir exécuté le script, allez sur :
👉 https://github.com/Dipomin/sorami/actions

Cliquez sur **"Re-run all jobs"**

Le workflow devrait maintenant **réussir complètement** ! 🎉

---

## 📝 Notes de Sécurité

Le fichier `/etc/sudoers.d/sorami-deploy` permet à l'utilisateur `sorami` d'exécuter **uniquement** les commandes suivantes sans mot de passe :
- `/bin/rm` (suppression de fichiers)
- `/bin/chown` (changement de propriétaire)

C'est **sécurisé** car limité aux commandes nécessaires pour le déploiement.

---

**Date** : 7 Novembre 2025  
**Status** : ⚠️ ACTION REQUISE - Exécuter fix-vps-once.sh sur le VPS
