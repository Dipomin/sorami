# Exemple d'Implémentation du Webhook pour Next.js

Ce document fournit un exemple complet d'implémentation du endpoint webhook côté frontend.

## 📁 Structure des Fichiers

```
app/
├── api/
│   └── webhooks/
│       └── book-completion/
│           └── route.ts         ← Endpoint webhook
└── lib/
    └── webhook-handler.ts       ← Logique de traitement
```

---

## 📝 Implémentation Complète

### 1. Endpoint Webhook (`app/api/webhooks/book-completion/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Type pour les données du livre reçues
interface BookData {
  book_title: string;
  topic: string;
  goal: string;
  outline: Array<{
    title: string;
    description: string;
  }>;
  chapters: Array<{
    title: string;
    content: string;
  }>;
  generated_at: string;
  word_count: number;
  chapter_count: number;
}

interface WebhookPayload {
  job_id: string;
  status: string;
  timestamp: string;
  environment: 'development' | 'production';
  book_data: BookData;
}

// POST /api/webhooks/book-completion
export async function POST(request: NextRequest) {
  console.log('📬 Webhook reçu du backend');

  try {
    // 1. Vérification du secret en production
    if (process.env.NODE_ENV === 'production') {
      const webhookSecret = request.headers.get('X-Webhook-Secret');
      const expectedSecret = process.env.WEBHOOK_SECRET || 'sorami-webhook-secret-key-2025';

      if (webhookSecret !== expectedSecret) {
        console.error('❌ Secret webhook invalide');
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid webhook secret' },
          { status: 401 }
        );
      }

      console.log('✅ Secret webhook validé');
    } else {
      console.log('🔓 Mode développement - pas de vérification du secret');
    }

    // 2. Récupération des données
    const payload: WebhookPayload = await request.json();

    console.log('📚 Livre reçu:', {
      job_id: payload.job_id,
      title: payload.book_data.book_title,
      chapters: payload.book_data.chapter_count,
      words: payload.book_data.word_count,
    });

    // 3. Validation des données
    if (!payload.job_id || !payload.book_data) {
      console.error('❌ Données invalides dans le webhook');
      return NextResponse.json(
        { error: 'Invalid payload', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 4. Traitement des données du livre
    // TODO: Remplacer par votre logique métier
    
    // Exemple 1: Sauvegarder dans une base de données
    // await saveBookToDatabase(payload.book_data, payload.job_id);
    
    // Exemple 2: Envoyer une notification
    // await sendNotification(payload.job_id, payload.book_data.book_title);
    
    // Exemple 3: Déclencher un événement
    // await eventEmitter.emit('book:completed', payload);
    
    // Exemple 4: Mettre en cache
    // await redis.set(`book:${payload.job_id}`, JSON.stringify(payload.book_data));

    console.log('✅ Webhook traité avec succès');

    // 5. Réponse de succès
    return NextResponse.json({
      success: true,
      message: 'Webhook reçu et traité avec succès',
      job_id: payload.job_id,
      processed_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  );
}
```

---

### 2. Handler de Webhook (`lib/webhook-handler.ts`)

```typescript
import { db } from './db'; // Votre connexion à la base de données
import { sendEmail } from './email'; // Service d'envoi d'emails

interface BookData {
  book_title: string;
  topic: string;
  goal: string;
  outline: Array<{ title: string; description: string }>;
  chapters: Array<{ title: string; content: string }>;
  generated_at: string;
  word_count: number;
  chapter_count: number;
}

/**
 * Traite les données du livre reçues via webhook
 */
export async function handleBookCompletion(
  jobId: string,
  bookData: BookData
): Promise<void> {
  console.log(`📖 Traitement du livre: ${bookData.book_title}`);

  try {
    // 1. Sauvegarder le livre dans la base de données
    const savedBook = await saveBookToDatabase(jobId, bookData);
    console.log(`✅ Livre sauvegardé avec l'ID: ${savedBook.id}`);

    // 2. Générer le fichier Markdown
    const markdownContent = generateMarkdownFile(bookData);
    await saveMarkdownFile(savedBook.id, markdownContent);
    console.log(`✅ Fichier Markdown généré`);

    // 3. Envoyer une notification par email
    await notifyUserByEmail(jobId, bookData);
    console.log(`✅ Notification envoyée`);

    // 4. Mettre à jour le statut du job
    await updateJobStatus(jobId, 'completed', savedBook.id);
    console.log(`✅ Statut du job mis à jour`);

  } catch (error) {
    console.error(`❌ Erreur lors du traitement du livre:`, error);
    await updateJobStatus(jobId, 'failed', null, error);
    throw error;
  }
}

/**
 * Sauvegarde le livre dans la base de données
 */
async function saveBookToDatabase(
  jobId: string,
  bookData: BookData
): Promise<{ id: string }> {
  const book = await db.book.create({
    data: {
      jobId: jobId,
      title: bookData.book_title,
      topic: bookData.topic,
      goal: bookData.goal,
      wordCount: bookData.word_count,
      chapterCount: bookData.chapter_count,
      generatedAt: new Date(bookData.generated_at),
      outline: JSON.stringify(bookData.outline),
      chapters: JSON.stringify(bookData.chapters),
      status: 'completed',
    },
  });

  return { id: book.id };
}

/**
 * Génère un fichier Markdown à partir des données du livre
 */
function generateMarkdownFile(bookData: BookData): string {
  let markdown = `# ${bookData.book_title}\n\n`;
  markdown += `**Sujet:** ${bookData.topic}\n\n`;
  markdown += `**Objectif:** ${bookData.goal}\n\n`;
  markdown += `**Généré le:** ${new Date(bookData.generated_at).toLocaleDateString('fr-FR')}\n\n`;
  markdown += `**Nombre de mots:** ${bookData.word_count.toLocaleString('fr-FR')}\n\n`;
  markdown += `**Nombre de chapitres:** ${bookData.chapter_count}\n\n`;
  markdown += `---\n\n`;

  // Table des matières
  markdown += `## Table des Matières\n\n`;
  bookData.chapters.forEach((chapter, index) => {
    markdown += `${index + 1}. [${chapter.title}](#chapitre-${index + 1})\n`;
  });
  markdown += `\n---\n\n`;

  // Chapitres
  bookData.chapters.forEach((chapter, index) => {
    markdown += `<a id="chapitre-${index + 1}"></a>\n\n`;
    markdown += chapter.content;
    markdown += `\n\n---\n\n`;
  });

  return markdown;
}

/**
 * Sauvegarde le fichier Markdown
 */
async function saveMarkdownFile(
  bookId: string,
  content: string
): Promise<void> {
  // Sauvegarder dans votre système de stockage (S3, filesystem, etc.)
  // Exemple avec un système de fichiers:
  // await fs.writeFile(`books/${bookId}.md`, content);
  
  // Exemple avec S3:
  // await s3.upload({ Bucket: 'books', Key: `${bookId}.md`, Body: content });
}

/**
 * Envoie une notification par email à l'utilisateur
 */
async function notifyUserByEmail(
  jobId: string,
  bookData: BookData
): Promise<void> {
  // Récupérer l'email de l'utilisateur depuis le job
  const job = await db.job.findUnique({ where: { id: jobId } });
  
  if (job?.userEmail) {
    await sendEmail({
      to: job.userEmail,
      subject: `Votre livre "${bookData.book_title}" est prêt !`,
      html: `
        <h1>Votre livre est prêt !</h1>
        <p>Bonjour,</p>
        <p>Votre livre "<strong>${bookData.book_title}</strong>" a été généré avec succès.</p>
        <ul>
          <li>Chapitres: ${bookData.chapter_count}</li>
          <li>Mots: ${bookData.word_count.toLocaleString('fr-FR')}</li>
        </ul>
        <p><a href="https://votre-domaine.com/books/${jobId}">Voir mon livre</a></p>
      `,
    });
  }
}

/**
 * Met à jour le statut du job
 */
async function updateJobStatus(
  jobId: string,
  status: 'completed' | 'failed',
  bookId: string | null,
  error?: any
): Promise<void> {
  await db.job.update({
    where: { id: jobId },
    data: {
      status,
      bookId,
      error: error ? JSON.stringify(error) : null,
      completedAt: new Date(),
    },
  });
}
```

---

### 3. Variables d'Environnement (`.env.local`)

```bash
# Webhook Secret (PRODUCTION uniquement)
WEBHOOK_SECRET=sorami-webhook-secret-key-2025

# Base de données
DATABASE_URL=postgresql://...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

---

## 🧪 Tester l'Implémentation

### 1. Démarrer le frontend

```bash
npm run dev
```

### 2. Tester depuis le backend

```bash
python test_webhook_complete.py
```

### 3. Tester manuellement avec curl

```bash
# En développement
curl -X POST http://localhost:3000/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-123",
    "status": "completed",
    "timestamp": "2025-10-20T14:30:00Z",
    "environment": "development",
    "book_data": {
      "book_title": "Mon Livre de Test",
      "topic": "Test",
      "goal": "Tester le webhook",
      "outline": [],
      "chapters": [
        {
          "title": "Chapitre 1",
          "content": "# Chapitre 1\n\nContenu du test..."
        }
      ],
      "generated_at": "2025-10-20T14:30:00Z",
      "word_count": 1500,
      "chapter_count": 1
    }
  }'

# En production
curl -X POST https://votre-domaine.com/api/webhooks/book-completion \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sorami-webhook-secret-key-2025" \
  -d '{...}'
```

---

## 📊 Monitoring

### Logs à surveiller

```typescript
// Dans route.ts, ajoutez des logs détaillés:
console.log('📬 Webhook reçu:', {
  timestamp: new Date().toISOString(),
  job_id: payload.job_id,
  environment: payload.environment,
  book_title: payload.book_data.book_title,
});
```

### Métriques à suivre

- Nombre de webhooks reçus par jour
- Temps de traitement moyen
- Taux d'erreur
- Taille moyenne des livres

---

## 🔒 Sécurité en Production

1. **Toujours vérifier le secret**
2. **Valider les données reçues**
3. **Limiter le taux de requêtes** (rate limiting)
4. **Logger tous les accès**
5. **Utiliser HTTPS uniquement**

---

## 🆘 Dépannage

### Le webhook ne reçoit rien

1. Vérifier que le frontend est démarré
2. Vérifier les logs du backend
3. Tester avec `test_webhook_complete.py`

### Erreur 401 en production

1. Vérifier que `WEBHOOK_SECRET` est identique des deux côtés
2. Vérifier que l'en-tête `X-Webhook-Secret` est bien envoyé

### Erreur 500

1. Vérifier les logs du frontend
2. Vérifier que la base de données est accessible
3. Vérifier que tous les services sont opérationnels

---

**Version :** 1.0  
**Dernière mise à jour :** 20 octobre 2025
