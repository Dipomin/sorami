#!/usr/bin/env node

/**
 * Script de test AUTHENTIFIÉ pour la génération d'images
 * Utilise un token Clerk valide pour tester l'endpoint du backend
 */

import { PrismaClient } from '@prisma/client';
import { Clerk } from '@clerk/clerk-sdk-node';

const BACKEND_URL = 'https://api.sorami.app';
const prisma = new PrismaClient();

// Initialiser Clerk avec la clé secrète
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

async function getTestUserToken() {
  try {
    // Récupérer un utilisateur de test depuis la DB
    const user = await prisma.user.findFirst({
      where: {
        email: { not: null }
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        credits: true
      }
    });

    if (!user || !user.clerkId) {
      console.error('❌ Aucun utilisateur trouvé dans la base de données');
      return null;
    }

    console.log('👤 Utilisateur de test trouvé:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Crédits: ${user.credits}\n`);

    // Générer un token JWT Clerk pour cet utilisateur
    console.log('🔑 Génération du token d\'authentification...');
    
    // Utiliser l'API Clerk pour créer un token de session
    const token = await clerk.sessions.getToken(user.clerkId, 'session_token');
    
    if (!token) {
      console.error('❌ Impossible de générer un token Clerk');
      return null;
    }

    console.log('✅ Token généré avec succès\n');
    
    return { user, token };
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token:', error.message);
    
    // Fallback: créer un token de test manuel
    console.log('\n⚠️  Tentative avec un token de test manuel...\n');
    
    const user = await prisma.user.findFirst({
      where: { email: { not: null } },
      select: { id: true, clerkId: true, email: true, credits: true }
    });
    
    return { user, token: null };
  }
}

async function testAuthenticatedImageGeneration() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST AUTHENTIFIÉ - GÉNÉRATION D\'IMAGE');
  console.log('═══════════════════════════════════════════════════════\n');

  const authData = await getTestUserToken();
  
  if (!authData) {
    console.error('❌ Impossible de continuer sans utilisateur de test');
    return;
  }

  const { user, token } = authData;

  const testPayload = {
    prompt: "Un paysage de montagne enneigé au lever du soleil, style photographique HDR",
    num_images: 1,
    size: "1024x1024",
    style: "photorealistic",
    quality: "standard",
    format: "PNG",
    job_id: `test-${Date.now()}`,
    user_id: user.id
  };

  console.log('📋 Configuration du test:');
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Endpoint: /api/images/generate`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Prompt: "${testPayload.prompt.substring(0, 50)}..."`);
  console.log(`   Token disponible: ${token ? '✅ Oui' : '❌ Non (test sans auth)'}\n`);

  try {
    console.log('🚀 Envoi de la requête avec authentification...\n');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Ajouter le token si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    });

    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Temps de réponse: ${duration}ms`);
    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}\n`);
    
    console.log('📋 Headers de réponse:');
    const headersToShow = ['content-type', 'content-length', 'server', 'x-powered-by', 'x-request-id'];
    headersToShow.forEach(key => {
      const value = response.headers.get(key);
      if (value) console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n📦 Réponse du backend:\n');
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('⚠️  Réponse non-JSON:');
      console.log(text.substring(0, 500));
    }
    
    console.log('\n📈 Analyse du résultat:\n');
    
    if (response.ok) {
      console.log('✅ SUCCÈS! Le backend a accepté la requête\n');
      
      if (data) {
        if (data.job_id) {
          console.log(`   📋 Job ID: ${data.job_id}`);
        }
        if (data.status) {
          console.log(`   📊 Status: ${data.status}`);
        }
        if (data.message) {
          console.log(`   💬 Message: ${data.message}`);
        }
        if (data.images?.length > 0) {
          console.log(`\n   🎨 Images générées: ${data.images.length}`);
          data.images.forEach((img, i) => {
            console.log(`      [${i + 1}] ${img.url || img.s3_path || 'URL manquante'}`);
          });
        }
      }

      console.log('\n✅ Le backend fonctionne correctement!');
      console.log('   → L\'authentification est configurée');
      console.log('   → L\'endpoint de génération d\'images est opérationnel');
      
    } else {
      console.log('❌ ÉCHEC de la requête\n');
      
      if (data) {
        if (data.error) console.log(`   ⚠️  Erreur: ${data.error}`);
        if (data.message) console.log(`   💬 Message: ${data.message}`);
        if (data.code) console.log(`   🔢 Code: ${data.code}`);
        if (data.details) console.log(`   📝 Détails: ${JSON.stringify(data.details)}`);
      }
      
      console.log('\n🔍 Diagnostic détaillé:\n');
      
      if (response.status === 401) {
        console.log('   ⚠️  ERREUR D\'AUTHENTIFICATION (401)');
        
        if (!token) {
          console.log('   → Aucun token n\'a pu être généré');
          console.log('   → Solutions:');
          console.log('      1. Vérifier CLERK_SECRET_KEY dans .env.local');
          console.log('      2. Vérifier que les utilisateurs ont des sessions Clerk actives');
          console.log('      3. Utiliser un token de test valide manuellement');
        } else {
          console.log('   → Le token fourni est invalide ou expiré');
          console.log('   → Solutions:');
          console.log('      1. Vérifier que le backend valide correctement les tokens Clerk');
          console.log('      2. Vérifier la configuration Clerk côté backend');
          console.log('      3. Vérifier que CLERK_SECRET_KEY correspond entre front et back');
        }
        
      } else if (response.status === 403) {
        console.log('   ⚠️  ACCÈS REFUSÉ (403)');
        console.log('   → L\'utilisateur n\'a pas les permissions nécessaires');
        console.log('   → Vérifier les crédits disponibles');
        
      } else if (response.status === 402) {
        console.log('   ⚠️  PAIEMENT REQUIS (402)');
        console.log('   → Crédits insuffisants');
        console.log(`   → Crédits actuels: ${user.credits}`);
        
      } else if (response.status === 404) {
        console.log('   ⚠️  ENDPOINT NON TROUVÉ (404)');
        console.log('   → Vérifier que la route /api/images/generate existe côté backend');
        console.log('   → Vérifier la configuration Nginx/reverse proxy');
        
      } else if (response.status === 500) {
        console.log('   ⚠️  ERREUR SERVEUR INTERNE (500)');
        console.log('   → Consulter les logs du backend');
        console.log('   → Vérifier la configuration (API keys, services externes)');
        console.log('   → Vérifier que tous les services requis sont actifs');
        
      } else if (response.status === 502 || response.status === 503) {
        console.log('   ⚠️  SERVICE INDISPONIBLE');
        console.log('   → Le backend Flask n\'est peut-être pas démarré');
        console.log('   → Vérifier les processus sur le serveur');
      }
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:\n');
    console.error(error);
    
    console.log('\n🔍 Diagnostic de l\'erreur:\n');
    
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('enotfound')) {
      console.log('   ⚠️  DNS: Le domaine api.sorami.app est introuvable');
      console.log('   → Vérifier la configuration DNS');
      console.log('   → Commande: nslookup api.sorami.app');
      
    } else if (errorMsg.includes('econnrefused')) {
      console.log('   ⚠️  CONNEXION REFUSÉE');
      console.log('   → Le serveur n\'accepte pas les connexions sur ce port');
      console.log('   → Vérifier que le backend est démarré');
      
    } else if (errorMsg.includes('timeout')) {
      console.log('   ⚠️  TIMEOUT');
      console.log('   → Le serveur est trop lent ou ne répond pas');
      console.log('   → Augmenter le timeout ou vérifier les performances');
      
    } else if (errorMsg.includes('certificate') || errorMsg.includes('ssl')) {
      console.log('   ⚠️  CERTIFICAT SSL INVALIDE');
      console.log('   → Vérifier la configuration HTTPS');
      console.log('   → Commande: openssl s_client -connect api.sorami.app:443');
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FIN DU TEST');
  console.log('═══════════════════════════════════════════════════════');
}

// Exécution
testAuthenticatedImageGeneration().catch(console.error);
