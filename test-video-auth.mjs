#!/usr/bin/env node

/**
 * Test de l'authentification et de la génération de vidéos
 */

const BASE_URL = 'http://localhost:3000';

// Utiliser un utilisateur de test existant
const TEST_USER_EMAIL = 'test@sorami.app'; // Remplacer par un vrai email de test

async function testVideoGeneration() {
  console.log('🧪 Test de génération de vidéo avec authentification\n');

  // Étape 1: Vérifier que l'utilisateur est connecté
  console.log('1️⃣ Vérification de la session...');
  
  // En développement local, on doit être connecté via le navigateur
  // Ce test ne fonctionnera que si on copie les cookies de session
  console.log('⚠️  IMPORTANT: Vous devez être connecté dans le navigateur');
  console.log('⚠️  Copiez les cookies __clerk_db_jwt et __session depuis les DevTools');
  console.log('');
  
  // Pour tester, on va faire une requête sans authentification
  // et voir l'erreur
  const videoRequest = {
    prompt: "Un chat qui joue avec une pelote de laine",
    aspect_ratio: "16:9",
    duration_seconds: 8,
    number_of_videos: 1,
    person_generation: "ALLOW_ALL"
  };

  console.log('2️⃣ Tentative de génération de vidéo...');
  console.log('📦 Payload:', JSON.stringify(videoRequest, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/videos/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pas de cookie - on devrait avoir une erreur 401
      },
      body: JSON.stringify(videoRequest),
    });

    console.log('\n📊 Statut HTTP:', response.status, response.statusText);

    const result = await response.json();
    console.log('📄 Réponse:', JSON.stringify(result, null, 2));

    if (response.status === 401) {
      console.log('\n✅ CORRECT: L\'API retourne bien 401 Unauthorized sans authentification');
      console.log('\n📝 Pour tester avec authentification:');
      console.log('   1. Connectez-vous sur http://localhost:3000/sign-in');
      console.log('   2. Ouvrez les DevTools (F12) → Application → Cookies');
      console.log('   3. Copiez les valeurs de __clerk_db_jwt et __session');
      console.log('   4. Modifiez ce script pour inclure ces cookies');
    } else if (response.status === 402) {
      console.log('\n⚠️  ATTENTION: Crédits insuffisants');
    } else if (response.ok) {
      console.log('\n✅ SUCCÈS: Vidéo en cours de génération');
      console.log('Job ID:', result.job_id);
    } else {
      console.log('\n❌ ERREUR:', result.message || result.error);
    }

  } catch (error) {
    console.error('\n❌ Erreur réseau:', error.message);
  }
}

// Fonction pour tester avec des cookies Clerk
async function testWithCookies(clerkDbJwt, clerkSession) {
  console.log('\n🔐 Test avec cookies Clerk...\n');

  const videoRequest = {
    prompt: "Un chien qui court dans un parc",
    aspect_ratio: "16:9",
    duration_seconds: 8,
    number_of_videos: 1,
    person_generation: "ALLOW_ALL"
  };

  try {
    const response = await fetch(`${BASE_URL}/api/videos/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `__clerk_db_jwt=${clerkDbJwt}; __session=${clerkSession}`,
      },
      body: JSON.stringify(videoRequest),
    });

    console.log('📊 Statut HTTP:', response.status, response.statusText);

    const result = await response.json();
    console.log('📄 Réponse:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCÈS: Génération de vidéo démarrée');
      console.log('Job ID:', result.job_id);
      return result.job_id;
    } else {
      console.log('\n❌ ERREUR:', result.message || result.error);
      return null;
    }

  } catch (error) {
    console.error('\n❌ Erreur réseau:', error.message);
    return null;
  }
}

// Programme principal
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test d\'authentification - Génération de vidéos');
  console.log('═══════════════════════════════════════════════════════\n');

  await testVideoGeneration();

  // Si vous avez les cookies, décommentez la ligne suivante et remplacez par vos valeurs
  // await testWithCookies('VOTRE_CLERK_DB_JWT', 'VOTRE_SESSION_TOKEN');

  console.log('\n═══════════════════════════════════════════════════════');
}

main().catch(console.error);
