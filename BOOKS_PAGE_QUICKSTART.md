# 🚀 Guide de Démarrage Rapide - Page Books

## Lancement en Mode Développement

```bash
# 1. Naviguer vers le projet
cd /Users/inoverfly/Documents/qg-projects/sorami/front

# 2. Nettoyer le cache (si build précédent échoué)
rm -rf .next node_modules/.cache

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir dans le navigateur
# → http://localhost:3001/books
```

## Premier Test

### 1. Connexion
- Accédez à `http://localhost:3001/sign-in`
- Connectez-vous avec votre compte Clerk
- Vous serez redirigé vers `/books`

### 2. Exploration de l'Interface

#### Sidebar (Gauche)
- 🔍 Recherchez un livre en tapant dans la barre
- 🎯 Filtrez par statut: Tous / Publiés / Brouillons
- 📖 Cliquez sur un livre pour le sélectionner
- ⋮ Cliquez sur les 3 points pour voir les actions

#### Liste des Chapitres (Centre)
- Cliquez sur un chapitre pour l'afficher
- Voyez le nombre de mots par chapitre

#### Éditeur (Droite)
- Lisez le contenu du chapitre sélectionné
- Cliquez sur "Modifier" pour passer en mode édition
- Utilisez la barre d'outils Tiptap pour formater
- Cliquez sur "Sauvegarder" pour enregistrer

### 3. Test des Fonctionnalités

#### Éditer un Chapitre
```
1. Sélectionner un livre dans la sidebar
2. Sélectionner un chapitre
3. Cliquer sur "Modifier"
4. Modifier le titre dans l'input
5. Modifier le contenu avec Tiptap
6. Cliquer sur "Sauvegarder"
✅ Le chapitre est mis à jour !
```

#### Exporter un Livre
```
1. Cliquer sur ⋮ à côté d'un livre
2. Choisir "Exporter en PDF" (ou EPUB/DOCX)
✅ Le fichier est téléchargé !
```

#### Supprimer un Livre
```
1. Cliquer sur ⋮ à côté d'un livre
2. Choisir "Supprimer"
3. Confirmer dans le dialog
✅ Le livre est supprimé !
```

## Test des Filtres

### Recherche
```
1. Taper "React" dans la barre de recherche
✅ Seuls les livres contenant "React" s'affichent
```

### Filtres de Statut
```
1. Cliquer sur "Publiés"
✅ Seuls les livres avec status=PUBLISHED s'affichent

2. Cliquer sur "Brouillons"
✅ Seuls les livres avec status=DRAFT s'affichent

3. Cliquer sur "Tous"
✅ Tous les livres réapparaissent
```

## Test de l'Éditeur Tiptap

### Formattage du Texte
```
1. Passer en mode édition
2. Sélectionner du texte
3. Tester les boutons:
   - [B] Gras
   - [I] Italique
   - [U] Souligné
   - [S] Barré
   - [Code] Code
   - [🎨] Surlignage
```

### Titres
```
1. Cliquer sur une ligne
2. Cliquer sur [H1], [H2], ou [H3]
✅ La ligne devient un titre
```

### Listes
```
1. Cliquer sur une ligne
2. Cliquer sur [•] pour liste à puces
   OU [1.] pour liste numérotée
✅ La liste est créée
```

### Alignement
```
1. Cliquer sur une ligne
2. Cliquer sur [←], [→], [↔], ou [≡]
✅ Le texte est aligné
```

### Liens
```
1. Sélectionner du texte
2. Cliquer sur [🔗]
3. Entrer l'URL dans le prompt
✅ Le lien est créé
```

### Historique
```
1. Faire des modifications
2. Cliquer sur [↶] pour annuler
3. Cliquer sur [↷] pour rétablir
✅ Historique fonctionne
```

## Vérification des API

### Logs Console
Ouvrez la console développeur (F12) pour voir :
- 📥 GET `/api/books` lors du chargement
- 💾 PUT `/api/chapters/[id]` lors de la sauvegarde
- 🗑️ DELETE `/api/books/[id]` lors de la suppression
- 📥 GET `/api/books/[id]/export` lors de l'export

### Exemple de Réponse API

#### GET /api/books
```json
{
  "books": [
    {
      "id": "book-id-1",
      "title": "Mon Premier Livre",
      "description": "Description...",
      "status": "PUBLISHED",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z",
      "chapters": [
        {
          "id": "chapter-id-1",
          "title": "Introduction",
          "content": "<p>Contenu HTML...</p>",
          "order": 1
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Problème: Aucun livre ne s'affiche
**Solution**:
```
1. Vérifier que vous êtes connecté (icône utilisateur en haut à droite)
2. Vérifier la console pour erreurs API
3. Aller sur /create pour créer un livre
```

### Problème: Erreur lors de la sauvegarde
**Solution**:
```
1. Vérifier la console pour l'erreur exacte
2. Vérifier que le chapitre appartient à votre utilisateur
3. Vérifier que Prisma est connecté à la DB
```

### Problème: L'éditeur ne charge pas
**Solution**:
```
1. Vérifier que les packages Tiptap sont installés:
   npm list @tiptap/react
   
2. Si manquant, réinstaller:
   npm install @tiptap/react @tiptap/starter-kit
```

### Problème: Les exports ne fonctionnent pas
**Note**: C'est normal ! L'export est actuellement un placeholder (texte simple).

**Pour implémenter les vrais exports**:
```bash
# Pour PDF
npm install puppeteer

# Pour EPUB
npm install epub-gen-memory

# Pour DOCX
npm install docx
```

## Commandes Utiles

```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Lancer les tests
npm test

# Build de production
npm run build

# Voir les packages installés
npm list @tiptap/react
npm list @radix-ui/react-dialog

# Nettoyer le cache
rm -rf .next node_modules/.cache

# Redémarrer Prisma
npx prisma generate
npx prisma db push
```

## Prochaines Actions Recommandées

### 1. Tester Complètement (30 min)
- ✅ Charger la page
- ✅ Sélectionner différents livres
- ✅ Éditer plusieurs chapitres
- ✅ Tester tous les boutons de formatage
- ✅ Tester la recherche et filtres
- ✅ Tester la suppression

### 2. Ajouter Toast Notifications (15 min)
```bash
npm install react-hot-toast

# Puis ajouter dans layout.tsx:
import { Toaster } from 'react-hot-toast';

# Et dans BooksPage:
import toast from 'react-hot-toast';
toast.success('Chapitre sauvegardé !');
```

### 3. Implémenter Autosave (30 min)
```typescript
// Ajouter dans BooksPage
useEffect(() => {
  if (!editMode) return;
  
  const timer = setTimeout(() => {
    handleSaveChapter();
  }, 30000); // 30 secondes
  
  return () => clearTimeout(timer);
}, [editedContent, editedTitle]);
```

### 4. Implémenter Exports Réels (2h)
Voir `/BOOKS_PAGE_DOCUMENTATION.md` section "Améliorations Futures"

## Ressources

- **Documentation Tiptap**: https://tiptap.dev/docs
- **Shadcn UI**: https://ui.shadcn.com
- **Clerk Auth**: https://clerk.com/docs
- **Prisma**: https://www.prisma.io/docs

## Aide et Support

En cas de problème :
1. Consulter `/BOOKS_PAGE_DOCUMENTATION.md`
2. Consulter `/.github/copilot-instructions.md`
3. Vérifier les logs de la console
4. Demander à l'agent IA Copilot

---

**Bon développement ! 🚀**
