# Page de Gestion des Livres - Documentation Complète

## Vue d'ensemble

La page `/books` est une interface moderne et complète de gestion des livres générés par l'IA. Elle permet aux utilisateurs de visualiser, éditer, organiser et exporter leurs livres avec une expérience utilisateur fluide et intuitive.

## Architecture

### Layout à 3 colonnes

```
┌──────────────┬──────────────┬────────────────────────┐
│   Sidebar    │   Chapitres  │       Éditeur          │
│   (Livres)   │   List       │       Tiptap           │
│              │              │                        │
│  - Recherche │  Ch 1        │  ┌─────────────────┐   │
│  - Filtres   │  Ch 2        │  │ Toolbar         │   │
│  - Livres    │  Ch 3        │  └─────────────────┘   │
│    • Titre   │  Ch 4        │                        │
│    • Stats   │  Ch 5        │  Contenu éditable...   │
│    • Status  │  ...         │                        │
│    • Actions │              │                        │
│              │              │                        │
└──────────────┴──────────────┴────────────────────────┘
```

## Composants et Fonctionnalités

### 1. Sidebar des Livres (Colonne gauche - 320px)

#### Header
- **Titre**: "Mes Livres" avec icône
- **Bouton +**: Crée un nouveau livre (redirection vers `/create`)

#### Barre de recherche
- Recherche en temps réel sur titre et description
- Icône de loupe intégrée
- Placeholder: "Rechercher..."

#### Filtres rapides
- **Tous**: Affiche tous les livres
- **Publiés**: Filtre `status === 'PUBLISHED'`
- **Brouillons**: Filtre `status === 'DRAFT'`
- Design: Boutons avec fond coloré selon sélection

#### Liste des livres
Chaque carte de livre affiche :
- **Titre**: Tronqué sur 2 lignes max
- **Statistiques**:
  - Nombre de chapitres (icône FileText)
  - Nombre total de mots calculé dynamiquement
- **Badge de statut**:
  - `DRAFT`: Gris
  - `PUBLISHED`: Vert
  - `ARCHIVED`: Jaune
- **Dernière modification**: Formatée avec `date-fns` (ex: "il y a 2 heures")
- **Menu actions** (3 points verticaux):
  - Voir les détails
  - Exporter en PDF
  - Exporter en EPUB
  - Exporter en DOCX
  - Supprimer (avec confirmation)

#### États visuels
- **Livre sélectionné**: Fond bleu clair + bordure gauche bleue
- **Hover**: Fond gris léger
- **Empty state**: Message + bouton "Créer un livre"

### 2. Liste des Chapitres (Colonne centrale - 256px)

#### Header
- Titre: "Chapitres"
- Compteur: "X chapitres au total"

#### Liste
Chaque chapitre affiche :
- **Numéro**: Badge circulaire avec ordre
- **Titre**: Tronqué si trop long
- **Statistiques**: Nombre de mots
- **Ordre**: Trié par `chapter.order` (ASC)

#### États visuels
- **Chapitre sélectionné**: Fond bleu clair + bordure gauche bleue
- **Hover**: Fond gris léger
- **Empty state**: "Aucun chapitre disponible"

### 3. Éditeur Tiptap (Colonne droite - flex-1)

#### Header de l'éditeur
- **Mode lecture**:
  - Titre du chapitre (h2)
  - Statistiques (mots, caractères)
  - Bouton "Modifier"
  
- **Mode édition**:
  - Input pour modifier le titre
  - Statistiques en temps réel
  - Boutons "Annuler" et "Sauvegarder"

#### Zone d'édition
- **Mode lecture**: Contenu HTML affiché avec `dangerouslySetInnerHTML`
- **Mode édition**: Éditeur Tiptap avec toolbar complet
  - **Styles de texte**: Gras, Italique, Souligné, Barré, Code, Surlignage
  - **Titres**: H1, H2, H3
  - **Listes**: Puces, Numérotées
  - **Citation**: Blockquote
  - **Alignement**: Gauche, Centre, Droite, Justifié
  - **Média**: Liens, Images
  - **Historique**: Annuler, Rétablir

#### Empty state
- Icône FileText grisée
- Message: "Sélectionnez un chapitre pour commencer"

### 4. Dialog de Confirmation de Suppression

Composant modal Shadcn UI :
- **Titre**: "Supprimer le livre ?"
- **Description**: Avertissement + nom du livre
- **Actions**:
  - Bouton "Annuler" (outline)
  - Bouton "Supprimer" (destructive, rouge)

## Routes API Utilisées

### GET `/api/books`
```typescript
Response: {
  books: Book[] // Avec chapters inclus
}
```

**Fonctionnalités**:
- Récupère tous les livres de l'utilisateur connecté
- Inclut les chapitres triés par `order`
- Inclut le compteur de chapitres (`_count`)
- Trié par date de création (DESC)

### PUT `/api/chapters/[id]`
```typescript
Request: {
  title?: string;
  content?: string;
}

Response: Chapter
```

**Fonctionnalités**:
- Met à jour le titre et/ou contenu d'un chapitre
- Vérifie que l'utilisateur possède le livre
- Validation des permissions

### DELETE `/api/books/[id]`
```typescript
Response: {
  message: "Livre supprimé avec succès"
}
```

**Fonctionnalités**:
- Supprime un livre et ses chapitres (cascade)
- Vérifie les permissions
- Retourne un message de confirmation

### GET `/api/books/[id]/export?format=pdf|epub|docx`
```typescript
Response: File (binary)
Headers:
  Content-Type: application/[format]
  Content-Disposition: attachment; filename="[titre].[format]"
```

**Fonctionnalités**:
- Génère un fichier exportable du livre
- Supporte 3 formats: PDF, EPUB, DOCX
- Inclut tous les chapitres dans l'ordre
- **TODO**: Implémenter la génération réelle (actuellement texte simple)

## État et Gestion des Données

### État Local (React useState)

```typescript
const [books, setBooks] = useState<Book[]>([]);
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState<string>('all');
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
const [editMode, setEditMode] = useState(false);
const [editedContent, setEditedContent] = useState('');
const [editedTitle, setEditedTitle] = useState('');
```

### Flux de données

1. **Chargement initial** (`useEffect`):
   - Vérification de l'authentification Clerk
   - Appel GET `/api/books`
   - Sélection automatique du 1er livre

2. **Sélection d'un livre**:
   - Mise à jour de `selectedBook`
   - Sélection automatique du 1er chapitre
   - Réinitialisation du mode édition

3. **Sélection d'un chapitre**:
   - Mise à jour de `selectedChapter`
   - Copie du contenu dans `editedContent`
   - Réinitialisation du mode édition

4. **Mode édition**:
   - Activation: `setEditMode(true)`
   - Modifications: `setEditedContent()`, `setEditedTitle()`
   - Annulation: Restauration depuis `selectedChapter`
   - Sauvegarde: PUT `/api/chapters/[id]` puis mise à jour locale

5. **Suppression**:
   - Ouverture dialog confirmation
   - DELETE `/api/books/[id]`
   - Mise à jour locale `setBooks()`
   - Sélection du livre suivant

6. **Export**:
   - GET `/api/books/[id]/export?format=X`
   - Téléchargement via `window.URL.createObjectURL()`

## Types TypeScript

```typescript
interface Chapter {
  id: string;
  title: string;
  content: string; // HTML formaté par Tiptap
  order: number;
}

interface Book {
  id: string;
  title: string;
  description: string;
  status: string; // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  topic: string;
  goal: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  publishedAt?: string; // ISO date optionnel
  chapters: Chapter[];
}
```

## Dépendances

### Packages npm
- `@clerk/nextjs`: Authentification
- `@tiptap/react`: Éditeur WYSIWYG
- `@tiptap/starter-kit`: Extensions de base
- `@tiptap/extension-*`: Extensions supplémentaires
- `@radix-ui/react-*`: Composants UI (Dialog, DropdownMenu)
- `lucide-react`: Icônes
- `date-fns`: Formatage des dates
- `class-variance-authority`: Variants pour Button (si utilisé)

### Composants internes
- `/components/ui/button`: Bouton stylisé avec variants
- `/components/ui/dialog`: Modal de confirmation
- `/components/ui/dropdown-menu`: Menu d'actions
- `/components/TiptapEditor`: Éditeur riche

## Styles et Design

### Palette de couleurs
- **Primary**: Bleu (blue-600, blue-700)
- **Secondary**: Gris (gray-50 à gray-900)
- **Success**: Vert (green-100, green-800)
- **Warning**: Jaune (yellow-100, yellow-800)
- **Danger**: Rouge (red-600, destructive variant)

### Tailwind Classes principales
- Layout: `flex`, `flex-col`, `h-screen`
- Spacing: `p-4`, `gap-2`, `mb-4`
- Typography: `text-sm`, `text-lg`, `font-semibold`
- Borders: `border`, `border-gray-200`, `rounded-md`
- Hover: `hover:bg-gray-50`, `transition-colors`
- Focus: `focus:outline-none`, `focus:ring-2`

### Responsive (TODO)
Actuellement optimisé pour desktop. Pour mobile :
- Réduire sidebar à overlay
- Stack colonnes verticalement
- Adapter tailles de police

## Sécurité

### Authentification
- Middleware Clerk protège `/books`
- `requireAuth()` dans toutes les API routes
- Vérification `authorId === user.id` côté serveur

### XSS Protection
- Utilisation de `dangerouslySetInnerHTML` seulement en mode lecture
- Tiptap sanitize le contenu en mode édition
- Validation côté serveur dans les API routes

### CSRF Protection
- Next.js built-in CSRF protection
- SameSite cookies via Clerk

## Performance

### Optimisations actuelles
- Chargement initial unique avec `useEffect`
- Mise à jour locale après save (pas de refetch)
- Tri côté client des chapitres (déjà triés par API)
- `formatDistanceToNow` calculé une fois par render

### Améliorations futures
- Pagination pour > 50 livres
- Debounce sur la recherche
- Virtual scrolling pour listes longues
- Image lazy loading dans Tiptap
- Cache avec React Query / SWR

## Gestion des Erreurs

### États d'erreur
- **Loading**: Spinner avec message
- **Empty state**: Messages explicites + CTA
- **Erreur API**: `console.error()` (TODO: Toast notifications)

### Erreurs non gérées
- Erreur réseau
- Timeout
- Validation échouée

**TODO**: Ajouter toast notifications avec :
- `react-hot-toast`
- `sonner`
- Shadcn `toast`

## Tests (TODO)

### Tests unitaires
- [ ] Filtrage des livres (recherche + status)
- [ ] Comptage des mots
- [ ] Gestion du mode édition

### Tests d'intégration
- [ ] Flux complet: sélection → édition → sauvegarde
- [ ] Suppression avec confirmation
- [ ] Export dans les 3 formats

### Tests E2E
- [ ] Cypress: Créer livre → éditer chapitre → exporter
- [ ] Playwright: Tests multi-navigateurs

## Améliorations Futures

### Fonctionnalités
- [ ] Drag & drop pour réordonner chapitres
- [ ] Ajout/suppression de chapitres
- [ ] Édition du livre (titre, description, status)
- [ ] Partage public avec URL unique
- [ ] Collaboration temps réel (WebSockets)
- [ ] Historique des versions (Git-like)
- [ ] Commentaires sur chapitres
- [ ] Génération PDF/EPUB/DOCX réelle (puppeteer, pandoc)
- [ ] Preview avant export
- [ ] Templates de mise en page

### UX
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] Animations (framer-motion)
- [ ] Raccourcis clavier (Cmd+S pour save)
- [ ] Mode sombre
- [ ] Responsive mobile
- [ ] PWA (offline mode)

### Performance
- [ ] React Query pour cache
- [ ] Optimistic updates
- [ ] Autosave (toutes les 30s)
- [ ] Compression des images Tiptap
- [ ] Code splitting par route

### Analytics
- [ ] Temps moyen d'édition
- [ ] Chapitres les plus édités
- [ ] Formats d'export préférés
- [ ] Tracking des erreurs (Sentry)

## Migration et Maintenance

### Breaking Changes à surveiller
- Tiptap v3 (actuellement v2)
- Next.js 16 (App Router changes)
- Clerk SDK updates
- Prisma 6

### Dépréciation planifiée
- Remplacer `dangerouslySetInnerHTML` par `DOMPurify`
- Migrer date-fns vers `Temporal` (TC39)

## Support et Documentation

### Logs et Debugging
- Console.error pour erreurs API
- Aucun log en production (TODO: Sentry)
- Variables d'env dans `.env.local`

### Documentation liée
- `/WEBHOOK_IMPLEMENTATION.md`: Webhooks CrewAI
- `/.github/copilot-instructions.md`: Guidelines générales
- `/schema.prisma`: Modèles de données

## Contribution

Pour ajouter une fonctionnalité :
1. Créer une branche `feature/books-[fonctionnalité]`
2. Suivre les patterns existants
3. Ajouter types TypeScript
4. Tester en local
5. Mettre à jour cette documentation

---

**Dernière mise à jour**: 2024-01-XX
**Auteur**: Agent IA Copilot
**Version**: 1.0.0
