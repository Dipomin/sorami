# 🚨 ACTION REQUISE : Configuration AWS IAM

## Le Problème
L'utilisateur AWS `adm-sora-blog` n'a **aucune permission** pour accéder au bucket `sorami-blog`.

## La Solution (5 minutes)

### 1. Aller sur AWS Console
👉 https://console.aws.amazon.com/iam/

### 2. Trouver l'utilisateur
- Cliquer sur "Users" (menu gauche)
- Chercher et cliquer sur `adm-sora-blog`

### 3. Ajouter les permissions
- Onglet "Permissions"
- Bouton "Add permissions" → "Create inline policy"
- Onglet "JSON"

### 4. Copier-coller cette politique :

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

### 5. Valider
- Cliquer "Review policy"
- Nom : `SoramiBlogAccess`
- Cliquer "Create policy"

## ✅ Vérification

Une fois fait, retourner sur l'application et recharger la page.
Le gestionnaire d'images devrait fonctionner !

---

**Documentation complète** : Voir `FIX_IAM_PERMISSIONS_BLOG.md`
