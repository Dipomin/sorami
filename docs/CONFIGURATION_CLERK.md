# 🔧 Configuration des Clés Clerk - Guide

## ⚠️ Important : Clés Temporaires Utilisées

Actuellement, l'application utilise des **clés temporaires factices**. Vous devez configurer de vraies clés Clerk pour que l'authentification fonctionne.

## 🚀 Étapes de Configuration

### 1. Créer une Application Clerk

1. Allez sur [clerk.com](https://clerk.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "Create Application"
4. Choisissez un nom : "Eboox" ou "Sorami"
5. Sélectionnez "Email" et/ou "Google" comme méthodes de connexion

### 2. Récupérer les Clés API

Dans le dashboard Clerk :
1. Allez dans **"API Keys"** dans la sidebar
2. Copiez la **"Publishable key"** (commence par `pk_test_...`)
3. Copiez la **"Secret key"** (commence par `sk_test_...`)

### 3. Configurer les URLs de Redirection

Dans **"Paths"** :
- **Sign-in URL** : `/sign-in`
- **Sign-up URL** : `/sign-up`
- **Home URL** : `/dashboard`
- **After sign-in** : `/dashboard`
- **After sign-up** : `/dashboard`

### 4. Configurer le Webhook (Optionnel)

Si vous voulez synchroniser les utilisateurs avec votre base de données :

1. Dans **"Webhooks"**, cliquez "Add Endpoint"
2. **URL** : `https://votre-domaine.com/api/webhooks/clerk`
3. **Events** : Sélectionnez `user.created`, `user.updated`, `user.deleted`
4. Copiez le **"Webhook Secret"** (commence par `whsec_...`)

### 5. Mettre à Jour .env.local

Remplacez les clés temporaires dans `.env.local` :

```bash
# Clerk Authentication - REMPLACEZ PAR VOS VRAIES CLÉS
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE"
CLERK_SECRET_KEY="sk_test_VOTRE_CLE_SECRETE"
CLERK_WEBHOOK_SECRET="whsec_VOTRE_SECRET_WEBHOOK"  # Optionnel
```

## 🧪 Test de l'Authentification

1. Démarrez l'application :
   ```bash
   npm run dev
   ```

2. Allez sur `http://localhost:3000`

3. Cliquez sur "Se connecter" dans le header

4. Testez l'inscription et la connexion

## 🔍 Dépannage

### Erreur "Invalid publishable key"
- Vérifiez que vous avez copié la bonne clé depuis le dashboard Clerk
- Assurez-vous qu'elle commence par `pk_test_`

### Erreur de redirection
- Vérifiez les URLs dans "Paths" du dashboard Clerk
- Assurez-vous que les URLs correspondent à votre domaine

### Webhook ne fonctionne pas
- Le webhook n'est nécessaire qu'en production
- En développement, vous pouvez laisser le secret temporaire

## 📱 URLs de Test

- **Page d'accueil** : `http://localhost:3000`
- **Connexion** : `http://localhost:3000/sign-in`
- **Inscription** : `http://localhost:3000/sign-up`
- **Dashboard** : `http://localhost:3000/dashboard` (après connexion)

## ✅ Une Fois Configuré

L'application aura accès à toutes les fonctionnalités d'authentification Clerk :
- 🔐 Connexion/Déconnexion fluide
- 📧 Vérification d'email automatique
- 🔄 Synchronisation utilisateur
- 🎨 Interface moderne et responsive
- 🌍 Support multilingue (français configuré)

---

**Note** : Ces étapes sont nécessaires uniquement pour utiliser Clerk en production. Pour le développement local, vous pouvez utiliser les clés temporaires pour tester la structure de l'application.