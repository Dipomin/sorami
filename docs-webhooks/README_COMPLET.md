# 📚 Système de Génération de Livres avec Webhook - Guide Complet

## 🎯 Nouveautés

### ✅ Livres en Français
- Tous les livres sont maintenant générés **entièrement en français**
- Niveau de langue **très professionnel**
- Ton **humain et accessible**
- Configuration automatique des agents CrewAI

### ✅ Système de Webhook Intelligent
- **Mode développement** : Notification automatique sans authentification
- **Mode production** : Notification sécurisée avec secret
- Le frontend reçoit automatiquement les livres terminés
- Plus besoin de polling constant !

---

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
pip install crewai[tools]>=0.152.0
crewai install

# Ou avec le requirements.txt
pip install -r requirements.txt
```

### 2. Configuration

Créez un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Configurez vos clés API :

```bash
# Clés API requises
OPENAI_API_KEY=sk-votre-clé-openai
SERPER_API_KEY=votre-clé-serper

# Configuration webhook (développement par défaut)
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3000/api/webhooks/book-completion

# En production, décommentez :
# ENVIRONMENT=production
# WEBHOOK_URL=https://votre-domaine.com/api/webhooks/book-completion
# WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

### 3. Démarrer l'API

```bash
python real_crewai_api.py
```

L'API sera accessible sur : `http://localhost:9006`

---

## 🌍 Configuration par Environnement

### Mode Développement (par défaut)

```bash
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3000/api/webhooks/book-completion
```

**Webhook envoyé :**
```bash
curl -X POST http://localhost:3000/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -d '{"job_id": "...", "book_data": {...}}'
```

### Mode Production

```bash
ENVIRONMENT=production
WEBHOOK_URL=https://votre-domaine.com/api/webhooks/book-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025
```

**Webhook envoyé :**
```bash
curl -X POST https://votre-domaine.com/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{"job_id": "...", "book_data": {...}}'
```

---

## 📡 API Endpoints

### Création de Livre

```bash
POST /api/books/create
Content-Type: application/json

{
  "title": "Mon Livre en Français",
  "topic": "Intelligence Artificielle",
  "goal": "Créer un guide complet sur l'IA en 2025"
}
```

**Réponse :**
```json
{
  "job_id": "abc-123-def",
  "status": "pending",
  "message": "Génération de livre démarrée",
  "created_at": "2025-10-20T14:30:00Z"
}
```

### Vérifier le Statut

```bash
GET /api/books/status/{job_id}
```

**Réponse :**
```json
{
  "status": "writing_chapters",
  "message": "Rédaction des chapitres...",
  "progress": 60,
  "updated_at": "2025-10-20T14:35:00Z"
}
```

### Récupérer le Résultat

```bash
GET /api/books/result/{job_id}
```

**Réponse :**
```json
{
  "book_title": "Mon Livre en Français",
  "topic": "Intelligence Artificielle",
  "chapters": [...],
  "word_count": 15000,
  "chapter_count": 5
}
```

### Configuration Webhook

```bash
# Voir la configuration
GET /api/webhook/config

# Modifier la configuration
POST /api/webhook/config
Content-Type: application/json

{
  "enabled": true,
  "url": "http://localhost:3000/api/webhooks/book-completion",
  "environment": "development"
}

# Tester le webhook
POST /api/webhook/test
```

---

## 🧪 Tests

### Test Complet du Système

```bash
python test_webhook_complete.py
```

Ce script teste :
- ✅ Santé du backend
- ✅ Configuration du webhook
- ✅ Endpoint frontend
- ✅ Envoi de webhook
- ✅ Traitement des données

### Test Manuel

```bash
# 1. Tester la santé de l'API
curl http://localhost:9006/health

# 2. Tester la configuration webhook
curl http://localhost:9006/api/webhook/config

# 3. Envoyer un webhook de test
curl -X POST http://localhost:9006/api/webhook/test

# 4. Créer un livre
curl -X POST http://localhost:9006/api/books/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test de Génération",
    "topic": "Intelligence Artificielle",
    "goal": "Créer un guide complet"
  }'
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `WEBHOOK_GUIDE.md` | Guide complet du système de webhook |
| `NEXTJS_WEBHOOK_EXAMPLE.md` | Exemple d'implémentation Next.js |
| `API_DOCS.md` | Documentation complète de l'API |
| `.env.example` | Exemple de configuration |

---

## 🔧 Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──POST→ │  Backend    │ ──AI──→ │   CrewAI    │
│  (Next.js)  │ ←─200─  │   (Flask)   │ ←─────  │   Agents    │
└─────────────┘         └─────────────┘         └─────────────┘
       ↑                       │
       │                       │ Webhook
       │                       ↓
       └───────────────────────┘
        (Notification automatique)
```

### Flux de Génération

1. **Frontend** → Envoie une requête de création de livre
2. **Backend** → Retourne un `job_id` immédiatement
3. **CrewAI** → Génère le livre (outline → chapitres → finalisation)
4. **Backend** → Envoie un webhook au frontend avec le livre complet
5. **Frontend** → Reçoit et traite le livre automatiquement

---

## 🌟 Caractéristiques Principales

### Livres en Français de Qualité

- ✅ Rédaction 100% en français
- ✅ Niveau professionnel très élevé
- ✅ Ton humain et engageant
- ✅ Exemples concrets et anecdotes
- ✅ Structure cohérente et logique
- ✅ Environ 3 000 mots par chapitre

### Système de Webhook Robuste

- ✅ Mode développement sans authentification
- ✅ Mode production avec secret sécurisé
- ✅ Timeout de 30 secondes
- ✅ Gestion d'erreurs complète
- ✅ Logs détaillés
- ✅ Configuration dynamique

### CrewAI Flow-Based

- ✅ Génération asynchrone
- ✅ Chapitres écrits en parallèle
- ✅ Recherche web automatique
- ✅ Structure Pydantic validée
- ✅ Progression en temps réel

---

## 🔒 Sécurité

### Développement
- Pas d'authentification (facilite les tests)
- Logs verbeux pour le débogage
- URL localhost uniquement

### Production
- En-tête `X-Webhook-Secret` obligatoire
- HTTPS obligatoire
- Validation des données
- Rate limiting recommandé

---

## 🆘 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les clés API
echo $OPENAI_API_KEY
echo $SERPER_API_KEY

# Vérifier l'installation
pip install crewai[tools]>=0.152.0
crewai install
```

### Le webhook n'est pas reçu

```bash
# Vérifier que le frontend est lancé
curl http://localhost:3000/api/webhooks/book-completion

# Tester le webhook
python test_webhook_complete.py

# Vérifier les logs du backend
# Rechercher: "📡 Envoi du webhook"
```

### Le livre n'est pas en français

```bash
# Vérifier les fichiers de configuration
cat src/write_a_book_with_flows/crews/*/config/*.yaml

# Les agents doivent avoir des instructions en français
# Les tâches doivent spécifier "DOIT être rédigé en français"
```

---

## 📊 Statuts des Jobs

| Statut | Description |
|--------|-------------|
| `pending` | Job créé, en attente de traitement |
| `generating_outline` | Création du plan du livre |
| `writing_chapters` | Rédaction des chapitres |
| `finalizing` | Finalisation du livre |
| `completed` | Livre terminé ✅ (webhook envoyé) |
| `failed` | Erreur pendant la génération ❌ |

---

## 🎓 Ressources

- [Documentation CrewAI](https://docs.crewai.com)
- [Guide du Webhook](WEBHOOK_GUIDE.md)
- [Exemple Next.js](NEXTJS_WEBHOOK_EXAMPLE.md)
- [API Docs](API_DOCS.md)

---

## 🤝 Contribution

Pour contribuer :

1. Testez toujours avec `test_webhook_complete.py`
2. Vérifiez que les livres sont bien en français
3. Documentez vos modifications
4. Suivez les conventions de code

---

## 📝 Notes

- **Port par défaut** : 9006
- **Timeout webhook** : 30 secondes
- **Mots par chapitre** : ~3 000
- **Format de sortie** : Markdown
- **Langue** : Français 🇫🇷

---

**Version :** 2.0  
**Dernière mise à jour :** 20 octobre 2025  
**Auteur :** Équipe Sorami

---

## 📞 Support

Pour toute question :
1. Consultez la documentation
2. Vérifiez les logs
3. Utilisez les scripts de test
4. Créez une issue sur GitHub
