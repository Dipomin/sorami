#!/usr/bin/env node

/**
 * Script de test avec un token Clerk RÉEL
 * 
 * INSTRUCTIONS:
 * 1. Ouvrir le frontend (localhost:3000 ou sorami.app)
 * 2. Se connecter avec un compte
 * 3. Ouvrir DevTools > Network
 * 4. Faire une action qui appelle l'API
 * 5. Copier le token JWT du header Authorization
 * 6. Le passer en argument: node test-with-real-token.mjs "eyJhbGc..."
 */

const BACKEND_URL = 'https://api.sorami.app';

const token = process.argv[2];

if (!token) {
  console.log('❌ Token manquant!\n');
  console.log('Usage: node test-with-real-token.mjs "YOUR_JWT_TOKEN"\n');
  console.log('📋 Pour obtenir un token:');
  console.log('1. Ouvrir https://sorami.app ou http://localhost:3000');
  console.log('2. Se connecter avec un compte');
  console.log('3. Ouvrir DevTools (F12) > Onglet Network');
  console.log('4. Effectuer une action (créer un livre, un blog, etc.)');
  console.log('5. Cliquer sur une requête vers api.sorami.app');
  console.log('6. Dans les Headers, copier la valeur de "Authorization"');
  console.log('7. Coller le token (sans "Bearer ") en argument de ce script\n');
  console.log('Exemple:');
  console.log('  node test-with-real-token.mjs "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."\n');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════');
console.log('  TEST AVEC TOKEN CLERK RÉEL');
console.log('═══════════════════════════════════════════════════════\n');

console.log('🔑 Token fourni:', token.substring(0, 30) + '...');
console.log('📏 Longueur du token:', token.length, 'caractères\n');

// Essayer de décoder le JWT (sans vérification de signature)
try {
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('📦 Payload JWT décodé:');
    console.log('   User ID:', payload.sub || 'N/A');
    console.log('   Issued at:', new Date(payload.iat * 1000).toISOString());
    console.log('   Expires at:', new Date(payload.exp * 1000).toISOString());
    
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      console.log('   ⚠️ TOKEN EXPIRÉ!\n');
    } else {
      console.log('   ✅ Token valide\n');
    }
  }
} catch (e) {
  console.log('⚠️ Impossible de décoder le JWT (peut-être un format différent)\n');
}

async function testWithRealToken() {
  const payload = {
    prompt: "Une magnifique aurore boréale dans le ciel arctique, style photographique HDR professionnel",
    num_images: 1,
    size: "1024x1024",
    style: "photorealistic",
    quality: "standard",
    format: "PNG",
  };

  console.log('📋 Payload de test:');
  console.log('   Prompt:', payload.prompt.substring(0, 50) + '...');
  console.log('   Images:', payload.num_images);
  console.log('   Taille:', payload.size);
  console.log('   Style:', payload.style);
  console.log('');

  try {
    console.log('🚀 Envoi de la requête avec authentification...\n');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Temps de réponse: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
      console.log('📦 Réponse du backend:\n');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('⚠️ Réponse non-JSON:\n');
      console.log(text.substring(0, 500));
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ANALYSE DU RÉSULTAT');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (response.ok) {
      console.log('✅ SUCCÈS! La requête a été acceptée\n');
      
      if (data) {
        if (data.job_id) {
          console.log(`📋 Job ID: ${data.job_id}`);
          console.log(`   → Utiliser ce Job ID pour suivre la progression`);
          console.log(`   → Endpoint: GET ${BACKEND_URL}/api/images/status/${data.job_id}`);
        }
        
        if (data.status) {
          console.log(`📊 Status: ${data.status}`);
        }
        
        if (data.message) {
          console.log(`💬 Message: ${data.message}`);
        }
        
        if (data.images?.length > 0) {
          console.log(`\n🎨 Images générées: ${data.images.length}`);
          data.images.forEach((img, i) => {
            console.log(`   [${i + 1}] ${img.url || img.s3_path}`);
          });
        }
      }
      
      console.log('\n✅ LA GÉNÉRATION D\'IMAGES FONCTIONNE!');
      console.log('   Le backend a accepté la requête et traite la génération.');
      
    } else if (response.status === 401) {
      console.log('❌ AUTHENTIFICATION ÉCHOUÉE\n');
      console.log('Causes possibles:');
      console.log('1. Token expiré → Récupérer un nouveau token');
      console.log('2. Token invalide → Vérifier que le token est complet');
      console.log('3. Mauvaise configuration Clerk entre front et back');
      
      if (data?.message) {
        console.log(`\nMessage d'erreur: ${data.message}`);
      }
      
    } else if (response.status === 402) {
      console.log('💳 CRÉDITS INSUFFISANTS\n');
      console.log('L\'utilisateur n\'a pas assez de crédits pour générer des images.');
      console.log('→ Ajouter des crédits via le Pack Créateur ou l\'admin panel');
      
    } else if (response.status === 500) {
      console.log('❌ ERREUR SERVEUR (500)\n');
      console.log('Le backend a rencontré une erreur interne.');
      console.log('Causes possibles:');
      console.log('1. API key manquante (GOOGLE_API_KEY, etc.)');
      console.log('2. Service de génération d\'images non configuré');
      console.log('3. Erreur dans le code backend');
      console.log('\n→ Consulter les logs du backend pour plus de détails');
      
      if (data?.error || data?.message) {
        console.log(`\nDétails: ${data.error || data.message}`);
      }
      
    } else if (response.status === 503) {
      console.log('⚠️ SERVICE INDISPONIBLE (503)\n');
      console.log('Le backend n\'est pas disponible ou surchargé.');
      console.log('→ Vérifier que le service backend est démarré');
      
    } else {
      console.log(`⚠️ ERREUR INATTENDUE (${response.status})\n`);
      
      if (data) {
        if (data.error) console.log(`Erreur: ${data.error}`);
        if (data.message) console.log(`Message: ${data.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR FATALE:\n');
    console.error(error);
    
    if (error.message.includes('fetch')) {
      console.log('\n⚠️ Problème de connexion réseau');
      console.log('→ Vérifier que le backend est accessible');
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FIN DU TEST');
  console.log('═══════════════════════════════════════════════════════');
}

testWithRealToken();
