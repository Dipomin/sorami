# 🔐 Configuration IAM pour adm-sora-blog - Guide Visuel

## ❌ Problème Actuel

```
AccessDenied: User arn:aws:iam::193672753533:user/adm-sora-blog 
is not authorized to perform: s3:ListBucket on resource: "arn:aws:s3:::sorami-blog" 
because no identity-based policy allows the s3:ListBucket action
```

**Cause** : L'utilisateur `adm-sora-blog` existe mais n'a **AUCUNE politique IAM** attachée.

---

## ✅ Solution : Ajouter une Politique IAM

### Étape 1️⃣ : Accéder à IAM Console

1. **Ouvrir** : https://console.aws.amazon.com/iam/
2. **Se connecter** avec compte AWS ayant droits admin
3. **Naviguer** : `IAM` → `Users` (menu gauche)

### Étape 2️⃣ : Sélectionner l'Utilisateur

1. **Chercher** : `adm-sora-blog` dans la liste
2. **Cliquer** sur le nom de l'utilisateur

### Étape 3️⃣ : Ajouter une Politique Inline

1. **Onglet** : `Permissions`
2. **Bouton** : `Add permissions` → `Create inline policy`
3. **Onglet** : `JSON` (en haut)

### Étape 4️⃣ : Coller la Politique JSON

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBlogBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::sorami-blog"
    },
    {
      "Sid": "ManageBlogImages",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::sorami-blog/blog/images/*"
    }
  ]
}
```

### Étape 5️⃣ : Valider et Nommer

1. **Cliquer** : `Review policy`
2. **Nom** : `SoramiBlogAccess`
3. **Description** (optionnel) : `Accès S3 pour images de blog Sorami`
4. **Cliquer** : `Create policy`

### Étape 6️⃣ : Vérifier

Dans l'onglet `Permissions` de l'utilisateur, vous devriez voir :

```
✅ Policy: SoramiBlogAccess (inline policy)
   - s3:ListBucket on sorami-blog
   - s3:PutObject, GetObject, DeleteObject on sorami-blog/blog/images/*
```

---

## 📋 Explication des Permissions

### Permission 1 : `s3:ListBucket`

**Resource** : `arn:aws:s3:::sorami-blog`  
**Action** : Lister le contenu du bucket  
**Utilisé par** : `GET /api/blog/images` (liste des images)

**Sans cette permission** :
```
❌ AccessDenied: s3:ListBucket
```

### Permission 2 : `s3:PutObject`

**Resource** : `arn:aws:s3:::sorami-blog/blog/images/*`  
**Action** : Uploader des fichiers  
**Utilisé par** : `POST /api/blog/upload` (upload d'images)

**Sans cette permission** :
```
❌ Cannot upload images
```

### Permission 3 : `s3:GetObject`

**Resource** : `arn:aws:s3:::sorami-blog/blog/images/*`  
**Action** : Télécharger/lire des fichiers  
**Utilisé par** : Accès public + vérifications backend

### Permission 4 : `s3:DeleteObject`

**Resource** : `arn:aws:s3:::sorami-blog/blog/images/*`  
**Action** : Supprimer des fichiers  
**Utilisé par** : `DELETE /api/blog/upload` (suppression d'images)

**Sans cette permission** :
```
❌ Cannot delete images
```

---

## 🔒 Sécurité : Principe du Moindre Privilège

### ✅ Ce que la Politique Permet

```
✅ Lister objets dans sorami-blog
✅ Upload dans blog/images/ uniquement
✅ Lecture dans blog/images/ uniquement  
✅ Suppression dans blog/images/ uniquement
```

### ❌ Ce que la Politique N'Autorise PAS

```
❌ Accès à d'autres buckets S3
❌ Modification des paramètres du bucket
❌ Upload en dehors de blog/images/
❌ Suppression du bucket
❌ Modification des ACL/permissions
```

---

## 🧪 Test Après Configuration

### Test 1 : Via l'Application

1. **Démarrer** : `npm run dev`
2. **Ouvrir** : http://localhost:3001/admin/blog/editor
3. **Cliquer** : "Gérer les images"
4. **Vérifier** : Le modal charge les images sans erreur

### Test 2 : Via l'API

```bash
# Tester la liste des images
curl http://localhost:3001/api/blog/images

# Devrait retourner:
{
  "images": [...]
}

# Au lieu de:
{
  "error": "Failed to list images",
  "details": "AccessDenied..."
}
```

### Test 3 : Logs Serveur

```bash
# Dans le terminal où tourne npm run dev
# AVANT la configuration:
❌ Error listing blog images: AccessDenied

# APRÈS la configuration:
✅ GET /api/blog/images 200 in 150ms
```

---

## 🚨 Troubleshooting

### Erreur Persiste Après Configuration

**Problème** : AccessDenied même après avoir ajouté la politique

**Solutions** :

1. **Vérifier la propagation** (attendre 1-2 minutes)
   ```bash
   # AWS prend quelques secondes pour propager les changements
   sleep 60
   ```

2. **Vérifier les credentials** dans `.env`
   ```bash
   # S'assurer que les bonnes clés sont utilisées
   echo $AWS_BLOG_ACCESS_KEY_ID
   # Doit commencer par AKIAS2F6LWF6YROXGDOR
   ```

3. **Vérifier qu'il n'y a pas de DENY explicite**
   ```
   IAM Console → adm-sora-blog → Permissions
   Chercher des politiques avec "Deny" dans le JSON
   ```

4. **Redémarrer le serveur Next.js**
   ```bash
   # Ctrl+C puis
   npm run dev
   ```

### Erreur "Invalid Policy Document"

**Problème** : AWS refuse la politique JSON

**Causes possibles** :
- Guillemets droits (`"`) au lieu de guillemets courbes (`"`)
- Virgule en trop à la fin d'une liste
- Accolades mal fermées

**Solution** : Copier-coller directement depuis ce document

### Permission Denied sur Console AWS

**Problème** : "You don't have permissions to view this user"

**Solution** : 
- Demander à l'administrateur AWS du compte
- Vous avez besoin de : `iam:GetUser`, `iam:PutUserPolicy`

---

## 📊 Comparaison : Avant vs Après

### AVANT (Sans Politique)

```
User: adm-sora-blog
Policies: 
  ❌ (Aucune)

Résultat:
  ❌ s3:ListBucket     → AccessDenied
  ❌ s3:PutObject      → AccessDenied
  ❌ s3:GetObject      → AccessDenied
  ❌ s3:DeleteObject   → AccessDenied
```

### APRÈS (Avec Politique SoramiBlogAccess)

```
User: adm-sora-blog
Policies:
  ✅ SoramiBlogAccess (inline)
     - s3:ListBucket on sorami-blog
     - s3:PutObject on sorami-blog/blog/images/*
     - s3:GetObject on sorami-blog/blog/images/*
     - s3:DeleteObject on sorami-blog/blog/images/*

Résultat:
  ✅ s3:ListBucket     → 200 OK
  ✅ s3:PutObject      → 200 OK
  ✅ s3:GetObject      → 200 OK (bucket public)
  ✅ s3:DeleteObject   → 200 OK
```

---

## 📝 Checklist Finale

Configuration IAM complète quand :

- [ ] Politique `SoramiBlogAccess` créée
- [ ] Politique attachée à `adm-sora-blog`
- [ ] Permissions visibles dans l'onglet Permissions
- [ ] `GET /api/blog/images` retourne 200
- [ ] Modal "Gérer les images" se charge
- [ ] Upload d'image fonctionne
- [ ] Suppression d'image fonctionne
- [ ] Pas d'erreurs AccessDenied dans les logs

---

## 🔗 Liens Utiles

- **IAM Console** : https://console.aws.amazon.com/iam/
- **S3 Console** : https://s3.console.aws.amazon.com/s3/buckets/sorami-blog
- **Documentation IAM** : https://docs.aws.amazon.com/IAM/latest/UserGuide/
- **S3 Permissions** : https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-access-control.html

---

## 💡 Notes Importantes

1. **Cette politique est INLINE** : attachée directement à l'utilisateur
2. **Pas de groupe** : pour simplicité et isolation
3. **Scope limité** : uniquement `blog/images/` pour sécurité
4. **Bucket public** : GetObject fonctionne sans credentials (lecture publique)
5. **Propagation** : changements effectifs en < 60 secondes

---

## ✅ Prochaines Étapes

Après avoir appliqué la politique IAM :

1. ✅ Tester l'API : `curl http://localhost:3001/api/blog/images`
2. ✅ Tester le modal dans l'éditeur de blog
3. ✅ Uploader une image de test
4. ✅ Supprimer l'image de test
5. ✅ Déployer en production avec les mêmes permissions

**Une fois la politique appliquée, tout devrait fonctionner immédiatement !** 🎉
