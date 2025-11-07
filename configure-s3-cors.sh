#!/bin/bash

# Script pour configurer CORS sur le bucket sorami-blog
# Ce script permet au navigateur d'accéder aux images S3 via Canvas (pour le crop)

BUCKET_NAME="sorami-blog"
REGION="eu-north-1"

echo "📦 Configuration CORS pour le bucket: $BUCKET_NAME"
echo "🌍 Région: $REGION"
echo ""

# Créer le fichier de configuration CORS
cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
      "AllowedOrigins": [
        "http://localhost:3001",
        "http://localhost:3000",
        "https://sorami.qg-it.net",
        "https://*.qg-it.net"
      ],
      "ExposeHeaders": ["ETag", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

echo "📄 Configuration CORS créée:"
cat /tmp/cors-config.json
echo ""

# Appliquer la configuration CORS
echo "🚀 Application de la configuration CORS..."
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file:///tmp/cors-config.json \
  --region $REGION

if [ $? -eq 0 ]; then
  echo "✅ Configuration CORS appliquée avec succès!"
  echo ""
  echo "🔍 Vérification de la configuration..."
  aws s3api get-bucket-cors --bucket $BUCKET_NAME --region $REGION
else
  echo "❌ Erreur lors de l'application de la configuration CORS"
  echo "Assurez-vous que:"
  echo "  1. AWS CLI est configuré avec les bonnes credentials"
  echo "  2. Vous avez les permissions s3:PutBucketCORS sur le bucket"
  echo "  3. Le bucket existe bien dans la région $REGION"
fi

# Nettoyer
rm /tmp/cors-config.json

echo ""
echo "📝 Note: Cette configuration permet au navigateur d'exporter"
echo "   les images S3 via Canvas (nécessaire pour le rognage)"
