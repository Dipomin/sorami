# Intégration Paystack - Sorami

Ce document décrit l'intégration Paystack implémentée dans le projet.

## Variables d'environnement

Configurer dans `.env` :

- `PAYSTACK_SECRET_KEY` (clé secrète)
- `PAYSTACK_PUBLIC_KEY` (clé publique)
- `PAYSTACK_WEBHOOK_SECRET` (secret pour webhook)

Assurez-vous que la devise utilisée est XOF (Franc CFA). Tous les montants sont gérés en unité principale puis multipliés par 100 pour Paystack (ex: 5000 XOF → 500000 envoyé à Paystack).

## Fichiers importants

- `src/lib/paystack.ts` : wrapper pour appels API Paystack (initialize, verify, plan, subscription, cancel et vérification signature webhook)
- `src/app/api/payments/*` : endpoints d'initialisation, vérification, webhook et historique
- `src/app/api/subscriptions/*` : endpoints de status et annulation
- `schema.prisma` : nouveaux modèles `Transaction`, `Subscription`, `PaystackPlan`

## Flux de paiement (paiement à l’unité)

1. Frontend appelle `POST /api/payments/initialize` avec `{ amount, email, metadata }`.
2. API appelle Paystack `/transaction/initialize` et retourne `authorization_url` et `reference`.
3. Frontend redirige l'utilisateur vers `authorization_url`.
4. Paystack redirige ou notifie via webhook `charge.success`.
5. Webhook vérifie signature HMAC (`x-paystack-signature`) puis met à jour la table `transactions` en `SUCCESS` et stocke `providerData`.

> Important: la transaction n'est persistée définitivement qu'après la confirmation par webhook ou par la vérification `/api/payments/verify`.

## Flux d’abonnement

1. Frontend demande plan / choix d'abonnement.
2. Backend peut créer un plan via `/plan` si nécessaire (voir `src/lib/paystack.ts`).
3. Création d'une souscription via l'API Paystack (`/subscription`) et stockage du `subscription.paystackId` dans `Subscription`.
4. Les webhooks Paystack (`subscription.create`, `subscription.disable`, etc.) mettent à jour le statut dans la table `subscriptions`.

## Sécurité

- Le webhook vérifie la signature HMAC SHA512 du corps avec `PAYSTACK_WEBHOOK_SECRET` (ou `PAYSTACK_SECRET_KEY` comme fallback).
- Les transactions ne sont marquées `SUCCESS` que si Paystack confirme le paiement.
- Les endpoints sensibles utilisent `requireAuth()` pour vérifier l'utilisateur connecté.

## Notifications & Facturation

Le système stocke les transactions et abonnements en DB (`Transaction`, `Subscription`). Vous pouvez brancher un service d'envoi d'email (ex: SendGrid) sur l'événement `charge.success` dans le webhook pour envoyer la facture et stocker la copie dans le dashboard utilisateur (implémentation à étendre selon le fournisseur d'emails choisi).

## Remarques

- Les modèles Prisma ont été ajoutés ; lancez `npx prisma generate` et `npx prisma migrate dev --name add-payments` pour appliquer les migrations.
- Tests rapides pour vérifier la DB : `scripts/check-user-images.ts` (déjà présent) et scripts de test fournis.
