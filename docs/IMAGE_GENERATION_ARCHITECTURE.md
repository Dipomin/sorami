# 🏗️ Architecture de la Génération d'Images IA

## Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              /generate-images/page.tsx                   │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  useImageGeneration() hook                         │  │   │
│  │  │  • State management                                │  │   │
│  │  │  • Polling logic                                   │  │   │
│  │  │  • Error handling                                  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ ImageForm    │  │ ImageProgress│  │ ImageResults │  │   │
│  │  │ Component    │  │ Component    │  │ Component    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              lib/api-client.ts                           │   │
│  │  • createImageGeneration()                               │   │
│  │  • fetchImageStatus()                                    │   │
│  │  • fetchImageResult()                                    │   │
│  │  • pollImageGenerationStatus()                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTP (REST)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend (CrewAI - Python)                       │
│                    http://localhost:9006                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         API Endpoints                                    │   │
│  │  POST   /api/images/generate                             │   │
│  │  GET    /api/images/status/{job_id}                      │   │
│  │  GET    /api/images/result/{job_id}                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Job Processing System                            │   │
│  │  • Job queue management                                  │   │
│  │  • Status tracking (PENDING → COMPLETED)                │   │
│  │  • Error handling                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Google Gemini 2.0 Flash API                      │   │
│  │  • Image generation                                      │   │
│  │  • Multimodal processing                                 │   │
│  │  • Style transformation                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         File Storage                                     │   │
│  │  ./generated_images/{job_id}/                            │   │
│  │    ├── image_1.png                                       │   │
│  │    ├── image_2.png                                       │   │
│  │    └── ...                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de données

### 1. Création d'une génération

```
User Input
    │
    ├─ prompt: "Un chat astronaute"
    ├─ num_images: 1
    ├─ size: "1024x1024"
    ├─ style: "photorealistic"
    └─ quality: "high"
    │
    ▼
ImageGenerationForm
    │ handleSubmit()
    ▼
useImageGeneration hook
    │ generateImage()
    ▼
api-client.ts
    │ createImageGeneration()
    ▼
Backend API
    │ POST /api/images/generate
    ▼
Response
    │ job_id: "img_abc123"
    │ status: "PENDING"
    └─ message: "Tâche créée"
```

### 2. Polling du statut

```
useImageGeneration hook
    │ pollImageGenerationStatus()
    ▼
┌───────────────────────────┐
│  Loop (max 30 attempts)   │
│                           │
│  api-client.ts            │
│  │ fetchImageStatus()     │
│  ▼                        │
│  Backend API              │
│  │ GET /status/{job_id}   │
│  ▼                        │
│  Response                 │
│  │ status: "GENERATING"   │
│  │ progress: 50           │
│  ▼                        │
│  ┌─────────────────┐     │
│  │ Status check    │     │
│  │ COMPLETED?      │────┐│
│  │ FAILED?         │    ││
│  └─────────────────┘    ││
│          │              ││
│          │ Wait 2s      ││
│          └──────────────┘│
└───────────────────────────┘
          │
          ▼ (when COMPLETED)
    fetchImageResult()
```

### 3. Affichage des résultats

```
ImageResultResponse
    │
    ├─ job_id: "img_abc123"
    ├─ status: "COMPLETED"
    ├─ images: [
    │    {
    │      url: "http://.../.../image_1.png",
    │      format: "PNG",
    │      dimensions: "1024x1024",
    │      size_bytes: 2048576
    │    }
    │  ]
    └─ metadata: {
         model_name: "gemini-2.0-flash-exp",
         generation_time_seconds: 12.5,
         input_tokens: 45
       }
    │
    ▼
ImageResults Component
    │
    ├─ Display metadata
    ├─ Grid layout of images
    ├─ Download buttons
    └─ Technical info
```

## États de génération

```
┌──────────┐
│ PENDING  │ En attente de démarrage
└────┬─────┘
     │
     ▼
┌──────────────┐
│ INITIALIZING │ Initialisation du modèle Gemini
└──────┬───────┘
       │
       ▼
┌────────────┐
│ GENERATING │ Génération de l'image en cours
└──────┬─────┘
       │
       ▼
┌─────────┐
│ SAVING  │ Sauvegarde des fichiers
└────┬────┘
     │
     ├─────────────┐
     ▼             ▼
┌───────────┐ ┌────────┐
│ COMPLETED │ │ FAILED │
└───────────┘ └────────┘
```

## Structure des composants

```
page.tsx (Main Container)
├─ Header
│  ├─ Navigation (Back to Dashboard)
│  ├─ Title & Description
│  └─ Reset Button
│
└─ Grid Layout (2 columns)
   │
   ├─ Left Column
   │  ├─ ImageGenerationForm
   │  │  ├─ Prompt Input (Required)
   │  │  ├─ Image URL Input (Optional)
   │  │  │  └─ Image Preview
   │  │  ├─ Advanced Options
   │  │  │  ├─ Number of Images (1-4)
   │  │  │  ├─ Size Selector
   │  │  │  ├─ Style Selector
   │  │  │  ├─ Quality Selector
   │  │  │  └─ Format Selector
   │  │  └─ Submit Button
   │  │
   │  └─ Tips & Examples (when idle)
   │
   └─ Right Column
      ├─ Error Display (if error)
      ├─ ImageProgress (when generating)
      │  ├─ Status Icon
      │  ├─ Status Message
      │  ├─ Progress Bar
      │  └─ Job ID
      │
      ├─ ImageResults (when completed)
      │  ├─ Metadata Panel
      │  │  ├─ Model Info
      │  │  ├─ Generation Time
      │  │  ├─ Tokens Used
      │  │  └─ Total Size
      │  │
      │  └─ Images Grid
      │     └─ For each image:
      │        ├─ Image Display
      │        ├─ Download Button (on hover)
      │        └─ Technical Info
      │
      └─ Placeholder (initial state)
```

## Types de données

### ImageGenerationRequest
```typescript
{
  prompt: string,              // ✅ Required
  input_image_url?: string,    // ⭕ Optional
  num_images?: 1-4,            // Default: 1
  size?: "1024x1024",          // Default: "1024x1024"
  format?: "PNG",              // Default: "PNG"
  style?: "photorealistic",    // Default: "photorealistic"
  quality?: "high"             // Default: "high"
}
```

### ImageStatusResponse
```typescript
{
  job_id: string,
  status: ImageJobStatus,
  message: string,
  progress?: number,           // 0-100
  created_at?: string,
  updated_at?: string
}
```

### ImageResultResponse
```typescript
{
  job_id: string,
  status: "COMPLETED" | "FAILED",
  message: string,
  images?: GeneratedImage[],
  metadata?: {
    model_name: string,
    version: string,
    generation_time_seconds: number,
    input_tokens: number,
    output_size_bytes: number,
    timestamp: string
  },
  errors?: string[]
}
```

## Sécurité et validation

### Frontend
```
User Input
    │
    ▼
┌─────────────────────────┐
│ Form Validation         │
│ • Required fields       │
│ • URL format check      │
│ • Value ranges (1-4)    │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Clerk Authentication    │
│ • Protected route       │
│ • Valid user session    │
└─────────────────────────┘
    │
    ▼
API Request
```

### Backend
```
API Request
    │
    ▼
┌─────────────────────────┐
│ Input Validation        │
│ • Prompt not empty      │
│ • num_images in 1-4     │
│ • Valid dimensions      │
│ • Valid format/style    │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Google API Key Check    │
│ • Key configured        │
│ • Key valid             │
└─────────────────────────┘
    │
    ▼
Image Generation
```

## Performance

### Optimisations
- **Polling interval** : 2 secondes (balance entre réactivité et charge serveur)
- **Timeout** : 60 secondes (30 tentatives × 2s)
- **Lazy loading** : Images chargées progressivement
- **State management** : Pas de re-render inutile
- **Error boundaries** : Isolation des erreurs

### Métriques estimées
- **Time to First Byte** : ~100ms
- **Génération 1 image** : ~10-15s
- **Génération 4 images** : ~25-30s
- **Download time** : Dépend de la taille (1-5MB)

---

**Légende**
```
┌─┐  Containers / Modules
│  │  
└─┘  

─▶   Data flow
│    Sequential steps
▼    

┌──┐ Decision / Branch
│  │
└──┘
```
