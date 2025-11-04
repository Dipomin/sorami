/**
 * Script de vérification de la configuration AWS S3
 * Usage: npm run check-aws-config
 */

import { S3Client, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function checkAWSConfig() {
  console.log('🔍 Vérification de la configuration AWS S3...\n');

  // Vérifier les variables d'environnement
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];

  console.log('📋 Variables d\'environnement:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: ${envVar === 'AWS_SECRET_ACCESS_KEY' ? '***' : value}`);
    } else {
      console.log(`  ❌ ${envVar}: MANQUANT`);
      return;
    }
  }

  // Validation de la région
  const region = process.env.AWS_REGION;
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
    'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
    'ap-south-1', 'ca-central-1', 'sa-east-1'
  ];

  console.log('\n🌍 Validation de la région:');
  if (validRegions.includes(region!)) {
    console.log(`  ✅ Région "${region}" valide`);
  } else {
    console.log(`  ❌ Région "${region}" invalide`);
    console.log(`  💡 Régions valides: ${validRegions.join(', ')}`);
    return;
  }

  // Tester la connexion S3
  console.log('\n🔗 Test de connexion S3:');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  try {
    // Test 1: Vérifier l'accès au bucket
    console.log(`  🪣 Test d'accès au bucket "${bucketName}"...`);
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`  ✅ Accès au bucket réussi`);

    // Test 2: Lister les objets (permissions de lecture)
    console.log(`  📋 Test de listage des objets...`);
    const listResult = await s3Client.send(new ListObjectsV2Command({ 
      Bucket: bucketName,
      MaxKeys: 5 
    }));
    console.log(`  ✅ Listage réussi (${listResult.KeyCount || 0} objets trouvés)`);

    // URL de test
    const testUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    console.log(`  🌐 URL de base: ${testUrl}`);

    console.log('\n🎉 Configuration AWS S3 validée avec succès !');

  } catch (error: any) {
    console.log(`  ❌ Erreur de connexion S3:`, error.message);
    
    if (error.name === 'NoSuchBucket') {
      console.log(`  💡 Le bucket "${bucketName}" n'existe pas ou n'est pas accessible`);
    } else if (error.name === 'CredentialsError') {
      console.log(`  💡 Problème d'authentification AWS`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`  💡 Problème de résolution DNS - vérifiez la région`);
    }
    
    console.log('\n🛠️ Actions recommandées:');
    console.log('  1. Vérifiez vos clés AWS dans la console AWS');
    console.log('  2. Assurez-vous que le bucket existe et est dans la bonne région');
    console.log('  3. Vérifiez les permissions IAM');
  }
}

// Démarrer la vérification
checkAWSConfig().catch(console.error);