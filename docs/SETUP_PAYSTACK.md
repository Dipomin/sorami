# Guide d'Installation et Configuration - Système de Paiement Paystack

Ce guide détaille les étapes pour mettre en place le système de paiement et d'abonnement avec Paystack.

## 📋 Prérequis

- Compte Paystack (https://paystack.com)
- Base de données MySQL configurée
- Node.js 18+ et npm
- Compte email SMTP (Gmail recommandé)

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install nodemailer @types/nodemailer
```

### 2. Configuration des variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```bash
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # ou sk_live_xxxxx en production
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxx

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app  # Pour Gmail: créer un mot de passe d'application
SMTP_FROM="Sorami <noreply@sorami.app>"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou votre domaine en production
```

#### Configuration Gmail (recommandé)

1. Activez la validation en 2 étapes sur votre compte Google
2. Allez dans Paramètres Google → Sécurité → Validation en 2 étapes
3. Créez un "Mot de passe d'application" pour "Autre (nom personnalisé)"
4. Utilisez ce mot de passe dans `SMTP_PASSWORD`

### 3. Appliquer les migrations Prisma

```bash
npx prisma generate
npx prisma migrate dev --name add-payments
```

### 4. Configurer le webhook Paystack

1. Connectez-vous à votre dashboard Paystack
2. Allez dans Settings → Webhooks
3. Ajoutez l'URL : `https://votre-domaine.com/api/payments/webhook`
4. Sélectionnez les événements :
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ invoice.payment_succeeded
5. Copiez le secret webhook et ajoutez-le dans `.env`

## 📁 Structure des Fichiers

```
src/
├── lib/
│   ├── paystack.ts                 # Service Paystack (API wrapper)
│   └── notifications.ts            # Service email avec Nodemailer
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── initialize/route.ts # Initialiser un paiement
│   │   │   ├── verify/route.ts     # Vérifier un paiement
│   │   │   ├── webhook/route.ts    # Webhook Paystack
│   │   │   └── history/route.ts    # Historique transactions
│   │   ├── subscriptions/
│   │   │   ├── status/route.ts     # Statut abonnement
│   │   │   └── cancel/route.ts     # Annuler abonnement
│   │   └── notifications/
│   │       └── list/route.ts       # Liste notifications
│   ├── pricing/page.tsx            # Page des plans
│   ├── checkout/[type]/page.tsx    # Page de paiement
│   └── dashboard/
│       ├── payments/page.tsx       # Historique paiements
│       └── subscription/page.tsx   # Gestion abonnement
└── schema.prisma                    # Modèles DB (Transaction, Subscription, etc.)
```

## 💳 Flux de Paiement

### Paiement à l'unité

1. **Frontend** : Utilisateur clique "Payer" → appelle `/api/payments/initialize`
2. **Backend** : Crée transaction PENDING + appelle Paystack `/transaction/initialize`
3. **Paystack** : Retourne `authorization_url`
4. **Frontend** : Redirige vers `authorization_url` (page Paystack)
5. **Paystack** : Utilisateur paie → envoie webhook `charge.success`
6. **Backend** : Reçoit webhook → vérifie signature → met à jour transaction SUCCESS
7. **Backend** : Crée notification + envoie email facture via Nodemailer

### Abonnement

1. **Frontend** : Utilisateur choisit plan → `/checkout/subscription?plan=xxx`
2. **Backend** : Crée plan Paystack si nécessaire (via `/api/payments/initialize` ou script dédié)
3. **Paystack** : Utilisateur s'abonne
4. **Webhook** : `subscription.create` → backend crée `Subscription` ACTIVE
5. **Backend** : Envoie email confirmation + notification
6. **Renouvellement** : Paystack envoie webhook automatiquement chaque période

## 🔒 Sécurité

### Vérification Webhook

Le webhook vérifie la signature HMAC SHA512 :

```typescript
// Dans src/lib/paystack.ts
export function verifyWebhookSignature(rawBody: string, signature?: string) {
  const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return hash === signature;
}
```

⚠️ **Important** : Toujours vérifier la signature avant de traiter un webhook !

### Bonnes Pratiques

- ✅ Ne jamais exposer `PAYSTACK_SECRET_KEY` côté client
- ✅ Toujours utiliser HTTPS en production
- ✅ Vérifier la signature webhook
- ✅ Stocker `providerData` pour audit
- ✅ Logger toutes les transactions pour debug

## 📧 Emails et Notifications

### Types d'emails envoyés

1. **Facture** : Envoyé après paiement réussi (`charge.success`)
2. **Confirmation abonnement** : Envoyé après souscription (`subscription.create`)
3. **Rappel renouvellement** : (À implémenter selon besoin)

### Personnalisation des templates

Modifiez les fonctions dans `src/lib/notifications.ts` :
- `sendInvoiceEmail()` : Template de facture
- `sendSubscriptionEmail()` : Template confirmation abonnement

## 🧪 Tests

### Test en mode développement

1. Utilisez les clés test Paystack (`sk_test_xxx`, `pk_test_xxx`)
2. Utilisez les cartes de test Paystack :
   - **Succès** : `4084 0840 8408 4081` (CVV: 408, Date: 12/25)
   - **Échec** : `5060 6666 6666 6666` (CVV: 123)

### Test du webhook localement

Utilisez ngrok pour exposer localhost :

```bash
ngrok http 3000
# URL générée : https://abc123.ngrok.io
# Webhook URL : https://abc123.ngrok.io/api/payments/webhook
```

### Vérifier les transactions

```bash
# Script pour checker DB
npx tsx scripts/check-transactions.ts
```

## 📊 Dashboard Utilisateur

### Pages disponibles

- `/dashboard/payments` : Historique des paiements avec statuts
- `/dashboard/subscription` : Gestion de l'abonnement actif
- `/pricing` : Page de choix des plans

### Notifications

Les notifications sont stockées en DB (`Notification` model) et consultables via :
```typescript
GET /api/notifications/list
```

## 🐛 Troubleshooting

### Les emails ne sont pas envoyés

1. Vérifiez `SMTP_USER` et `SMTP_PASSWORD`
2. Pour Gmail : utilisez un mot de passe d'application
3. Vérifiez les logs : `console.log` dans `src/lib/notifications.ts`

### Le webhook ne fonctionne pas

1. Vérifiez que l'URL webhook est accessible (HTTPS en production)
2. Vérifiez `PAYSTACK_WEBHOOK_SECRET` dans `.env`
3. Consultez les logs Paystack dans leur dashboard

### Les transactions restent PENDING

1. Le webhook n'a pas été reçu → vérifier URL webhook
2. Signature invalide → vérifier `PAYSTACK_WEBHOOK_SECRET`
3. Erreur dans le traitement → consulter les logs serveur

### Prisma client n'a pas les nouveaux modèles

```bash
npx prisma generate
```

## 🚀 Déploiement Production

### Checklist

- [ ] Remplacer clés test par clés live Paystack
- [ ] Configurer webhook avec URL production (HTTPS)
- [ ] Configurer SMTP production (SendGrid/AWS SES recommandé)
- [ ] Ajouter monitoring erreurs (Sentry)
- [ ] Activer logs structurés
- [ ] Tester flow complet en production

### Variables d'environnement production

```bash
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_APP_URL=https://sorami.app
SMTP_HOST=smtp.sendgrid.net  # ou autre provider
```

## 📚 Ressources

- [Documentation Paystack](https://paystack.com/docs)
- [API Reference Paystack](https://paystack.com/docs/api)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🆘 Support

Pour toute question :
1. Consultez les logs serveur
2. Vérifiez le dashboard Paystack
3. Testez avec les cartes de test Paystack
4. Consultez `docs/paystack-integration.md`

---

**Date de création** : 24 octobre 2025  
**Version** : 1.0.0
