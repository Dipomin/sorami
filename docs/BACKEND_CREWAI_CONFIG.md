# 🔧 Configuration Backend CrewAI

## Problème Identifié

Le backend CrewAI envoie les webhooks sur le mauvais port et le job n'existe pas en base de données.

### Logs d'Erreur

```
Backend: INFO:__main__:📡 Envoi du webhook pour le job 3e25b048-e00e-4890-9219-4a50092b3f38 vers http://localhost:3000/api/webhooks/book-completion
Frontend: ❌ Job non trouvé { jobId: '3e25b048-e00e-4890-9219-4a50092b3f38' }
Backend: WARNING:__main__:⚠️ Webhook retourné le status code 404
```

---

## ✅ Solutions Implémentées

### 1. Webhook Crée Automatiquement le Job (Frontend)

Le webhook frontend a été modifié pour **créer automatiquement le job** s'il n'existe pas dans la base de données.

**Comportement :**
- Si le job existe → utilise le job existant
- Si le job n'existe pas → crée un nouveau job avec `BOOK_GENERATION` et `RUNNING` status
- Utilise le `user_id` du payload ou le premier utilisateur trouvé

**Code ajouté :**
```typescript
if (!existingJob) {
  console.log('⚠️ Job non trouvé, création automatique');
  
  const newJob = await prisma.bookJob.create({
    data: {
      id: payload.job_id,
      userId: userId,
      jobType: 'BOOK_GENERATION',
      status: 'RUNNING',
      inputData: {
        title: payload.book_data.book_title,
        topic: payload.book_data.topic,
        goal: payload.book_data.goal,
      }
    }
  });
  
  existingJob = newJob;
}
```

### 2. Configuration Backend Requise

Le backend CrewAI doit utiliser le **bon port** et envoyer le `user_id` dans le payload.

---

## 🔧 Configuration Backend CrewAI

### Fichier `.env` (Backend)

```bash
# Webhook Configuration
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3001/api/webhooks/book-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

⚠️ **Attention** : Le port est **3001** (pas 3000) car le port 3000 est déjà utilisé.

### Payload à Envoyer

Le backend doit envoyer ce payload conforme au webhook :

```json
{
  "job_id": "3e25b048-e00e-4890-9219-4a50092b3f38",
  "status": "completed",
  "timestamp": "2025-10-20T10:23:34.861Z",
  "environment": "development",
  "user_id": "user_clerkid_123",  // ⬅️ IMPORTANT: Ajouter le user_id
  "book_data": {
    "book_title": "150 techniques pour réussir son entretien d'embauche",
    "topic": "Entretien d'embauche",
    "goal": "Aider les candidats à réussir leurs entretiens",
    "outline": [
      {
        "title": "Chapitre 1",
        "description": "Préparation"
      }
    ],
    "chapters": [
      {
        "title": "Chapitre 1: Préparation",
        "content": "# Chapitre 1\n\nContenu...",
        "description": "Comment se préparer"
      }
    ],
    "generated_at": "2025-10-20T10:23:34.861Z",
    "word_count": 15000,
    "chapter_count": 10
  }
}
```

---

## 📝 Modifications Backend Nécessaires

### Option A : Envoyer le user_id (Recommandé)

Modifier le code backend pour inclure le `user_id` dans le payload :

```python
# Dans le backend CrewAI (Python)
webhook_payload = {
    "job_id": job_id,
    "status": "completed",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "environment": os.getenv("ENVIRONMENT", "development"),
    "user_id": user_id,  # ⬅️ AJOUTER CETTE LIGNE
    "book_data": {
        "book_title": result["book_title"],
        "topic": result["topic"],
        "goal": result["goal"],
        # ... rest of the data
    }
}
```

### Option B : Le Frontend Utilise le Premier User (Implémenté)

Si le `user_id` n'est pas fourni, le frontend utilise automatiquement le **premier utilisateur** trouvé en base de données.

⚠️ **Limitation** : Tous les livres seront attribués au même utilisateur si le `user_id` n'est pas fourni.

---

## 🧪 Test

### 1. Vérifier qu'un Utilisateur Existe

```bash
npx prisma studio
# Aller dans User table et vérifier qu'il y a au moins 1 utilisateur
```

### 2. Tester le Webhook

```bash
curl -X POST http://localhost:3001/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-auto-create-'$(date +%s)'",
    "status": "completed",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "environment": "development",
    "book_data": {
      "book_title": "Test Auto-Create Job",
      "topic": "Test",
      "goal": "Vérifier création auto",
      "outline": [],
      "chapters": [
        {
          "title": "Chapitre 1",
          "content": "# Chapitre 1\n\nTest",
          "description": "Test"
        }
      ],
      "generated_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "word_count": 100,
      "chapter_count": 1
    }
  }'
```

**Résultat Attendu :**
```
✅ Job créé automatiquement { jobId: 'test-auto-create-...', userId: 'user_...' }
📖 Traitement du livre: Test Auto-Create Job
✅ Livre créé avec succès
```

### 3. Relancer le Backend CrewAI

Après avoir mis à jour la configuration backend :

```bash
# Dans le dossier backend CrewAI
python real_crewai_api.py
```

---

## 📊 Logs Attendus (Succès)

### Frontend
```
📬 Webhook reçu du backend { origin: 'http://localhost:9006', environment: 'development' }
🔓 Mode développement - pas de vérification du secret
📚 Traitement du webhook { job_id: '3e25...', status: 'completed', hasBookData: true, hasUserId: true }
⚠️ Job non trouvé, création automatique { jobId: '3e25...' }
✅ Job créé automatiquement { jobId: '3e25...', userId: 'user_abc' }
📖 Traitement du livre: 150 techniques pour réussir son entretien d'embauche
📚 Création d'un nouveau livre
✅ 10 chapitres créés
✅ Livre créé avec succès { bookId: 'book_xyz', chaptersCreated: 10, wordCount: 15000 }
✅ Webhook traité avec succès { processingTimeMs: 456 }
```

### Backend
```
INFO:__main__:📡 Envoi du webhook pour le job 3e25... vers http://localhost:3001/api/webhooks/book-completion
INFO:__main__:✅ Webhook accepté avec status code 200
```

---

## 🎯 Checklist de Vérification

- [ ] Backend envoie sur **http://localhost:3001** (pas 3000)
- [ ] Backend envoie le `user_id` dans le payload (recommandé)
- [ ] Au moins 1 utilisateur existe dans la base de données
- [ ] Variable `WEBHOOK_URL` configurée dans le backend `.env`
- [ ] Serveur Next.js tourne sur le port 3001
- [ ] Tester avec le script de test

---

## 🚀 Commandes Utiles

```bash
# Vérifier le port du serveur Next.js
lsof -i :3001

# Voir les utilisateurs en BDD
npx prisma studio

# Tester le webhook manuellement
./scripts/test-webhook.sh development

# Redémarrer le frontend
npm run dev

# Vérifier les logs en temps réel
# (dans le terminal où tourne npm run dev)
```

---

**Date :** 2025-10-20  
**Status :** ✅ Frontend corrigé, Backend à configurer  
**Next Step :** Configurer le backend CrewAI avec le bon port et user_id
