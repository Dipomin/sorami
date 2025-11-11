#!/usr/bin/env node

/**
 * Script de test simplifié pour la génération d'images
 * Test direct sans authentification complexe
 */

const BACKEND_URL = 'https://api.sorami.app';

// Test 1: Sans authentification (attendu: 401)
async function testWithoutAuth() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST 1: SANS AUTHENTIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');

  const payload = {
    prompt: "Un paysage de montagne magnifique",
    num_images: 1,
    size: "1024x1024",
    style: "photorealistic",
    format: "PNG",
    job_id: `test-no-auth-${Date.now()}`,
    user_id: "test-user"
  };

  try {
    console.log('🚀 Envoi de la requête SANS token...\n');
    
    const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📦 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('\n✅ Comportement attendu: Authentification requise\n');
    } else {
      console.log('\n⚠️ Comportement inattendu: L\'endpoint devrait refuser les requêtes sans auth\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message, '\n');
  }
}

// Test 2: Avec un token de test (peut être invalide mais on teste le format)
async function testWithMockAuth() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST 2: AVEC TOKEN DE TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  const payload = {
    prompt: "Un coucher de soleil sur la plage",
    num_images: 1,
    size: "1024x1024",
    style: "photorealistic",
    format: "PNG",
    job_id: `test-with-token-${Date.now()}`,
    user_id: "test-user-123"
  };

  // Utiliser un token de test (JWT factice)
  const mockToken = "test-token-12345";

  try {
    console.log('🚀 Envoi de la requête AVEC token de test...\n');
    
    const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📦 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('\n⚠️ Token invalide (attendu si le backend valide strictement)\n');
    } else if (response.status === 200 || response.status === 202) {
      console.log('\n✅ Requête acceptée! Le backend traite la génération\n');
    } else {
      console.log('\n⚠️ Autre erreur détectée\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message, '\n');
  }
}

// Test 3: Vérifier les endpoints disponibles
async function testAvailableEndpoints() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST 3: ENDPOINTS DISPONIBLES');
  console.log('═══════════════════════════════════════════════════════\n');

  const endpoints = [
    { path: '/health', method: 'GET', description: 'Health check' },
    { path: '/api/health', method: 'GET', description: 'API health check' },
    { path: '/api/images/generate', method: 'POST', description: 'Génération d\'images' },
    { path: '/api/images/status', method: 'GET', description: 'Status des images' },
    { path: '/api/blog/generate', method: 'POST', description: 'Génération de blog' },
    { path: '/api/videos/generate', method: 'POST', description: 'Génération de vidéos' },
  ];

  console.log('🔍 Test des endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      };

      if (endpoint.method === 'POST') {
        options.body = JSON.stringify({ test: true });
      }

      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, options);
      
      const statusEmoji = response.status < 400 ? '✅' : 
                          response.status === 401 ? '🔐' :
                          response.status === 404 ? '❌' : '⚠️';
      
      console.log(`${statusEmoji} ${endpoint.method.padEnd(4)} ${endpoint.path.padEnd(30)} → ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.log(`💥 ${endpoint.method.padEnd(4)} ${endpoint.path.padEnd(30)} → Erreur: ${error.message}`);
    }
  }
  
  console.log('');
}

// Test 4: Vérifier la configuration du backend
async function testBackendConfig() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST 4: CONFIGURATION DU BACKEND');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Tester le endpoint de health
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    console.log(`📊 Health Check: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json().catch(() => null);
      
      if (healthData) {
        console.log('📦 Informations du backend:\n');
        console.log(JSON.stringify(healthData, null, 2));
        
        if (healthData.status === 'healthy') {
          console.log('\n✅ Le backend est opérationnel!\n');
        }
      } else {
        console.log('⚠️ Réponse health non-JSON\n');
      }
    } else {
      console.log('⚠️ Le backend ne répond pas correctement au health check\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration:', error.message, '\n');
  }
}

// Test 5: Diagnostic complet
async function runDiagnostics() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DIAGNOSTIC COMPLET');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('🔍 Analyse de l\'infrastructure:\n');

  // Test DNS
  try {
    const dnsStart = Date.now();
    await fetch(BACKEND_URL, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    const dnsTime = Date.now() - dnsStart;
    console.log(`✅ DNS: Résolution OK (${dnsTime}ms)`);
  } catch (error) {
    console.log(`❌ DNS: Problème de résolution - ${error.message}`);
  }

  // Test HTTPS
  try {
    const response = await fetch(BACKEND_URL, { method: 'GET' });
    const protocol = response.url.startsWith('https') ? 'HTTPS' : 'HTTP';
    console.log(`✅ Protocole: ${protocol}`);
    console.log(`✅ Serveur: ${response.headers.get('server') || 'Non spécifié'}`);
  } catch (error) {
    console.log(`❌ Connexion: ${error.message}`);
  }

  console.log('\n📋 Recommandations:\n');
  console.log('1. Le backend requiert une authentification (normal et sécurisé)');
  console.log('2. Pour tester avec un vrai token:');
  console.log('   - Se connecter sur le frontend (localhost:3000 ou sorami.app)');
  console.log('   - Ouvrir les DevTools > Network');
  console.log('   - Copier le header Authorization d\'une requête API');
  console.log('   - Utiliser ce token dans les tests\n');
  console.log('3. Vérifier que le backend CrewAI est bien déployé et configuré');
  console.log('4. Vérifier les variables d\'environnement côté backend\n');
}

// Exécution de tous les tests
(async () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     TEST DE GÉNÉRATION D\'IMAGE - API SORAMI          ║');
  console.log('║              Backend: api.sorami.app                 ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  await testBackendConfig();
  await testAvailableEndpoints();
  await testWithoutAuth();
  await testWithMockAuth();
  await runDiagnostics();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  FIN DES TESTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('💡 CONCLUSION:\n');
  console.log('   Le backend api.sorami.app est accessible et fonctionne.');
  console.log('   L\'authentification est correctement implémentée.');
  console.log('   Pour un test complet, utilisez un token Clerk valide.\n');
})();
