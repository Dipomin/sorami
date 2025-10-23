# 🧪 Guide de Test - Mise en Forme Professionnelle

## Prérequis

### 1. Clé API OpenAI

Vous devez avoir une clé API OpenAI valide. Si vous n'en avez pas :

1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé API
3. Copier la clé (commence par `sk-proj-...`)

### 2. Configuration

```bash
# Ajouter dans .env.local
echo "OPENAI_API_KEY=sk-proj-votre-cle-ici" >> .env.local

# Redémarrer le serveur Next.js
# Arrêter avec Ctrl+C puis:
npm run dev
```

### 3. Vérification

```bash
# Vérifier que la variable est bien définie
grep OPENAI_API_KEY .env.local
```

## Test Complet (5 minutes)

### Étape 1 : Accéder à la Page Books

```bash
# Ouvrir dans le navigateur
open http://localhost:3001/books
```

**Vérifications** :
- ✅ La page se charge sans erreur
- ✅ Vous êtes connecté (icône utilisateur en haut)
- ✅ Au moins un livre est visible dans la sidebar

**Si pas de livres** :
1. Aller sur http://localhost:3001/create
2. Créer un livre de test avec 2-3 chapitres
3. Revenir sur `/books`

### Étape 2 : Lancer la Mise en Forme

1. **Sélectionner un livre** dans la sidebar (clic dessus)
2. **Ouvrir le menu** : Cliquer sur `⋮` (3 points verticaux)
3. **Cliquer** sur "✨ Mise en forme pro (IA)"

**Comportement attendu** :
- Le bouton affiche "⏳ Mise en forme..."
- Le bouton est désactivé (grisé)
- Attendre 15-60 secondes (selon la taille du livre)

### Étape 3 : Vérifier le Résultat

**Un dialog doit s'ouvrir avec** :
- ✅ Titre : "✨ Livre formaté professionnellement"
- ✅ Description explicative
- ✅ Zone de contenu scrollable avec le HTML formaté
- ✅ 3 boutons : "📋 Copier", "📥 Télécharger", "Fermer"

**Vérifier le contenu formaté** :
- ✅ Page de titre (titre du livre + auteur)
- ✅ Table des matières avec liste des chapitres
- ✅ Chapitres en MAJUSCULES
- ✅ Texte justifié et indenté
- ✅ Style professionnel (Garamond, interligne 1.5)

### Étape 4 : Tester les Actions

#### Test 1 : Copier le HTML
1. Cliquer sur "📋 Copier le HTML"
2. **Attendu** : Alert "Contenu copié dans le presse-papiers !"
3. Ouvrir un éditeur de texte
4. Coller (Cmd+V)
5. **Vérifier** : Le HTML complet est collé

#### Test 2 : Télécharger HTML
1. Cliquer sur "📥 Télécharger HTML"
2. **Attendu** : Téléchargement d'un fichier `[titre-livre]-formate.html`
3. Ouvrir le fichier téléchargé dans un navigateur
4. **Vérifier** : 
   - Le livre est affiché avec mise en forme
   - Page de titre visible
   - Table des matières cliquable
   - Chapitres bien formatés

#### Test 3 : Fermer
1. Cliquer sur "Fermer"
2. **Attendu** : Le dialog se ferme
3. Réouvrir le menu et recliquer sur "Mise en forme pro"
4. **Vérifier** : Le contenu formaté est réaffiché (depuis la BD)

### Étape 5 : Vérifier les Logs

**Ouvrir la console développeur** (F12) :

```
Console → Devrait afficher :
✨ Début de la mise en forme professionnelle du livre: [id]
```

**Ouvrir les logs serveur** (terminal où tourne `npm run dev`) :

```
Devrait afficher :
📚 [Format API] Début de la mise en forme professionnelle du livre: [id]
📖 [Format API] Livre trouvé: [titre]
📄 [Format API] Nombre de chapitres: [X]
🤖 [Format API] Appel à OpenAI GPT-4 Mini...
📊 [Format API] Taille du texte: [X] caractères
✅ [Format API] Mise en forme réussie
📊 [Format API] Taille du contenu formaté: [X] caractères
💰 [Format API] Tokens utilisés: { prompt: X, completion: X, total: X }
💾 [Format API] Version formatée sauvegardée dans la base de données
```

## Tests Avancés

### Test 6 : Livre Long (> 10 chapitres)

1. Créer ou sélectionner un livre avec 10+ chapitres
2. Lancer la mise en forme
3. **Vérifier** : 
   - Temps de traitement plus long (30-60s)
   - Tous les chapitres sont inclus
   - Table des matières complète

### Test 7 : Livre avec Caractères Spéciaux

1. Créer un livre avec des caractères spéciaux :
   - Accents : é, è, ê, à, ù
   - Guillemets : « », " "
   - Tirets : —, –, -
2. Lancer la mise en forme
3. **Vérifier** : Les caractères sont correctement préservés

### Test 8 : Livre avec HTML dans le Contenu

1. Sélectionner un livre dont les chapitres contiennent du HTML (balises `<p>`, `<strong>`, etc.)
2. Lancer la mise en forme
3. **Vérifier** : Le HTML est nettoyé et reformaté proprement

### Test 9 : Plusieurs Livres Successifs

1. Formater le livre A
2. Fermer le dialog
3. Sélectionner le livre B
4. Formater le livre B
5. **Vérifier** : Les deux livres sont distincts et bien formatés

## Cas d'Erreur à Tester

### Erreur 1 : Clé API Invalide

**Setup** :
```bash
# Modifier temporairement .env.local
OPENAI_API_KEY=sk-invalid-key
```

**Test** :
1. Redémarrer le serveur
2. Lancer la mise en forme
3. **Attendu** : Alert avec message d'erreur

**Cleanup** :
```bash
# Restaurer la vraie clé
OPENAI_API_KEY=sk-proj-votre-vraie-cle
```

### Erreur 2 : Livre Sans Chapitres

**Setup** :
1. Créer un livre vide (sans chapitres)

**Test** :
1. Essayer de formater ce livre
2. **Attendu** : 
   - Soit erreur explicite
   - Soit formatage avec seulement titre et auteur

### Erreur 3 : Timeout OpenAI

**Note** : Difficile à reproduire, mais si ça arrive :
- **Comportement** : Erreur après 30-60s
- **Solution** : Réessayer avec un livre plus court

## Vérifications Base de Données

### Vérifier que le contenu est sauvegardé

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Aller sur le modèle "Book"
# Sélectionner le livre formaté
# Vérifier que le champ "content" contient le HTML formaté
```

## Performance

### Mesurer le Temps de Traitement

**Avec les logs serveur** :
1. Noter l'heure du "Début de la mise en forme"
2. Noter l'heure du "Mise en forme réussie"
3. Calculer la différence

**Temps attendus** :
- Petit livre (< 5K mots) : 10-20s
- Moyen livre (5-20K mots) : 20-40s
- Grand livre (20-50K mots) : 40-60s

### Mesurer les Tokens

**Dans les logs serveur** :
```
💰 [Format API] Tokens utilisés: { 
  prompt: 12000, 
  completion: 15000, 
  total: 27000 
}
```

**Calculer le coût** :
```
Coût = (prompt_tokens / 1M × $0.150) + (completion_tokens / 1M × $0.600)
     = (12000 / 1M × 0.15) + (15000 / 1M × 0.60)
     = $0.0018 + $0.009
     = $0.0108 (~1 centime)
```

## Checklist Finale

### Fonctionnel
- [ ] Bouton "Mise en forme pro" visible dans le menu
- [ ] Icône ✨ (Sparkles) affichée
- [ ] Bouton désactivé pendant le traitement
- [ ] Dialog s'ouvre avec le résultat
- [ ] Contenu formaté affiché correctement
- [ ] Bouton "Copier" fonctionne
- [ ] Bouton "Télécharger" fonctionne
- [ ] Fichier téléchargé s'ouvre dans le navigateur
- [ ] Contenu sauvegardé dans la BD

### Logs
- [ ] Logs console frontend présents
- [ ] Logs serveur structurés avec emojis
- [ ] Tokens utilisés affichés
- [ ] Erreurs capturées et loguées

### Performance
- [ ] Traitement < 60s pour livres normaux
- [ ] Pas de freeze UI pendant le traitement
- [ ] Spinner visible pendant l'attente

### Sécurité
- [ ] Impossible de formater le livre d'un autre utilisateur
- [ ] Erreur si non connecté
- [ ] Token Clerk validé côté serveur

## Rapport de Test

Après avoir terminé les tests, remplissez ce rapport :

```markdown
# Rapport de Test - Mise en Forme Professionnelle

**Date** : [Date]
**Testeur** : [Nom]
**Version** : 1.0.0

## Résultats

| Test | Statut | Notes |
|------|--------|-------|
| Accès page books | ✅/❌ | |
| Bouton visible | ✅/❌ | |
| Formatage livre | ✅/❌ | Temps: Xs |
| Dialog affichage | ✅/❌ | |
| Copier HTML | ✅/❌ | |
| Télécharger HTML | ✅/❌ | |
| Logs serveur | ✅/❌ | |
| Sauvegarde BD | ✅/❌ | |

## Bugs Trouvés

1. [Description du bug 1]
2. [Description du bug 2]

## Améliorations Suggérées

1. [Suggestion 1]
2. [Suggestion 2]

## Conclusion

[Tests passés/échoués]
[Prêt pour production : Oui/Non]
```

---

**Bon test ! 🧪✨**
