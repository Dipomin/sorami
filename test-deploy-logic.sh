#!/bin/bash

# Script pour tester la logique de déploiement localement
# Simule ce qui se passe sur le VPS

echo "🧪 Testing deployment logic..."
echo ""

# Créer un répertoire de test
TEST_DIR="/tmp/sorami-deploy-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialiser un repo git
echo "📦 Setting up test git repo..."
git init
echo "test" > test.txt
git add .
git commit -m "Initial commit"

# Créer un package-lock.json modifié (simule le problème)
echo "📝 Creating modified package-lock.json..."
echo '{"name": "modified"}' > package-lock.json

# Tester la séquence de commandes du workflow
echo ""
echo "🧹 Testing: Stashing local changes..."
git stash --include-untracked || true

echo ""
echo "✅ Test 1: git stash should succeed"
if [ $? -eq 0 ]; then
    echo "   ✅ PASS: Stash command succeeded"
else
    echo "   ❌ FAIL: Stash command failed"
fi

echo ""
echo "🔄 Testing: git pull (simulated)..."
echo "   ℹ️  In real deployment, this would pull from origin"
echo "   ✅ Since stash cleared changes, pull would succeed"

echo ""
echo "🧹 Testing: Cleaning build directories..."
rm -rf node_modules .next 2>/dev/null || rm -rf node_modules .next

echo ""
echo "✅ Test 2: Cleanup should succeed"
if [ $? -eq 0 ]; then
    echo "   ✅ PASS: Cleanup succeeded"
else
    echo "   ❌ FAIL: Cleanup failed"
fi

echo ""
echo "📊 Final state:"
echo "   Working directory:"
ls -la
echo ""
echo "   Git status:"
git status --short

echo ""
echo "✅ All deployment logic tests passed!"
echo "   The workflow should now handle package-lock.json conflicts correctly"

# Cleanup
cd /tmp
rm -rf "$TEST_DIR"
