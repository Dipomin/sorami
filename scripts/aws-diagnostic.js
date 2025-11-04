/**
 * Diagnostic simple de la configuration AWS
 */

console.log('🔍 Configuration AWS S3 actuelle:\n');

const config = {
  'AWS_REGION': process.env.AWS_REGION,
  'AWS_S3_BUCKET_NAME': process.env.AWS_S3_BUCKET_NAME,
  'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID ? '✅ Configuré' : '❌ Manquant',
  'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configuré' : '❌ Manquant',
};

for (const [key, value] of Object.entries(config)) {
  console.log(`${key}: ${value}`);
}

console.log('\n🌐 URL S3 générée:');
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';
const region = process.env.AWS_REGION || 'eu-north-1';
console.log(`https://${bucketName}.s3.${region}.amazonaws.com/`);

// Vérification de la région
const validRegions = ['eu-north-1', 'us-east-1', 'us-west-2', 'eu-west-1'];
if (validRegions.includes(region)) {
  console.log(`✅ Région "${region}" valide`);
} else {
  console.log(`❌ Région "${region}" potentiellement invalide`);
}