# 🔧 Correctifs - Gestion Backend Indisponible

## ❌ Problème Initial

**Erreur** : `ECONNREFUSED` lors des appels API vers le backend CrewAI

```
TypeError: fetch failed
[cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
```

**Cause** : Le backend CrewAI (Python) n'est pas démarré sur `http://localhost:9006`

---

## ✅ Solutions Implémentées

### 1. **Route `/api/blog/generate`** - Génération d'article

**Changements** :
- ✅ Création du job **avant** l'appel au backend
- ✅ Timeout de 10 secondes sur le fetch
- ✅ Fallback gracieux si backend indisponible
- ✅ Message d'avertissement à l'utilisateur

**Comportement** :
- Si backend **disponible** → Job normal avec `externalJobId`
- Si backend **indisponible** → Job créé en local avec message d'avertissement

```typescript
// Avant : Crash si backend indisponible
const response = await fetch(`${CREWAI_API_URL}/api/blog/generate`);

// Après : Gestion gracieuse
try {
  const response = await fetch(`${CREWAI_API_URL}/api/blog/generate`, {
    signal: AbortSignal.timeout(10000),
  });
  // ... traitement normal
} catch (fetchError) {
  // Fallback : job créé localement avec avertissement
  return NextResponse.json({
    warning: 'Backend non disponible',
    job_id: blogJob.id,
  });
}
```

---

### 2. **Route `/api/blog/jobs/[jobId]/status`** - Statut du job

**Changements** :
- ✅ Récupération du job depuis la DB **en premier**
- ✅ Timeout de 5 secondes sur le fetch
- ✅ Fallback sur les données locales si backend indisponible
- ✅ Retour des données de la DB si backend inaccessible

**Comportement** :
- Vérifier d'abord si le job existe en DB
- Tenter de récupérer le statut du backend
- Si échec → Retourner les données de la DB locale

```typescript
// Avant : Crash immédiat si backend indisponible
const response = await fetch(`${CREWAI_API_URL}/api/blog/status/${jobId}`);

// Après : Fallback sur données locales
const blogJob = await prisma.blogJob.findFirst({ where: { externalJobId: jobId } });

try {
  const response = await fetch(`${CREWAI_API_URL}/api/blog/status/${jobId}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.ok) {
    // Mise à jour du job local
  }
} catch (fetchError) {
  // Retourner les données locales
  return NextResponse.json({
    job_id: blogJob.externalJobId || blogJob.id,
    status: blogJob.status.toLowerCase(),
    progress: blogJob.progress,
    // ... autres champs de la DB
  });
}
```

---

### 3. **Route `/api/blog/jobs/[jobId]/result`** - Résultat du job

**Changements** :
- ✅ Récupération du job + article associé depuis la DB
- ✅ Si job `COMPLETED` avec article → Retour immédiat
- ✅ Timeout de 5 secondes sur le fetch backend
- ✅ Fallback sur `blogJob.result` si backend indisponible

**Comportement** :
- Si job terminé avec article en DB → Retour immédiat sans appel backend
- Sinon, tenter de récupérer depuis le backend
- Si échec → Vérifier `blogJob.result` ou retourner erreur appropriée

```typescript
// Avant : Appel systématique au backend
const response = await fetch(`${CREWAI_API_URL}/api/blog/result/${jobId}`);

// Après : Priorité aux données locales
const blogJob = await prisma.blogJob.findFirst({
  where: { externalJobId: jobId },
  include: { blogArticle: true },
});

if (blogJob.status === 'COMPLETED' && blogJob.blogArticle) {
  // Retour immédiat depuis la DB
  return NextResponse.json({
    success: true,
    blog_article: { /* données depuis DB */ },
  });
}

// Sinon, tenter le backend avec fallback
```

---

## 📊 Avantages de la Solution

### 🎯 **Résilience**
- Application fonctionne même si backend Python est arrêté
- Pas de crash avec `ECONNREFUSED`
- Messages d'erreur clairs pour l'utilisateur

### ⚡ **Performance**
- Timeouts courts (5-10 secondes) pour ne pas bloquer
- Utilisation prioritaire des données locales quand disponibles
- Moins d'appels réseau inutiles

### 🔄 **Compatibilité**
- Fonctionne en mode **standalone** (sans backend)
- Fonctionne en mode **connecté** (avec backend)
- Transition transparente entre les deux modes

### 🧪 **Testabilité**
- Peut tester le frontend sans backend
- Peut créer des jobs de test manuellement
- Peut simuler des webhooks

---

## 🎓 Flux Amélioré

### Scénario 1 : Backend disponible (Production)

```
User → Frontend → Backend CrewAI → Génération → Webhook → DB → User
          ↓           ↓                             ↓
       Job créé   Job externe                  Article créé
```

### Scénario 2 : Backend indisponible (Dev/Test)

```
User → Frontend → ⚠️ Backend KO → Fallback DB → User
          ↓                           ↓
       Job créé                  Données locales
                                 (avec avertissement)
```

### Scénario 3 : Webhook manuel (Simulation)

```
Test Script → Webhook → DB → Article créé
                         ↓
                    Bypass backend
```

---

## 🧪 Comment Tester

### Test 1 : Sans backend (Mode standalone)

```bash
# Backend Python arrêté
npm run dev

# Créer un article
open http://localhost:3001/blog/create

# Résultat attendu :
# ✅ Job créé avec avertissement
# ✅ Message : "Backend non disponible"
# ✅ Pas de crash
```

### Test 2 : Avec backend (Mode production)

```bash
# Démarrer le backend Python
cd ../backend
python main.py

# Démarrer le frontend
npm run dev

# Créer un article
open http://localhost:3001/blog/create

# Résultat attendu :
# ✅ Job créé avec external_id
# ✅ Polling fonctionne
# ✅ Webhook reçu
# ✅ Article créé
```

### Test 3 : Webhook manuel (Simulation)

```bash
# Simuler un webhook de complétion
./test-blog-webhook.sh

# Résultat attendu :
# ✅ Article créé en DB
# ✅ Visible dans /blog
```

---

## 📝 Messages Utilisateur

### Backend disponible
```
✅ "Article en cours de génération..."
⏳ "Étape 1 : Recherche et analyse"
✍️ "Étape 2 : Rédaction du contenu"
✅ "Article généré avec succès !"
```

### Backend indisponible
```
⚠️ "Job créé localement. Backend CrewAI non disponible."
ℹ️ "Le backend de génération n'est pas accessible."
💡 "L'article sera généré dès que le service sera disponible."
```

---

## 🔧 Configuration

### Variables d'environnement

```env
# .env.local
CREWAI_API_URL=http://localhost:9006  # Backend Python
WEBHOOK_SECRET=your-secret-key
```

### Timeouts configurés

- **Génération** : 10 secondes
- **Statut** : 5 secondes
- **Résultat** : 5 secondes

---

## ✅ Résultat Final

- ✅ Plus d'erreurs `ECONNREFUSED`
- ✅ Application utilisable sans backend
- ✅ Fallback gracieux sur données locales
- ✅ Messages d'avertissement clairs
- ✅ Compatibilité backend optionnelle
- ✅ Tests possibles en standalone

---

**Date** : 20 octobre 2025  
**Status** : ✅ Corrigé et testé  
**Impact** : Application résiliente et testable
