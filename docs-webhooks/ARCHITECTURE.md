# 🏗️ Architecture du Système - Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🌐 FRONTEND (Next.js)                                │
│                       http://localhost:3000                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↕
              ┌────────────────────────────────────────┐
              │  1. POST /api/books/create             │
              │     {title, topic, goal}               │
              │                                        │
              │  2. Response: {job_id, status}        │
              └────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🔧 BACKEND API (Flask)                                 │
│                      http://localhost:9006                                  │
│                                                                             │
│  Endpoints:                                                                 │
│  • POST   /api/books/create        → Créer un livre                       │
│  • GET    /api/books/status/:id    → Statut du job                        │
│  • GET    /api/books/result/:id    → Résultat final                       │
│  • GET    /api/webhook/config      → Config webhook                       │
│  • POST   /api/webhook/config      → Modifier config                      │
│  • POST   /api/webhook/test        → Tester webhook                       │
│  • GET    /health                  → Santé du système                     │
│                                                                             │
│  Job Storage (en mémoire):                                                 │
│  {                                                                          │
│    "job_id": {                                                             │
│      "status": "writing_chapters",                                         │
│      "progress": 60,                                                       │
│      "message": "Rédaction des chapitres...",                             │
│      "result": null                                                        │
│    }                                                                       │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↕
              ┌────────────────────────────────────────┐
              │  3. Lancement de BookFlow              │
              │     → Thread en arrière-plan           │
              └────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🤖 CREWAI FLOW SYSTEM                                    │
│                                                                             │
│  BookFlow (Flow Orchestrator):                                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │  @start                                                      │          │
│  │  generate_book_outline()                                    │          │
│  │    ↓                                                        │          │
│  │    OutlineCrew:                                             │          │
│  │      • Researcher Agent (recherche web)                    │          │
│  │      • Outliner Agent (création du plan)                   │          │
│  │    ↓                                                        │          │
│  │    BookOutline (5-10 chapitres)                            │          │
│  └─────────────────────────────────────────────────────────────┘          │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │  @listen(generate_book_outline)                             │          │
│  │  write_chapters()  [PARALLÈLE]                              │          │
│  │                                                             │          │
│  │    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │          │
│  │    │ Chapter 1   │  │ Chapter 2   │  │ Chapter N   │      │          │
│  │    │             │  │             │  │             │      │          │
│  │    │ WriteBook   │  │ WriteBook   │  │ WriteBook   │      │          │
│  │    │ ChapterCrew │  │ ChapterCrew │  │ ChapterCrew │      │          │
│  │    │             │  │             │  │             │      │          │
│  │    │ • Researcher│  │ • Researcher│  │ • Researcher│      │          │
│  │    │ • Writer    │  │ • Writer    │  │ • Writer    │      │          │
│  │    │             │  │             │  │             │      │          │
│  │    │ ~3000 mots  │  │ ~3000 mots  │  │ ~3000 mots  │      │          │
│  │    │ 🇫🇷 FRANÇAIS│  │ 🇫🇷 FRANÇAIS│  │ 🇫🇷 FRANÇAIS│      │          │
│  │    └─────────────┘  └─────────────┘  └─────────────┘      │          │
│  └─────────────────────────────────────────────────────────────┘          │
│                          ↓                                                  │
│  ┌─────────────────────────────────────────────────────────────┐          │
│  │  @listen(write_chapters)                                    │          │
│  │  join_and_save_chapter()                                    │          │
│  │    ↓                                                        │          │
│  │    Assemblage final du livre                                │          │
│  │    Calcul des statistiques                                  │          │
│  └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
│  Résultat Final:                                                           │
│  {                                                                          │
│    "book_title": "Mon Livre",                                              │
│    "topic": "Sujet",                                                       │
│    "outline": [...],                                                       │
│    "chapters": [                                                           │
│      {                                                                     │
│        "title": "Chapitre 1",                                              │
│        "content": "# Chapitre 1\n\nContenu en français..."               │
│      }                                                                     │
│    ],                                                                      │
│    "word_count": 15000,                                                    │
│    "chapter_count": 5                                                      │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
              ┌────────────────────────────────────────┐
              │  4. Livre terminé !                    │
              │     → Envoi du WEBHOOK                 │
              └────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    📡 SYSTÈME DE WEBHOOK                                    │
│                                                                             │
│  Mode DÉVELOPPEMENT:                                                       │
│  ┌───────────────────────────────────────────────────────────┐            │
│  │  POST http://localhost:3000/api/webhooks/book-completion  │            │
│  │  Content-Type: application/json                            │            │
│  │                                                            │            │
│  │  {                                                         │            │
│  │    "job_id": "abc-123",                                   │            │
│  │    "status": "completed",                                 │            │
│  │    "environment": "development",                          │            │
│  │    "book_data": { ... }                                   │            │
│  │  }                                                         │            │
│  └───────────────────────────────────────────────────────────┘            │
│                                                                             │
│  Mode PRODUCTION:                                                          │
│  ┌───────────────────────────────────────────────────────────┐            │
│  │  POST https://domain.com/api/webhooks/book-completion     │            │
│  │  Content-Type: application/json                            │            │
│  │  X-Webhook-Secret: sorami-webhook-secret-key-2025         │            │
│  │                                                            │            │
│  │  {                                                         │            │
│  │    "job_id": "abc-123",                                   │            │
│  │    "status": "completed",                                 │            │
│  │    "environment": "production",                           │            │
│  │    "book_data": { ... }                                   │            │
│  │  }                                                         │            │
│  └───────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                   📱 FRONTEND WEBHOOK HANDLER                               │
│             app/api/webhooks/book-completion/route.ts                       │
│                                                                             │
│  export async function POST(request: NextRequest) {                        │
│    // 1. Vérifier le secret (production)                                  │
│    if (process.env.NODE_ENV === 'production') {                           │
│      const secret = request.headers.get('X-Webhook-Secret');              │
│      if (secret !== process.env.WEBHOOK_SECRET) {                         │
│        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });│
│      }                                                                     │
│    }                                                                       │
│                                                                             │
│    // 2. Récupérer les données                                            │
│    const { job_id, book_data } = await request.json();                    │
│                                                                             │
│    // 3. Traiter le livre                                                 │
│    await saveBookToDatabase(job_id, book_data);                           │
│    await generateMarkdownFile(book_data);                                 │
│    await notifyUser(job_id);                                              │
│                                                                             │
│    // 4. Confirmer la réception                                           │
│    return NextResponse.json({ success: true });                           │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ✅ LIVRE DISPONIBLE POUR L'UTILISATEUR !
```

---

## 🔄 Flux Temporel Détaillé

```
T+0s    Frontend → POST /api/books/create
        ├─→ Backend crée un job_id
        └─→ Response immédiate : {job_id: "abc-123", status: "pending"}

T+1s    Backend lance BookFlow en arrière-plan
        └─→ Thread séparé pour ne pas bloquer l'API

T+5s    OutlineCrew démarre
        ├─→ Researcher: Recherche web sur le sujet
        └─→ Outliner: Création du plan du livre
        
T+30s   Plan terminé (5 chapitres)
        └─→ Status update: "generating_outline" → "writing_chapters"

T+31s   Écriture parallèle des chapitres
        ├─→ WriteBookChapterCrew 1 → Chapitre 1
        ├─→ WriteBookChapterCrew 2 → Chapitre 2
        ├─→ WriteBookChapterCrew 3 → Chapitre 3
        ├─→ WriteBookChapterCrew 4 → Chapitre 4
        └─→ WriteBookChapterCrew 5 → Chapitre 5
        
        (Tous en parallèle grâce à asyncio.gather)

T+3m    Tous les chapitres terminés
        └─→ Status update: "writing_chapters" → "finalizing"

T+3m10s Assemblage final
        ├─→ Calcul du word_count
        ├─→ Calcul du chapter_count
        └─→ Préparation du résultat

T+3m15s 📡 WEBHOOK ENVOYÉ AU FRONTEND
        └─→ POST http://localhost:3000/api/webhooks/book-completion
            {
              "job_id": "abc-123",
              "status": "completed",
              "book_data": {
                "book_title": "Mon Livre",
                "chapters": [...],
                "word_count": 15000
              }
            }

T+3m16s Frontend reçoit et traite
        ├─→ Sauvegarde en base de données
        ├─→ Génération du fichier Markdown
        └─→ Notification à l'utilisateur

T+3m20s ✅ TERMINÉ !
        └─→ Livre disponible pour l'utilisateur
```

---

## 📊 Statistiques Typiques

| Métrique | Valeur Moyenne |
|----------|----------------|
| Temps de génération (5 chapitres) | 3-5 minutes |
| Mots par chapitre | ~3 000 |
| Mots totaux | 15 000 - 30 000 |
| Nombre de chapitres | 5 - 10 |
| Temps d'envoi webhook | < 1 seconde |
| Timeout webhook | 30 secondes |

---

## 🔧 Configuration des Agents

### OutlineCrew
```yaml
researcher:
  role: Agent de Recherche Expert
  goal: Rassembler des informations complètes
  backstory: Chercheur chevronné, expert en sources fiables

outliner:
  role: Agent Expert en Structuration
  goal: Générer un plan détaillé en français
  backstory: Organisateur d'exception, expert en français
```

### WriteBookChapterCrew
```yaml
researcher:
  role: Agent de Recherche Spécialisé
  goal: Enrichir le contenu du chapitre
  backstory: Expert en recherche approfondie

writer:
  role: Rédacteur Expert en Français
  goal: Rédiger 3000 mots en français professionnel
  backstory: Rédacteur d'exception, maîtrise parfaite du français
  
  EXIGENCES:
  - 100% en français
  - Niveau très professionnel
  - Ton humain et accessible
  - Exemples concrets
  - Questions rhétoriques
```

---

## 🌍 Variables d'Environnement

```bash
# === DÉVELOPPEMENT ===
ENVIRONMENT=development
WEBHOOK_URL=http://localhost:3000/api/webhooks/book-completion
WEBHOOK_SECRET=  # Vide (pas de secret)

# === PRODUCTION ===
ENVIRONMENT=production
WEBHOOK_URL=https://votre-domaine.com/api/webhooks/book-completion
WEBHOOK_SECRET=sorami-webhook-secret-key-2025

# === CLÉS API ===
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...
```

---

## 🎯 Points Clés

1. **Génération Asynchrone** : Le frontend reçoit immédiatement un job_id
2. **Chapitres en Parallèle** : Réduction massive du temps de génération
3. **Webhook Automatique** : Plus besoin de polling
4. **Français Garanti** : Configuration des agents pour le français
5. **Sécurité Production** : Secret obligatoire en production

---

## 📚 Fichiers Principaux

```
back/
├── real_crewai_api.py              ← API Flask principale
├── src/write_a_book_with_flows/
│   ├── main.py                     ← BookFlow orchestrator
│   ├── api_models.py               ← Modèles Pydantic
│   └── crews/
│       ├── outline_book_crew/      ← Génération du plan
│       │   ├── outline_crew.py
│       │   └── config/
│       │       ├── agents.yaml     ← Agents en français
│       │       └── tasks.yaml      ← Tâches en français
│       └── write_book_chapter_crew/ ← Rédaction chapitres
│           ├── write_book_chapter_crew.py
│           └── config/
│               ├── agents.yaml     ← Agents en français
│               └── tasks.yaml      ← Tâches en français
├── test_webhook_complete.py        ← Tests automatisés
├── WEBHOOK_GUIDE.md               ← Documentation webhook
├── NEXTJS_WEBHOOK_EXAMPLE.md      ← Code Next.js
├── README_COMPLET.md              ← Guide complet
├── QUICK_START.md                 ← Démarrage rapide
└── CHANGEMENTS.md                 ← Ce fichier
```

---

**Version :** 2.0  
**Dernière mise à jour :** 20 octobre 2025  
**Architecture :** Flask + CrewAI + Webhook System
