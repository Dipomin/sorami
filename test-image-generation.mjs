#!/usr/bin/env node

/**
 * Script de test pour la génération d'images via le backend api.sorami.app
 * 
 * Teste l'endpoint: POST https://api.sorami.app/api/images/generate
 */

const BACKEND_URL = 'https://api.sorami.app';

// Payload de test
const testPayload = {
  prompt: "Un coucher de soleil magnifique sur une plage tropicale avec des palmiers, style photographique professionnel",
  num_images: 1,
  size: "1024x1024",
  style: "photorealistic",
  quality: "standard",
  format: "PNG",
  job_id: `test-${Date.now()}`, // ID de test
  user_id: "test-user-123"
};

console.log('🧪 Test de génération d\'image sur api.sorami.app\n');
console.log('📋 Configuration:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   Endpoint: /api/images/generate`);
console.log(`   Prompt: "${testPayload.prompt.substring(0, 50)}..."`);
console.log(`   Nombre d'images: ${testPayload.num_images}`);
console.log(`   Taille: ${testPayload.size}`);
console.log(`   Style: ${testPayload.style}\n`);

async function testImageGeneration() {
  try {
    console.log('🚀 Envoi de la requête...\n');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Temps de réponse: ${duration}ms`);
    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers de réponse:`);
    
    // Afficher les headers importants
    const headers = {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'server': response.headers.get('server'),
      'x-powered-by': response.headers.get('x-powered-by'),
    };
    
    Object.entries(headers).forEach(([key, value]) => {
      if (value) console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n📦 Réponse du backend:\n');
    
    // Parser la réponse
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('⚠️  Réponse non-JSON reçue:');
      console.log(text.substring(0, 500));
      if (text.length > 500) console.log('... (tronqué)');
    }
    
    // Analyse du résultat
    console.log('\n📈 Analyse:');
    
    if (response.ok) {
      console.log('✅ Succès! Le backend a accepté la requête');
      
      if (data) {
        if (data.job_id) {
          console.log(`   Job ID: ${data.job_id}`);
        }
        if (data.status) {
          console.log(`   Status: ${data.status}`);
        }
        if (data.message) {
          console.log(`   Message: ${data.message}`);
        }
        if (data.images && data.images.length > 0) {
          console.log(`   Images générées: ${data.images.length}`);
          data.images.forEach((img, i) => {
            console.log(`      [${i + 1}] ${img.url || img.path || 'URL manquante'}`);
          });
        }
      }
    } else {
      console.log('❌ Échec de la requête');
      
      if (data) {
        if (data.error) {
          console.log(`   Erreur: ${data.error}`);
        }
        if (data.message) {
          console.log(`   Message: ${data.message}`);
        }
        if (data.details) {
          console.log(`   Détails: ${JSON.stringify(data.details)}`);
        }
      }
      
      // Diagnostic des erreurs communes
      console.log('\n🔍 Diagnostic:');
      
      if (response.status === 404) {
        console.log('   ⚠️  Endpoint non trouvé (404)');
        console.log('   → Vérifier que le backend est déployé sur api.sorami.app');
        console.log('   → Vérifier que la route /api/images/generate existe');
      } else if (response.status === 401 || response.status === 403) {
        console.log('   ⚠️  Problème d\'authentification');
        console.log('   → Vérifier si un token est requis');
        console.log('   → Vérifier la configuration de l\'API');
      } else if (response.status === 500) {
        console.log('   ⚠️  Erreur interne du serveur');
        console.log('   → Vérifier les logs du backend');
        console.log('   → Vérifier la configuration (API keys, services)');
      } else if (response.status === 502 || response.status === 503) {
        console.log('   ⚠️  Service indisponible');
        console.log('   → Vérifier que le backend est en ligne');
        console.log('   → Vérifier la configuration Nginx/reverse proxy');
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:');
    console.error(error);
    
    console.log('\n🔍 Diagnostic:');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('   ⚠️  Le domaine api.sorami.app est introuvable');
      console.log('   → Vérifier la configuration DNS');
      console.log('   → Vérifier que le domaine pointe vers le bon serveur');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   ⚠️  Connexion refusée');
      console.log('   → Vérifier que le backend est en ligne');
      console.log('   → Vérifier le port et la configuration du serveur');
    } else if (error.message.includes('timeout')) {
      console.log('   ⚠️  Timeout de la requête');
      console.log('   → Le backend met trop de temps à répondre');
      console.log('   → Vérifier les performances du serveur');
    } else if (error.message.includes('certificate')) {
      console.log('   ⚠️  Problème de certificat SSL');
      console.log('   → Vérifier la configuration HTTPS');
    }
  }
}

// Test de connectivité basique
async function testConnectivity() {
  console.log('🔌 Test de connectivité basique...\n');
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    console.log(`✅ Le serveur ${BACKEND_URL} répond (${response.status})`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    // Essayer de récupérer la page d'accueil ou la réponse
    const text = await response.text();
    console.log(`   Taille de la réponse: ${text.length} octets\n`);
    
  } catch (error) {
    console.log(`❌ Le serveur ${BACKEND_URL} ne répond pas`);
    console.log(`   Erreur: ${error.message}\n`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('⚠️  Le domaine n\'existe pas ou le DNS ne résout pas');
      process.exit(1);
    }
  }
}

// Test des routes API disponibles
async function testApiRoutes() {
  console.log('🔍 Test des routes API disponibles...\n');
  
  const routes = [
    '/api/health',
    '/api/status',
    '/api/images',
    '/api/images/generate',
    '/health',
    '/',
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${BACKEND_URL}${route}`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      
      const status = response.status;
      const emoji = status < 400 ? '✅' : status === 404 ? '❌' : '⚠️';
      console.log(`${emoji} ${route.padEnd(25)} → ${status} ${response.statusText}`);
      
    } catch (error) {
      console.log(`❌ ${route.padEnd(25)} → Erreur: ${error.message}`);
    }
  }
  
  console.log('');
}

// Exécution des tests
(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST DE GÉNÉRATION D\'IMAGE - API SORAMI');
  console.log('═══════════════════════════════════════════════════════\n');
  
  await testConnectivity();
  await testApiRoutes();
  await testImageGeneration();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FIN DES TESTS');
  console.log('═══════════════════════════════════════════════════════');
})();
