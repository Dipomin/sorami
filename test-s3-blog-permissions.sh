#!/bin/bash

# Script de test des permissions AWS pour adm-sora-blog
# Ce script aide à diagnostiquer les problèmes de permissions S3

echo "=========================================="
echo "Test des Permissions AWS S3 Blog"
echo "=========================================="
echo ""

# Charger les variables d'environnement
source .env 2>/dev/null || echo "⚠️  Fichier .env non trouvé"

BUCKET_NAME="${AWS_S3_BLOG_BUCKET_NAME:-sorami-blog}"
REGION="${AWS_REGION:-eu-north-1}"

echo "📦 Bucket: $BUCKET_NAME"
echo "🌍 Région: $REGION"
echo "👤 Access Key ID: ${AWS_BLOG_ACCESS_KEY_ID:0:20}..."
echo ""

# Configurer AWS CLI avec les credentials blog
export AWS_ACCESS_KEY_ID="$AWS_BLOG_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_BLOG_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$REGION"

# Test 1: ListBucket
echo "Test 1: s3:ListBucket"
echo "-------------------"
if aws s3 ls "s3://$BUCKET_NAME/blog/images/" 2>/dev/null; then
    echo "✅ ListBucket: OK"
else
    echo "❌ ListBucket: ÉCHOUÉ"
    echo "   Erreur: $(aws s3 ls "s3://$BUCKET_NAME/blog/images/" 2>&1 | tail -1)"
fi
echo ""

# Test 2: GetObject
echo "Test 2: s3:GetObject"
echo "-------------------"
# Créer un fichier test temporaire
echo "test" > /tmp/test-s3-blog.txt
TEST_KEY="blog/images/test-permissions-$(date +%s).txt"

# Upload d'abord (pour tester GetObject)
if aws s3 cp /tmp/test-s3-blog.txt "s3://$BUCKET_NAME/$TEST_KEY" 2>/dev/null; then
    echo "✅ PutObject: OK (fichier test uploadé)"
    
    # Essayer de lire
    if aws s3 cp "s3://$BUCKET_NAME/$TEST_KEY" /tmp/test-download.txt 2>/dev/null; then
        echo "✅ GetObject: OK"
    else
        echo "❌ GetObject: ÉCHOUÉ"
    fi
    
    # Nettoyer
    aws s3 rm "s3://$BUCKET_NAME/$TEST_KEY" 2>/dev/null
    echo "✅ DeleteObject: OK (nettoyage effectué)"
else
    echo "❌ PutObject: ÉCHOUÉ"
    echo "   Erreur: $(aws s3 cp /tmp/test-s3-blog.txt "s3://$BUCKET_NAME/$TEST_KEY" 2>&1 | tail -1)"
fi

rm -f /tmp/test-s3-blog.txt /tmp/test-download.txt
echo ""

# Test 3: Vérifier l'utilisateur IAM
echo "Test 3: Informations IAM"
echo "-------------------"
USER_INFO=$(aws sts get-caller-identity 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Credentials valides"
    echo "$USER_INFO" | grep -E "UserId|Account|Arn"
else
    echo "❌ Credentials invalides"
fi
echo ""

# Test 4: Lister les permissions attachées
echo "Test 4: Politiques IAM"
echo "-------------------"
USER_NAME="adm-sora-blog"

echo "Politiques attachées directement:"
aws iam list-attached-user-policies --user-name "$USER_NAME" 2>/dev/null | grep PolicyName || echo "❌ Impossible de lister (besoin de permissions IAM)"
echo ""

echo "Politiques inline:"
aws iam list-user-policies --user-name "$USER_NAME" 2>/dev/null | grep PolicyNames || echo "❌ Impossible de lister (besoin de permissions IAM)"
echo ""

# Résumé
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="
echo ""
echo "Pour corriger les erreurs de permissions, appliquez la politique IAM suivante"
echo "à l'utilisateur adm-sora-blog dans la console AWS:"
echo ""
echo "1. Connectez-vous à https://console.aws.amazon.com/iam/"
echo "2. Allez dans 'Users' → 'adm-sora-blog'"
echo "3. Onglet 'Permissions' → 'Add inline policy'"
echo "4. Collez la politique ci-dessous:"
echo ""
cat << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBlogBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::sorami-blog"
    },
    {
      "Sid": "ManageBlogImages",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::sorami-blog/blog/images/*"
    }
  ]
}
EOF
echo ""
echo "5. Nommez la politique: 'SoramiBlogAccess'"
echo "6. Cliquez 'Create policy'"
echo ""
echo "=========================================="
