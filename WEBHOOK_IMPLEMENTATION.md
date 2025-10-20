# 🔔 Implémentation Webhook - Documentation Complète

## Vue d'Ensemble

Le webhook `/api/webhooks/book-completion` reçoit les notifications du backend CrewAI lorsqu'un livre est terminé ou échoue. Cette implémentation suit les meilleures pratiques de la documentation CrewAI.

---

## ✨ Fonctionnalités Implémentées

### 🔒 Sécurité

- ✅ **Validation du secret webhook** en production via `X-Webhook-Secret` header
- ✅ **Mode développement relaxé** pour faciliter les tests locaux
- ✅ **Validation stricte du payload** avec types TypeScript
- ✅ **Logging détaillé** de toutes les tentatives d'accès

### 🔁 Idempotence

- ✅ **Prévention des doublons** via système de cache en mémoire
- ✅ **Fenêtre d'idempotence de 5 minutes** (configurable)
- ✅ **Nettoyage automatique** des entrées expirées toutes les 10 minutes
- ✅ **Clé d'idempotence** : `{job_id}-{status}`

### 🗄️ Transactions Atomiques

- ✅ **Transaction Prisma** pour garantir la cohérence des données
- ✅ **Création/mise à jour atomique** : Book + Chapters en une seule opération
- ✅ **Rollback automatique** en cas d'erreur

### 📊 Monitoring & Logging

- ✅ **Logs structurés** avec emojis pour faciliter la lecture
- ✅ **Tracking du temps de traitement** pour chaque webhook
- ✅ **Logs d'erreur détaillés** avec codes Prisma
- ✅ **Métadonnées complètes** sur chaque opération

### ⚡ Performance

- ✅ **Réponse rapide** (< 30 secondes comme recommandé)
- ✅ **Gestion async/await** optimisée
- ✅ **Déconnexion Prisma** automatique dans finally
- ✅ **Création de notifications hors transaction** (non-bloquant)

---

## 📡 Format du Webhook

### Payload Attendu (Conforme à la Documentation CrewAI)

```json
{
  "job_id": "abc-123-def",
  "status": "completed",
  "timestamp": "2025-10-20T14:30:00.000Z",
  "environment": "development",
  "book_data": {
    "book_title": "Mon Livre en Français",
    "topic": "Intelligence Artificielle",
    "goal": "Guide complet sur l'IA",
    "outline": [
      {
        "title": "Chapitre 1",
        "description": "Introduction à l'IA"
      }
    ],
    "chapters": [
      {
        "title": "Chapitre 1",
        "content": "# Chapitre 1\n\nContenu complet...",
        "description": "Introduction"
      }
    ],
    "generated_at": "2025-10-20T14:30:00.000Z",
    "word_count": 15000,
    "chapter_count": 5
  }
}
```

### Headers Requis

**En Production :**
```
Content-Type: application/json
X-Webhook-Secret: sorami-webhook-secret-key-2025
```

**En Développement :**
```
Content-Type: application/json
```

---

## 🔄 Flux de Traitement

```
1. Réception du Webhook
   ↓
2. Validation du Secret (prod uniquement)
   ↓
3. Parsing & Validation du Payload
   ↓
4. Vérification d'Idempotence
   ↓ (nouveau webhook)
5. Vérification du Job en BDD
   ↓
6. Transaction Prisma
   ├─ Création/MAJ du Book
   ├─ Suppression anciens Chapters
   ├─ Création nouveaux Chapters
   └─ MAJ du BookJob (COMPLETED)
   ↓
7. Création Notification (hors transaction)
   ↓
8. Réponse HTTP 200 avec métadonnées
```

---

## 🧪 Tests

### Test Manuel avec cURL

**Développement :**
```bash
curl -X POST http://localhost:3000/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-job-123",
    "status": "completed",
    "timestamp": "2025-01-20T10:00:00.000Z",
    "environment": "development",
    "book_data": {
      "book_title": "Test Book",
      "topic": "Test Topic",
      "goal": "Test Goal",
      "outline": [],
      "chapters": [
        {
          "title": "Chapter 1",
          "content": "# Chapter 1\n\nContent here...",
          "description": "First chapter"
        }
      ],
      "generated_at": "2025-01-20T10:00:00.000Z",
      "word_count": 1000,
      "chapter_count": 1
    }
  }'
```

**Production :**
```bash
curl -X POST https://votre-domaine.com/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{...}'
```

### Réponse Attendue

**Succès (200) :**
```json
{
  "success": true,
  "message": "Webhook reçu et traité avec succès",
  "job_id": "test-job-123",
  "processed_at": "2025-01-20T10:00:05.000Z",
  "processing_time_ms": 234,
  "result": {
    "bookId": "book-uuid-456",
    "chaptersCreated": 1,
    "wordCount": 1000
  }
}
```

**Idempotence (200) :**
```json
{
  "success": true,
  "message": "Webhook already processed (idempotent)",
  "job_id": "test-job-123",
  "processed_at": "2025-01-20T10:00:00.000Z"
}
```

**Erreur (401 - Secret invalide) :**
```json
{
  "error": "Unauthorized",
  "message": "Invalid webhook secret"
}
```

**Erreur (404 - Job non trouvé) :**
```json
{
  "error": "Job not found",
  "job_id": "unknown-job-123"
}
```

---

## 🔧 Configuration

### Variables d'Environnement

**`.env.local` :**
```bash
# Webhook Configuration
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhooks/book-completion

# En production
# WEBHOOK_SECRET=votre-secret-production-tres-securise
# NEXT_PUBLIC_WEBHOOK_URL=https://votre-domaine.com/api/webhooks/book-completion
```

### Backend CrewAI

Le backend doit être configuré pour envoyer les webhooks :

**`.env` (CrewAI) :**
```bash
# Développement
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3000/api/webhooks/book-completion

# Production
# ENVIRONMENT=production
# WEBHOOK_URL=https://votre-domaine.com/api/webhooks/book-completion
# WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

---

## 📊 Logs Structurés

### Logs de Succès

```
📬 Webhook reçu du backend {
  origin: 'http://localhost:9006',
  environment: 'development',
  timestamp: '2025-01-20T10:00:00.000Z'
}

🔓 Mode développement - pas de vérification du secret

📚 Traitement du webhook {
  job_id: 'abc-123',
  status: 'completed',
  environment: 'development',
  hasBookData: true
}

📖 Traitement du livre: Mon Livre en Français

📚 Création d'un nouveau livre

✅ 5 chapitres créés

✅ Livre créé avec succès {
  bookId: 'book-uuid-456',
  chaptersCreated: 5,
  wordCount: 15000,
  processingTimeMs: 234
}

🔔 Notification créée: {...}

✅ Webhook traité avec succès {
  job_id: 'abc-123',
  processingTimeMs: 234,
  status: 'completed'
}
```

### Logs d'Erreur

```
❌ Secret webhook invalide {
  provided: 'missing',
  origin: 'http://unknown-domain.com'
}

❌ Données invalides dans le webhook {
  hasJobId: false,
  hasStatus: true,
  hasTimestamp: true
}

❌ Job non trouvé {
  jobId: 'unknown-job-123'
}
```

---

## 🛡️ Sécurité

### Production Checklist

- ✅ `WEBHOOK_SECRET` configuré avec une valeur forte
- ✅ HTTPS activé sur le domaine
- ✅ Logs sensibles filtrés (pas de secret en clair)
- ✅ Rate limiting recommandé (à implémenter au niveau infra)
- ✅ Monitoring des erreurs 401/403

### Recommandations

1. **Secret fort** : Minimum 32 caractères aléatoires
2. **Rotation régulière** : Changer le secret tous les 3-6 mois
3. **Monitoring** : Alertes sur tentatives d'accès non autorisées
4. **Rate limiting** : Maximum 100 webhooks/minute par IP
5. **Timeout** : Le webhook répond toujours en < 30 secondes

---

## 🚀 Déploiement

### Checklist Avant Production

1. ✅ Tester le webhook en développement
2. ✅ Configurer `WEBHOOK_SECRET` en production
3. ✅ Vérifier l'URL du webhook dans le backend
4. ✅ Tester avec le script `test_webhook_complete.py`
5. ✅ Activer le monitoring des logs
6. ✅ Configurer les alertes d'erreur

### Surveillance Post-Déploiement

- **Latence** : Temps de traitement moyen < 1 seconde
- **Erreurs** : Taux d'erreur < 1%
- **Idempotence** : Nombre de webhooks dupliqués détectés
- **Succès** : Taux de création de livres réussie > 99%

---

## 📚 Références

- [Documentation CrewAI Webhook](./docs-webhooks/WEBHOOK_GUIDE.md)
- [Exemple Next.js](./docs-webhooks/NEXTJS_WEBHOOK_EXAMPLE.md)
- [Architecture Complète](./docs-webhooks/ARCHITECTURE.md)
- [Guide Complet](./docs-webhooks/README_COMPLET.md)

---

## 🔄 Évolutions Futures

### TODO

- [ ] Ajouter le modèle `Notification` au schema Prisma
- [ ] Implémenter l'envoi d'emails de notification
- [ ] Ajouter les push notifications
- [ ] Implémenter un système de retry automatique
- [ ] Ajouter un dashboard de monitoring des webhooks
- [ ] Stocker l'historique des webhooks reçus
- [ ] Implémenter la signature HMAC-SHA256 (optionnel)
- [ ] Ajouter des webhooks pour les événements de progression

---

**Dernière mise à jour :** 2025-01-20  
**Version :** 2.0.0  
**Conforme à :** Documentation CrewAI v2025.01
