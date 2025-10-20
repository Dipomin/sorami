# 📊 Intégration Dashboard - Livres Formatés

## Vue d'ensemble

Ce document explique comment intégrer l'accès aux livres formatés dans le tableau de bord utilisateur, permettant d'accéder aux versions professionnelles à tout moment.

## Architecture de Données

### Schéma Book

```prisma
model Book {
  id          String   @id @default(cuid())
  title       String
  description String?
  content     String?  @db.LongText  // ← Contenu formaté HTML
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  chapters    Chapter[]
  author      User     @relation(fields: [authorId], references: [id])
}
```

**Indicateur de contenu formaté**: `book.content !== null && book.content !== ""`

## Implémentation Dashboard

### 1. Ajout dans `/src/app/dashboard/page.tsx`

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Book, Eye, Edit3, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formattedContent, setFormattedContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Charger les livres de l'utilisateur
  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    const response = await fetch("/api/books");
    const data = await response.json();
    setBooks(data);
  };

  // Ouvrir le dialog de visualisation
  const openFormattedView = (book) => {
    setSelectedBook(book);
    setFormattedContent(book.content || "");
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📚 Mes Livres</h1>

      {/* Grille de livres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
          >
            {/* Badge "Formaté" si contenu existe */}
            {book.content && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Formaté
                </span>
              </div>
            )}

            {/* Titre et description */}
            <h2 className="text-xl font-semibold mb-2 pr-20">{book.title}</h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {book.description || "Aucune description"}
            </p>

            {/* Métadonnées */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Book className="h-4 w-4" />
                {book.chapters?.length || 0} chapitres
              </span>
              <span>
                {new Date(book.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {book.content ? (
                // Livre avec version formatée
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openFormattedView(book)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Version formatée
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/books/${book.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                // Livre sans version formatée
                <Button
                  size="sm"
                  onClick={() => window.location.href = `/books/${book.id}`}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Éditer le livre
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de visualisation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[80vw] max-w-[80vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              📖 {selectedBook?.title || "Livre formaté"}
            </DialogTitle>
            <DialogDescription>
              Version professionnelle avec mise en forme moderne
            </DialogDescription>
          </DialogHeader>

          {/* Zone de lecture */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="h-full overflow-y-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-2xl p-12 min-h-full">
                  <div
                    className="prose prose-lg prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.location.href = `/books/${selectedBook?.id}`}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Éditer
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### 2. Statistiques Dashboard

Ajoutez des statistiques sur les livres formatés :

```typescript
// Dans le dashboard
const stats = {
  totalBooks: books.length,
  formattedBooks: books.filter(b => b.content).length,
  draftBooks: books.filter(b => !b.content).length,
  totalChapters: books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0),
};

// Affichage
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white rounded-lg shadow p-6">
    <div className="text-sm text-gray-600">Total Livres</div>
    <div className="text-3xl font-bold">{stats.totalBooks}</div>
  </div>
  
  <div className="bg-green-50 rounded-lg shadow p-6">
    <div className="text-sm text-green-700">Livres Formatés</div>
    <div className="text-3xl font-bold text-green-800">{stats.formattedBooks}</div>
  </div>
  
  <div className="bg-gray-50 rounded-lg shadow p-6">
    <div className="text-sm text-gray-600">Brouillons</div>
    <div className="text-3xl font-bold">{stats.draftBooks}</div>
  </div>
  
  <div className="bg-blue-50 rounded-lg shadow p-6">
    <div className="text-sm text-blue-700">Total Chapitres</div>
    <div className="text-3xl font-bold text-blue-800">{stats.totalChapters}</div>
  </div>
</div>
```

### 3. Filtres et Recherche

```typescript
const [filter, setFilter] = useState<"all" | "formatted" | "draft">("all");
const [searchQuery, setSearchQuery] = useState("");

// Filtrage
const filteredBooks = books
  .filter((book) => {
    if (filter === "formatted") return book.content;
    if (filter === "draft") return !book.content;
    return true;
  })
  .filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

// UI Filtres
<div className="flex gap-4 mb-6">
  <input
    type="text"
    placeholder="🔍 Rechercher un livre..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="flex-1 px-4 py-2 border rounded-lg"
  />
  
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="px-4 py-2 border rounded-lg"
  >
    <option value="all">Tous les livres</option>
    <option value="formatted">✨ Formatés uniquement</option>
    <option value="draft">📝 Brouillons uniquement</option>
  </select>
</div>
```

## API Endpoints Utilisés

### GET /api/books

Retourne tous les livres de l'utilisateur connecté.

**Réponse**:
```json
[
  {
    "id": "123",
    "title": "Mon Livre",
    "description": "Description...",
    "content": "<html>...</html>",  // null si pas formaté
    "authorId": "user_abc",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "chapters": [
      { "id": "ch1", "title": "Chapitre 1", "order": 1 }
    ]
  }
]
```

### GET /api/books/[id]

Retourne un livre spécifique avec tous ses détails.

## Composants Réutilisables

### BookCard Component

Créez un composant réutilisable pour les cartes de livres :

```typescript
// /src/components/BookCard.tsx
import React from "react";
import { Book, Edit3, Eye, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    chapters?: any[];
    updatedAt: string;
  };
  onViewFormatted?: (book: any) => void;
  onEdit?: (bookId: string) => void;
}

export default function BookCard({ book, onViewFormatted, onEdit }: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      {/* Badge Formaté */}
      {book.content && (
        <div className="absolute top-4 right-4">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Formaté
          </span>
        </div>
      )}

      {/* Contenu */}
      <h2 className="text-xl font-semibold mb-2 pr-20">{book.title}</h2>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {book.description || "Aucune description"}
      </p>

      {/* Métadonnées */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Book className="h-4 w-4" />
          {book.chapters?.length || 0} chapitres
        </span>
        <span>{new Date(book.updatedAt).toLocaleDateString("fr-FR")}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {book.content && onViewFormatted && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewFormatted(book)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Version formatée
          </Button>
        )}
        {onEdit && (
          <Button
            variant={book.content ? "outline" : "default"}
            size="sm"
            onClick={() => onEdit(book.id)}
            className={!book.content ? "flex-1" : ""}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {!book.content && "Éditer"}
          </Button>
        )}
      </div>
    </div>
  );
}
```

Utilisation :

```typescript
<BookCard
  book={book}
  onViewFormatted={openFormattedView}
  onEdit={(id) => router.push(`/books/${id}`)}
/>
```

## Indicateurs Visuels

### Badge de Statut

```tsx
{book.content ? (
  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
    <Sparkles className="h-3 w-3" />
    Formaté
  </span>
) : (
  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
    📝 Brouillon
  </span>
)}
```

### Progress Bar

Pour les livres en cours de génération :

```tsx
{book.jobStatus === "RUNNING" && (
  <div className="mt-2">
    <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      Génération en cours...
    </div>
    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 animate-pulse" style={{ width: "60%" }} />
    </div>
  </div>
)}
```

## Responsive Design

### Mobile Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards automatiquement adaptées */}
</div>

{/* Dialog responsive */}
<DialogContent className="w-[95vw] md:w-[80vw] max-w-[80vw] h-[90vh]">
  {/* Contenu adaptatif */}
</DialogContent>
```

### Breakpoints Tailwind

- `sm`: 640px (mobile landscape)
- `md`: 768px (tablette)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

## Navigation

### Routes Principales

```typescript
// Dashboard principal
router.push("/dashboard");

// Voir un livre spécifique
router.push(`/books/${bookId}`);

// Créer un nouveau livre
router.push("/create");

// Liste complète des livres
router.push("/books");
```

### Menu de Navigation

```tsx
<nav className="bg-white shadow-md">
  <div className="container mx-auto px-4 py-4 flex items-center gap-6">
    <Link href="/dashboard" className="font-bold text-xl">
      📚 Sorami
    </Link>
    <Link href="/books" className="text-gray-700 hover:text-gray-900">
      Mes Livres
    </Link>
    <Link href="/create" className="text-gray-700 hover:text-gray-900">
      ➕ Nouveau Livre
    </Link>
    <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
      📊 Tableau de bord
    </Link>
  </div>
</nav>
```

## Gestion d'État

### Context API pour Livres

```typescript
// /src/contexts/BooksContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    setLoading(true);
    const response = await fetch("/api/books");
    const data = await response.json();
    setBooks(data);
    setLoading(false);
  };

  const refreshBooks = () => fetchBooks();

  return (
    <BooksContext.Provider value={{ books, loading, refreshBooks }}>
      {children}
    </BooksContext.Provider>
  );
}

export const useBooks = () => useContext(BooksContext);
```

Utilisation :

```typescript
// Dans app/layout.tsx
<BooksProvider>
  {children}
</BooksProvider>

// Dans n'importe quel composant
const { books, loading, refreshBooks } = useBooks();
```

## Notifications

### Toast System

```typescript
const [toast, setToast] = useState({ show: false, message: "", type: "" });

const showToast = (message: string, type: "success" | "error" | "info") => {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
};

// Affichage
{toast.show && (
  <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
    toast.type === "success" ? "bg-green-500" :
    toast.type === "error" ? "bg-red-500" :
    "bg-blue-500"
  } text-white`}>
    {toast.message}
  </div>
)}

// Usage
showToast("✅ Livre formaté avec succès !", "success");
```

## Analytics

### Tracking Events

```typescript
// Google Analytics ou service similaire
const trackEvent = (category: string, action: string, label?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Exemples d'utilisation
trackEvent("Books", "view_formatted", book.id);
trackEvent("Books", "edit_formatted", book.id);
trackEvent("Books", "export", `${book.id}_${exportFormat}`);
```

## Sécurité

### Validation Permissions

```typescript
// Vérifier avant d'afficher les boutons d'action
const canEdit = book.authorId === user.id;
const canView = book.authorId === user.id || book.isPublic;

{canEdit && (
  <Button onClick={() => openEditor(book.id)}>
    <Edit3 /> Éditer
  </Button>
)}
```

### Rate Limiting

```typescript
// Limiter les appels API
let lastFetch = 0;
const FETCH_COOLDOWN = 5000; // 5 secondes

const fetchBooks = async () => {
  const now = Date.now();
  if (now - lastFetch < FETCH_COOLDOWN) {
    console.log("Cooldown actif, fetch ignoré");
    return;
  }
  lastFetch = now;
  
  // Fetch...
};
```

## Tests

### Test Checklist

- [ ] ✅ Dashboard affiche tous les livres de l'utilisateur
- [ ] ✅ Badge "Formaté" visible uniquement si `book.content` existe
- [ ] ✅ Clic sur "Version formatée" ouvre dialog avec contenu
- [ ] ✅ Filtres "Formatés" / "Brouillons" fonctionnels
- [ ] ✅ Recherche par titre opérationnelle
- [ ] ✅ Statistiques calculées correctement
- [ ] ✅ Navigation vers `/books/[id]` fonctionne
- [ ] ✅ Responsive sur mobile/tablette/desktop
- [ ] ✅ Permissions vérifiées (ne pas voir livres d'autres users)
- [ ] ✅ Loading states affichés pendant fetch
- [ ] ✅ Gestion erreurs réseau (API down)

## Maintenance

### Logs Monitoring

```typescript
// Logger les actions importantes
console.log(`[Dashboard] Livres chargés: ${books.length}`);
console.log(`[Dashboard] Livres formatés: ${formattedCount}`);
console.log(`[Dashboard] Ouverture version formatée: ${book.id}`);
```

### Performance Monitoring

```typescript
// Mesurer le temps de chargement
const startTime = performance.now();
await fetchBooks();
const endTime = performance.now();
console.log(`[Perf] Chargement livres: ${endTime - startTime}ms`);
```

---

**Dernière mise à jour**: 15/01/2025  
**Version**: 1.0.0  
**Auteur**: Sorami Team
