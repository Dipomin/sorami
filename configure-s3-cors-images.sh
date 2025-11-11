#!/bin/bash

# Script pour configurer CORS sur le bucket sorami-generated-content-9872
# Ce script permet au navigateur d'accéder aux images S3 générées

BUCKET_NAME="sorami-generated-content-9872"
REGION="eu-north-1"

echo "📦 Configuration CORS pour le bucket: $BUCKET_NAME"
echo "🌍 Région: $REGION"
echo ""

# Créer le fichier de configuration CORS
cat > /tmp/cors-config-images.json <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sorami.qg-it.net",
        "https://*.qg-it.net"
      ],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

echo "📄 Configuration CORS créée:"
cat /tmp/cors-config-images.json
echo ""

# Appliquer la configuration CORS
echo "🚀 Application de la configuration CORS..."
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file:///tmp/cors-config-images.json \
  --region $REGION

if [ $? -eq 0 ]; then
  echo "✅ Configuration CORS appliquée avec succès!"
  echo ""
  echo "🔍 Vérification de la configuration..."
  aws s3api get-bucket-cors --bucket $BUCKET_NAME --region $REGION
  echo ""
  echo "🎉 Le bucket $BUCKET_NAME est maintenant accessible depuis localhost:3000"
else
  echo "❌ Erreur lors de l'application de la configuration CORS"
  echo ""
  echo "💡 Assurez-vous que:"
  echo "   - AWS CLI est installé (aws --version)"
  echo "   - Vos credentials AWS sont configurées (aws configure)"
  echo "   - Vous avez les permissions sur le bucket $BUCKET_NAME"
  exit 1
fi
