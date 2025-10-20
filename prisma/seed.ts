import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding...')

  // ============================================================================
  // CRÉATION DES UTILISATEURS DE TEST
  // ============================================================================
  
  // Super Admin avec clerkId temporaire
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sorami.io' },
    update: {},
    create: {
      email: 'admin@sorami.io',
      firstName: 'Super',
      lastName: 'Admin',
      clerkId: 'user_admin_temp', // ID temporaire, sera remplacé par Clerk
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  })

  // Utilisateur démo avec clerkId temporaire
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sorami.io' },
    update: {},
    create: {
      email: 'demo@sorami.io',
      firstName: 'John',
      lastName: 'Doe',
      clerkId: 'user_demo_temp', // ID temporaire, sera remplacé par Clerk
      role: 'USER',
      status: 'ACTIVE',
      isEmailVerified: true,
      company: 'Demo Company',
      jobTitle: 'Content Creator',
    },
  })

  console.log('✅ Utilisateurs créés')

  // ============================================================================
  // CRÉATION DES ORGANISATIONS
  // ============================================================================

  const demoOrg = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
      slug: 'demo-org',
      description: 'Organisation de démonstration pour tester les fonctionnalités',
      plan: 'PRO',
      maxUsers: 10,
      maxBooks: 100,
      maxBooksPerMonth: 20,
      maxStorageGB: 50,
      status: 'ACTIVE',
      settings: {
        features: {
          aiGeneration: true,
          collaboration: true,
          apiAccess: true,
          customBranding: true,
        },
        limits: {
          maxChaptersPerBook: 50,
          maxWordCountPerBook: 100000,
        },
      },
      branding: {
        primaryColor: '#3B82F6',
        logo: null,
        customDomain: null,
      },
    },
  })

  // Ajouter l'utilisateur démo à l'organisation
  await prisma.organizationMember.create({
    data: {
      userId: demoUser.id,
      organizationId: demoOrg.id,
      role: 'OWNER',
      status: 'ACTIVE',
      permissions: ['*'],
    },
  })

  console.log('✅ Organisations créées')

  // ============================================================================
  // CRÉATION DES LIVRES DE DÉMONSTRATION
  // ============================================================================

  // Livre 1 : Complet
  const book1 = await prisma.book.create({
    data: {
      title: 'Guide Complet de l\'Intelligence Artificielle en 2024',
      subtitle: 'De la théorie à la pratique',
      description: 'Un guide complet pour comprendre et maîtriser l\'IA moderne, de ses fondements théoriques aux applications pratiques.',
      topic: 'Intelligence Artificielle',
      goal: 'Fournir une compréhension complète de l\'IA pour les professionnels et entrepreneurs souhaitant intégrer ces technologies dans leur activité.',
      content: `# Guide Complet de l'Intelligence Artificielle en 2024

## Introduction

L'intelligence artificielle représente aujourd'hui l'une des révolutions technologiques les plus importantes...

## Table des matières

1. Introduction à l'IA
2. Les fondements techniques
3. Applications pratiques
4. Éthique et IA
5. L'avenir de l'intelligence artificielle`,
      outline: {
        chapters: [
          { title: 'Introduction à l\'IA', description: 'Concepts de base et historique' },
          { title: 'Les fondements techniques', description: 'Machine Learning, Deep Learning, NLP' },
          { title: 'Applications pratiques', description: 'Cas d\'usage dans différents secteurs' },
          { title: 'Éthique et IA', description: 'Enjeux éthiques et sociétaux' },
          { title: 'L\'avenir de l\'intelligence artificielle', description: 'Tendances et perspectives' },
        ],
      },
      totalPages: 120,
      wordCount: 35000,
      language: 'fr',
      genre: 'Technology',
      targetAudience: 'Professionnels et entrepreneurs',
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      visibility: 'PRIVATE',
      authorId: demoUser.id,
      organizationId: demoOrg.id,
      storageProvider: 'LOCAL',
      markdownPath: '/books/ai-guide-2024.md',
      publishedAt: new Date(),
    },
  })

  // Livre 2 : En cours de génération
  const book2 = await prisma.book.create({
    data: {
      title: 'Marketing Digital pour Startups',
      subtitle: 'Stratégies gagnantes pour 2024',
      description: 'Les meilleures stratégies de marketing digital spécialement adaptées aux startups.',
      topic: 'Marketing Digital',
      goal: 'Aider les fondateurs de startups à développer une stratégie marketing efficace avec un budget limité.',
      status: 'GENERATING',
      visibility: 'PRIVATE',
      authorId: demoUser.id,
      organizationId: demoOrg.id,
      storageProvider: 'LOCAL',
      language: 'fr',
      difficulty: 'BEGINNER',
    },
  })

  console.log('✅ Livres créés')

  // ============================================================================
  // CRÉATION DES CHAPITRES
  // ============================================================================

  const chapters = [
    {
      title: 'Introduction à l\'Intelligence Artificielle',
      content: `# Introduction à l'Intelligence Artificielle

L'intelligence artificielle (IA) est devenue omniprésente dans notre quotidien...

## Définition de l'IA

L'intelligence artificielle désigne...

## Histoire de l'IA

Les premières recherches en IA remontent...`,
      order: 1,
      wordCount: 2500,
      estimatedReadTime: 10,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Les Fondements Techniques',
      content: `# Les Fondements Techniques

Pour comprendre l'IA, il est essentiel de maîtriser...

## Machine Learning

Le machine learning est...

## Deep Learning

Le deep learning, ou apprentissage profond...`,
      order: 2,
      wordCount: 3200,
      estimatedReadTime: 13,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Applications Pratiques',
      content: `# Applications Pratiques de l'IA

L'IA trouve aujourd'hui des applications...

## Secteur de la Santé

Dans le domaine médical...

## Automobile et Transport

Les véhicules autonomes...`,
      order: 3,
      wordCount: 2800,
      estimatedReadTime: 11,
      status: 'PUBLISHED' as const,
    },
  ]

  for (const chapterData of chapters) {
    await prisma.chapter.create({
      data: {
        ...chapterData,
        bookId: book1.id,
      },
    })
  }

  console.log('✅ Chapitres créés')

  // ============================================================================
  // CRÉATION DES FORMATS DE LIVRE
  // ============================================================================

  const formats = [
    {
      format: 'MARKDOWN' as const,
      fileName: 'ai-guide-2024.md',
      fileSize: 95000,
      mimeType: 'text/markdown',
      status: 'READY' as const,
    },
    {
      format: 'PDF' as const,
      fileName: 'ai-guide-2024.pdf',
      fileSize: 2100000,
      mimeType: 'application/pdf',
      status: 'READY' as const,
    },
    {
      format: 'EPUB' as const,
      fileName: 'ai-guide-2024.epub',
      fileSize: 850000,
      mimeType: 'application/epub+zip',
      status: 'READY' as const,
    },
  ]

  for (const formatData of formats) {
    await prisma.bookFormat.create({
      data: {
        ...formatData,
        bookId: book1.id,
        storageProvider: 'LOCAL',
        filePath: `/storage/books/${book1.id}/${formatData.fileName}`,
      },
    })
  }

  console.log('✅ Formats de livre créés')

  // ============================================================================
  // CRÉATION DES JOBS
  // ============================================================================

  // Job terminé
  await prisma.bookJob.create({
    data: {
      externalJobId: 'crew_ai_job_12345',
      jobType: 'BOOK_GENERATION',
      priority: 'NORMAL',
      inputData: {
        title: book1.title,
        topic: book1.topic,
        goal: book1.goal,
      },
      status: 'COMPLETED',
      progress: {
        currentStep: 'completed',
        percentage: 100,
        chaptersCompleted: 5,
        totalChapters: 5,
      },
      currentStep: 'completed',
      totalSteps: 5,
      completedSteps: 5,
      result: {
        bookId: book1.id,
        generatedContent: true,
        totalChapters: 5,
        wordCount: 35000,
      },
      startedAt: new Date(Date.now() - 3600000), // 1 heure ago
      completedAt: new Date(Date.now() - 600000), // 10 minutes ago
      estimatedDuration: 3000, // 50 minutes
      userId: demoUser.id,
      organizationId: demoOrg.id,
      bookId: book1.id,
    },
  })

  // Job en cours
  await prisma.bookJob.create({
    data: {
      externalJobId: 'crew_ai_job_67890',
      jobType: 'BOOK_GENERATION',
      priority: 'NORMAL',
      inputData: {
        title: book2.title,
        topic: book2.topic,
        goal: book2.goal,
      },
      status: 'WRITING_CHAPTERS',
      progress: {
        currentStep: 'writing_chapters',
        percentage: 60,
        chaptersCompleted: 3,
        totalChapters: 5,
      },
      currentStep: 'writing_chapters',
      totalSteps: 5,
      completedSteps: 3,
      startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      estimatedDuration: 3600, // 60 minutes
      userId: demoUser.id,
      organizationId: demoOrg.id,
      bookId: book2.id,
    },
  })

  console.log('✅ Jobs créés')

  // ============================================================================
  // CRÉATION D'UN ABONNEMENT
  // ============================================================================

  await prisma.subscription.create({
    data: {
      organizationId: demoOrg.id,
      plan: 'PRO',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      amount: 29.99,
      currency: 'EUR',
    },
  })

  console.log('✅ Abonnement créé')

  // ============================================================================
  // CRÉATION DES MÉTRIQUES D'USAGE
  // ============================================================================

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const metrics = [
    { metric: 'BOOKS_CREATED' as const, value: 2 },
    { metric: 'STORAGE_USED' as const, value: 0.5 }, // GB
    { metric: 'API_CALLS' as const, value: 150 },
    { metric: 'TOKENS_USED' as const, value: 25000 },
  ]

  for (const metricData of metrics) {
    await prisma.usageMetric.create({
      data: {
        ...metricData,
        unit: metricData.metric === 'STORAGE_USED' ? 'GB' : 
              metricData.metric === 'TOKENS_USED' ? 'tokens' : 'count',
        periodStart: monthStart,
        periodEnd: monthEnd,
        organizationId: demoOrg.id,
        userId: demoUser.id,
      },
    })
  }

  console.log('✅ Métriques d\'usage créées')

  // ============================================================================
  // CRÉATION DES CLÉS API
  // ============================================================================

  await prisma.apiKey.create({
    data: {
      name: 'API Production',
      key: 'sorami_demo_api_key_123456789',
      hashedKey: createHash('sha256').update('sorami_demo_api_key_123456789').digest('hex'),
      organizationId: demoOrg.id,
      userId: demoUser.id,
      scopes: ['books:read', 'books:write', 'jobs:read'],
      rateLimit: 5000,
      status: 'ACTIVE',
    },
  })

  console.log('✅ Clés API créées')

  // ============================================================================
  // JOURNALISATION D'ACTIVITÉ
  // ============================================================================

  const activities = [
    {
      action: 'user.login',
      description: 'Connexion utilisateur',
      metadata: { method: 'email' },
    },
    {
      action: 'book.created',
      resource: 'book',
      resourceId: book1.id,
      description: 'Nouveau livre créé',
      metadata: { title: book1.title },
    },
    {
      action: 'book.published',
      resource: 'book',
      resourceId: book1.id,
      description: 'Livre publié',
    },
  ]

  for (const activityData of activities) {
    await prisma.activityLog.create({
      data: {
        ...activityData,
        userId: demoUser.id,
        organizationId: demoOrg.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Demo Browser',
      },
    })
  }

  console.log('✅ Journalisation d\'activité créée')

  console.log('🎉 Seeding terminé avec succès!')
  console.log(`
📊 Données créées :
- 2 utilisateurs (admin@sorami.io, demo@sorami.io)
- 1 organisation (Demo Organization)
- 2 livres (1 publié, 1 en génération)
- 3 chapitres
- 3 formats de livre
- 2 jobs de génération
- 1 abonnement actif
- 4 métriques d'usage
- 1 clé API
- 3 entrées de journal d'activité

🔑 Identifiants de test :
- Email: demo@sorami.io
- Mot de passe: password123
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })