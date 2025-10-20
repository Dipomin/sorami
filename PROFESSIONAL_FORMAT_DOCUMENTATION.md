# 📚 Mise en Forme Professionnelle avec IA - Documentation

## Vue d'ensemble

La fonctionnalité "Mise en forme professionnelle" utilise **GPT-4 Mini** d'OpenAI pour transformer automatiquement un livre brut en un manuscrit parfaitement formaté selon les standards de l'édition professionnelle.

## Fonctionnalités

### 🎯 Objectif

Transformer un livre avec tous ses chapitres en un document professionnel prêt à :
- 📖 Être imprimé
- 📱 Être publié en eBook (EPUB, PDF)
- 📄 Être soumis à un éditeur

### ✨ Standards de Formatage Appliqués

#### Typographie
- **Police principale** : Garamond ou Times New Roman, 12pt
- **Interligne** : 1,5
- **Marges** : 2,5 cm de chaque côté
- **Justification** : Texte aligné à gauche et à droite

#### Structure
- **Page de titre** : Titre du livre + nom de l'auteur
- **Table des matières** : Générée automatiquement
- **Chapitres** :
  - Titres en MAJUSCULES, centrés, 16pt, gras
  - Saut de page avant chaque chapitre
  - Numérotation automatique

#### Paragraphes et Texte
- **Indentation** : 1 cm pour chaque paragraphe
- **Espacement** : Pas de ligne blanche entre paragraphes
- **Citations** : En retrait, italique
- **Dialogues** : Tirets cadratins (—) avec retour à la ligne

#### Pagination
- **Numérotation** : Automatique
- **Début** : Après les pages liminaires
- **Position** : Centré en bas de page

## Architecture Technique

### Route API

**Endpoint** : `POST /api/books/[id]/format`

#### Request
```typescript
POST /api/books/[bookId]/format
Headers:
  Authorization: Bearer [Clerk token]
```

#### Response Success (200)
```typescript
{
  success: true,
  formattedContent: string, // HTML formaté
  metadata: {
    originalLength: number,
    formattedLength: number,
    chaptersCount: number,
    tokensUsed: number
  }
}
```

#### Response Error (400/401/403/500)
```typescript
{
  error: string,
  details?: string
}
```

### Flux de Traitement

```
1. Utilisateur clique sur "Mise en forme pro (IA)"
   ↓
2. Frontend envoie POST /api/books/[id]/format
   ↓
3. Backend récupère le livre + tous les chapitres
   ↓
4. Construction du texte complet (titre, auteur, chapitres)
   ↓
5. Appel à OpenAI GPT-4 Mini avec prompt professionnel
   ↓
6. Réception du contenu HTML formaté
   ↓
7. Sauvegarde dans book.content
   ↓
8. Retour au frontend avec le contenu formaté
   ↓
9. Affichage dans un dialog modal
   ↓
10. Options: Copier HTML ou Télécharger
```

### Modèle IA Utilisé

- **Modèle** : `gpt-4o-mini`
- **Temperature** : 0.3 (cohérence > créativité)
- **Max Tokens** : 16,000 (suffisant pour livres complets)
- **Coût approximatif** : ~$0.01-0.05 par livre (selon longueur)

### Prompt System

Le prompt système complet de 1,500+ caractères définit :
- Le rôle : Expert en édition et typographie
- Le contexte : Standards de l'édition professionnelle
- Les consignes : 15+ règles de formatage détaillées
- La tâche : Génération HTML avec styles CSS inline

## Interface Utilisateur

### Accès à la Fonctionnalité

**Depuis la page `/books`** :
1. Cliquer sur le menu `⋮` d'un livre
2. Sélectionner "Mise en forme pro (IA)" (icône ✨)

### États Visuels

#### Bouton Normal
```
✨ Mise en forme pro (IA)
```

#### Bouton en Cours
```
⏳ Mise en forme...
[bouton désactivé]
```

### Dialog de Résultat

```
┌─────────────────────────────────────────┐
│ ✨ Livre formaté professionnellement    │
│ ─────────────────────────────────────── │
│ Votre livre a été mis en forme selon    │
│ les standards professionnels...         │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  [Contenu HTML formaté affiché]    │ │
│ │                                     │ │
│ │  PAGE DE TITRE                      │ │
│ │  Mon Livre                          │
│ │  par Jean Dupont                    │
│ │                                     │ │
│ │  TABLE DES MATIÈRES                 │
│ │  Chapitre 1 ............. p. 3     │ │
│ │  Chapitre 2 ............. p. 15    │ │
│ │                                     │ │
│ │  CHAPITRE 1                         │ │
│ │  INTRODUCTION                       │ │
│ │                                     │ │
│ │      Lorem ipsum dolor sit amet... │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [📋 Copier] [📥 Télécharger] [Fermer]  │
└─────────────────────────────────────────┘
```

### Actions Disponibles

1. **📋 Copier le HTML**
   - Copie le HTML formaté dans le presse-papiers
   - Notification : "Contenu copié !"

2. **📥 Télécharger HTML**
   - Télécharge un fichier `.html`
   - Nom : `[titre-du-livre]-formate.html`
   - Compatible avec Word, LibreOffice, navigateurs

3. **Fermer**
   - Ferme le dialog
   - Le contenu reste sauvegardé dans la BD

## Sécurité

### Authentification
- ✅ Middleware Clerk protège `/books`
- ✅ `requireAuth()` dans la route API
- ✅ Vérification `authorId === user.id`

### Validation
- ✅ Vérification de l'existence du livre
- ✅ Vérification des permissions utilisateur
- ✅ Gestion des erreurs OpenAI

### Rate Limiting
⚠️ **TODO** : Implémenter rate limiting pour éviter les abus
- Limiter à 5 formatages par heure par utilisateur
- Utiliser Redis ou Upstash pour le compteur

## Configuration

### Variables d'Environnement Requises

```bash
# .env.local
OPENAI_API_KEY=sk-proj-xxx... # Clé API OpenAI
```

### Installation des Dépendances

```bash
npm install openai
```

### Vérification de la Configuration

```typescript
// Tester si la clé API est définie
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY non défini');
}
```

## Coûts OpenAI

### Modèle : gpt-4o-mini

**Tarifs** (au 20 octobre 2025) :
- Input : $0.150 / 1M tokens
- Output : $0.600 / 1M tokens

**Estimations par livre** :

| Longueur Livre | Tokens Input | Tokens Output | Coût Total |
|----------------|--------------|---------------|------------|
| Court (5K mots) | ~7,000 | ~8,000 | ~$0.006 |
| Moyen (15K mots) | ~20,000 | ~25,000 | ~$0.018 |
| Long (50K mots) | ~65,000 | ~80,000 | ~$0.058 |

**Note** : Ces coûts sont approximatifs et dépendent de la complexité du texte.

## Monitoring et Logs

### Logs Console Structurés

```typescript
console.log('📚 [Format API] Début de la mise en forme:', bookId);
console.log('📖 [Format API] Livre trouvé:', book.title);
console.log('📄 [Format API] Nombre de chapitres:', book.chapters.length);
console.log('🤖 [Format API] Appel à OpenAI GPT-4 Mini...');
console.log('📊 [Format API] Taille du texte:', fullText.length, 'caractères');
console.log('✅ [Format API] Mise en forme réussie');
console.log('💰 [Format API] Tokens utilisés:', usage);
console.log('💾 [Format API] Version formatée sauvegardée');
```

### Métriques à Tracker

- ✅ Nombre de formatages par jour
- ✅ Tokens moyens utilisés
- ✅ Temps de traitement moyen
- ✅ Taux d'erreur
- ⚠️ **TODO** : Implémenter avec service analytics

## Limitations Actuelles

### Techniques
1. **Max Tokens** : 16,000 tokens = ~50,000 mots
   - Livres > 50K mots seront tronqués
   - **Solution** : Chunking par chapitres

2. **Timeout** : Pas de timeout défini
   - Risque de timeout pour très longs livres
   - **Solution** : Ajouter timeout 60s

3. **Retry Logic** : Pas de retry automatique
   - Échec = erreur définitive
   - **Solution** : Implémenter exponential backoff

### UX
1. **Pas de preview** : L'utilisateur ne voit pas avant confirmation
   - **Solution** : Ajouter mode preview

2. **Pas de personnalisation** : Format fixe
   - **Solution** : Ajouter options (police, marges, style)

3. **Feedback minimal** : Spinner simple
   - **Solution** : Progress bar avec étapes

## Améliorations Futures

### Court Terme (v1.1)
- [ ] Ajouter toast notifications (succès/erreur)
- [ ] Progress bar pendant le traitement
- [ ] Retry automatique en cas d'erreur
- [ ] Rate limiting (5/heure)

### Moyen Terme (v1.2)
- [ ] Chunking automatique pour livres > 50K mots
- [ ] Options de personnalisation (police, style)
- [ ] Preview avant confirmation
- [ ] Export direct en PDF/DOCX depuis le formaté
- [ ] Historique des versions formatées

### Long Terme (v2.0)
- [ ] Templates de mise en page multiples (roman, essai, manuel)
- [ ] Édition WYSIWYG du formaté
- [ ] Génération de couverture IA
- [ ] Comparaison avant/après
- [ ] Analytics détaillées

## Troubleshooting

### Erreur : "OPENAI_API_KEY non défini"
**Solution** :
```bash
# Ajouter dans .env.local
OPENAI_API_KEY=sk-proj-xxx...

# Redémarrer le serveur
npm run dev
```

### Erreur : "Rate limit exceeded"
**Cause** : Trop de requêtes à OpenAI
**Solution** :
- Attendre 1 minute
- Vérifier les limites de votre compte OpenAI
- Upgrader le plan OpenAI si nécessaire

### Erreur : "Book not found"
**Cause** : Le livre n'existe pas ou pas de permission
**Solution** :
- Vérifier que le livre existe
- Vérifier que l'utilisateur est le propriétaire

### Contenu formaté vide
**Cause** : Erreur OpenAI ou prompt mal formé
**Solution** :
- Vérifier les logs console backend
- Vérifier que le livre a des chapitres avec du contenu
- Tester avec un livre plus court

### Timeout
**Cause** : Livre trop long ou API OpenAI lente
**Solution** :
- Réduire la taille du livre (< 50K mots)
- Réessayer plus tard
- Implémenter chunking

## Tests

### Test Manuel

```bash
# 1. Lancer le serveur
npm run dev

# 2. Aller sur /books
open http://localhost:3001/books

# 3. Cliquer sur un livre → ⋮ → "Mise en forme pro (IA)"

# 4. Attendre le traitement (15-60 secondes)

# 5. Vérifier le dialog avec le contenu formaté

# 6. Tester les boutons :
#    - Copier HTML
#    - Télécharger HTML
#    - Fermer
```

### Test API avec cURL

```bash
# Récupérer le token Clerk depuis DevTools

curl -X POST http://localhost:3001/api/books/[BOOK_ID]/format \
  -H "Authorization: Bearer [CLERK_TOKEN]" \
  -H "Content-Type: application/json"
```

### Tests à Implémenter

- [ ] Test unitaire : `formatBookContent()`
- [ ] Test intégration : Route API complète
- [ ] Test E2E : Flux complet UI → API → Dialog
- [ ] Test performance : Livre de 50K mots
- [ ] Test erreur : Clé API invalide
- [ ] Test sécurité : Accès non autorisé

## Support

### Documentation Liée
- `/BOOKS_PAGE_DOCUMENTATION.md` - Page books
- `/.github/copilot-instructions.md` - Guidelines projet
- OpenAI Docs : https://platform.openai.com/docs

### Contact
- Issues GitHub : [Lien vers repo]
- Email support : support@example.com

---

**Version** : 1.0.0  
**Date** : 2024-01-XX  
**Auteur** : Agent IA GitHub Copilot  
**Statut** : ✅ Production Ready (avec limitations)
