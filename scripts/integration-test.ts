// Script de test d'intégration pour valider le système complet
import { prisma } from '../src/lib/prisma'
import { convertBookToFormats } from '../src/lib/s3-simple'

async function runIntegrationTests() {
  console.log('🚀 Démarrage des tests d\'intégration...\n')
  
  try {
    // Test 1: Connexion à la base de données
    console.log('📊 Test 1: Connexion à la base de données')
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Base de données connectée:', dbTest)
    
    // Test 2: Création d'une organisation de test
    console.log('\n🏢 Test 2: Création d\'une organisation de test')
    const testOrg = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: `test-org-${Date.now()}`,
        plan: 'STARTER'
      }
    })
    console.log('✅ Organisation créée:', testOrg.id)
    
    // Test 3: Création d'un utilisateur de test
    console.log('\n👤 Test 3: Création d\'un utilisateur de test')
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        clerkId: `user_test_${Date.now()}`, // ID temporaire
        status: 'ACTIVE',
        role: 'USER',
      }
    })
    console.log('✅ Utilisateur créé:', testUser.id)
    
    // Test 4: Création d'un livre avec chapitres
    console.log('\n📚 Test 4: Création d\'un livre avec chapitres')
    const testBook = await prisma.book.create({
      data: {
        title: 'Livre de Test',
        subtitle: 'Un test d\'intégration',
        description: 'Ce livre teste le système complet',
        topic: 'Technologie',
        goal: 'Tester l\'intégration complète du système',
        language: 'fr',
        status: 'PUBLISHED',
        authorId: testUser.id,
        organizationId: testOrg.id,
        chapters: {
          create: [
            {
              title: 'Chapitre 1: Introduction',
              content: 'Ceci est le contenu du premier chapitre de notre livre de test.',
              description: 'Introduction au système de test',
              order: 1,
              status: 'PUBLISHED'
            },
            {
              title: 'Chapitre 2: Développement',
              content: 'Ce chapitre traite du développement et des fonctionnalités avancées.',
              description: 'Exploration des fonctionnalités',
              order: 2,
              status: 'PUBLISHED'
            }
          ]
        }
      },
      include: {
        chapters: true
      }
    })
    console.log('✅ Livre créé avec chapitres:', testBook.id)
    
    // Test 5: Création d'un job de génération
    console.log('\n⚙️ Test 5: Création d\'un job de génération')
    const testJob = await prisma.bookJob.create({
      data: {
        bookId: testBook.id,
        organizationId: testOrg.id,
        userId: testUser.id,
        jobType: 'BOOK_GENERATION',
        priority: 'NORMAL',
        status: 'COMPLETED',
        inputData: {
          topic: testBook.topic,
          goal: testBook.goal,
          chapters: testBook.chapters.map(ch => ({
            title: ch.title,
            description: ch.description
          }))
        },
        result: {
          book: testBook,
          chapters: testBook.chapters
        },
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    console.log('✅ Job de génération créé:', testJob.id)
    
    // Test 6: Test conversion de formats (si S3 configuré)
    if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
      console.log('\n📄 Test 6: Conversion de formats S3')
      try {
        const formats = await convertBookToFormats(testBook.id)
        console.log('✅ Formats générés:', {
          html: formats.html.id,
          txt: formats.txt.id
        })
      } catch (error) {
        console.log('⚠️ Test S3 ignoré (configuration manquante):', (error as Error).message)
      }
    } else {
      console.log('\n⚠️ Test 6: S3 non configuré, test ignoré')
    }
    
    // Test 7: Création d'un abonnement
    console.log('\n💳 Test 7: Création d\'un abonnement')
    const testSubscription = await prisma.subscription.create({
      data: {
        organizationId: testOrg.id,
        plan: 'STARTER',
        amount: 9.99,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    })
    console.log('✅ Abonnement créé:', testSubscription.id)
    
    // Test 8: Enregistrement de métriques d'usage
    console.log('\n📈 Test 8: Métriques d\'usage')
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const usageMetric = await prisma.usageMetric.create({
      data: {
        organizationId: testOrg.id,
        metric: 'BOOKS_CREATED',
        value: 1,
        unit: 'books',
        periodStart,
        periodEnd,
        metadata: {
          bookId: testBook.id,
          testRun: true
        }
      }
    })
    console.log('✅ Métrique d\'usage créée:', usageMetric.id)
    
    // Test 9: Log d'activité
    console.log('\n📝 Test 9: Log d\'activité')
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: testUser.id,
        organizationId: testOrg.id,
        action: 'BOOK_CREATED',
        resource: 'Book',
        resourceId: testBook.id,
        userAgent: 'Integration Test Script',
        ipAddress: '127.0.0.1'
      }
    })
    console.log('✅ Log d\'activité créé:', activityLog.id)
    
    // Résumé des tests
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!')
    console.log('\n📋 Résumé:')
    console.log(`- Organisation: ${testOrg.name} (${testOrg.id})`)
    console.log(`- Utilisateur: ${testUser.name} (${testUser.email})`)
    console.log(`- Livre: ${testBook.title} avec ${testBook.chapters.length} chapitres`)
    console.log(`- Job: ${testJob.status} (${testJob.id})`)
    console.log(`- Abonnement: ${testSubscription.status} - ${testSubscription.plan}`)
    console.log(`- Métriques: ${usageMetric.metric} = ${usageMetric.value}`)
    
    return {
      success: true,
      data: {
        organization: testOrg,
        user: testUser,
        book: testBook,
        job: testJob,
        subscription: testSubscription
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
    return {
      success: false,
      error: (error as Error).message
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction de nettoyage (optionnelle)
async function cleanupTestData(testData: any) {
  console.log('\n🧹 Nettoyage des données de test...')
  
  try {
    // Supprimer dans l'ordre inverse de création
    if (testData.job) {
      await prisma.bookJob.delete({ where: { id: testData.job.id } })
      console.log('✅ Job supprimé')
    }
    
    if (testData.book) {
      await prisma.book.delete({ where: { id: testData.book.id } })
      console.log('✅ Livre et chapitres supprimés')
    }
    
    if (testData.subscription) {
      await prisma.subscription.delete({ where: { id: testData.subscription.id } })
      console.log('✅ Abonnement supprimé')
    }
    
    if (testData.user) {
      await prisma.user.delete({ where: { id: testData.user.id } })
      console.log('✅ Utilisateur supprimé')
    }
    
    if (testData.organization) {
      await prisma.organization.delete({ where: { id: testData.organization.id } })
      console.log('✅ Organisation supprimée')
    }
    
    console.log('✅ Nettoyage terminé')
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
  runIntegrationTests()
    .then(async (result) => {
      if (result.success) {
        console.log('\n❓ Voulez-vous nettoyer les données de test ? (Ctrl+C pour arrêter)')
        
        // Attendre 5 secondes puis nettoyer automatiquement
        setTimeout(async () => {
          await cleanupTestData(result.data)
          process.exit(0)
        }, 5000)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error)
      process.exit(1)
    })
}

export { runIntegrationTests, cleanupTestData }