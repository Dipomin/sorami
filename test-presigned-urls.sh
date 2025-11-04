#!/bin/bash

# Test des URLs présignées S3
echo "🧪 Test des URLs présignées S3"
echo "================================"

BASE_URL="http://localhost:3001"

# Test avec une clé S3 valide (exemple)
echo ""
echo "📝 Test avec clé S3 exemple..."
curl -s "$BASE_URL/api/s3/presigned-url?key=blog/images/test.jpg" | jq .

# Test avec paramètre manquant
echo ""
echo "❌ Test sans paramètre key..."
curl -s "$BASE_URL/api/s3/presigned-url" | jq .

# Test avec clé vide
echo ""
echo "❌ Test avec clé vide..."
curl -s "$BASE_URL/api/s3/presigned-url?key=" | jq .

echo ""
echo "✅ Tests terminés"