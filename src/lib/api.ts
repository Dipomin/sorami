// Point d'entrée principal pour les APIs côté client de l'application sorami
// Ce fichier réexporte uniquement les fonctions client-side qui font des appels HTTP

// Note: Les fonctions serveur (avec Prisma) sont disponibles dans './api-server'
// et doivent être utilisées uniquement dans les API routes et Server Components

// Réexport de toutes les fonctions côté client
export * from './api-client'

// Fonction de test pour déclencher le webhook
export async function testWebhookCompletion(userId: string, jobId?: string) {
  try {
    const testData = {
      jobId: jobId || `test_job_${Date.now()}`,
      userId: userId,
      title: "Livre de Test Webhook",
      description: "Un livre généré pour tester le webhook de complétion",
      content: "Contenu complet du livre de test...",
      chapters: [
        {
          title: "Introduction au Test",
          content: "Ceci est le contenu du chapitre d'introduction pour tester le webhook.",
          description: "Chapitre d'introduction",
          order: 1
        },
        {
          title: "Développement du Test",
          content: "Contenu du chapitre de développement pour valider le fonctionnement.",
          description: "Chapitre de développement", 
          order: 2
        },
        {
          title: "Conclusion du Test",
          content: "Conclusion du livre de test avec résultats de validation.",
          description: "Chapitre de conclusion",
          order: 3
        }
      ],
      status: "completed" as const,
      metadata: {
        topic: "Test Webhook",
        goal: "Valider le système de notification",
        totalChapters: 3,
        generationTime: 45
      }
    };

    const response = await fetch('/api/webhooks/book-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:9006',
        // En développement, pas besoin du secret
        // En production, le backend devra envoyer ce header
        // 'X-Webhook-Secret': process.env.WEBHOOK_SECRET
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors du test du webhook');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du test du webhook:', error);
    throw error;
  }
}