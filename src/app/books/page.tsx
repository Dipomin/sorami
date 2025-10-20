"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Book as BookIcon,
  FileText,
  Calendar,
  Edit3,
  Trash2,
  Download,
  Share2,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Eye,
  Save,
  X,
  Sparkles,
  Clock,
  Check,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiptapEditor } from "@/components/TiptapEditor";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Book {
  id: string;
  title: string;
  description: string;
  status: string;
  topic: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  chapters: Chapter[];
}

const BooksPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [formatting, setFormatting] = useState(false);
  const [formattedDialogOpen, setFormattedDialogOpen] = useState(false);
  const [formattedContent, setFormattedContent] = useState("");
  const [formatProgressOpen, setFormatProgressOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const [pageFormat, setPageFormat] = useState<"A4" | "A5">("A4");
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx" | "epub">(
    "pdf"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingFormatted, setIsEditingFormatted] = useState(false);
  const [editedFormattedContent, setEditedFormattedContent] = useState("");
  const [isSavingFormatted, setIsSavingFormatted] = useState(false);

  // Charger les livres de l'utilisateur
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    if (user) {
      fetchBooks();
    }
  }, [user, isLoaded, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des livres");
      }

      const data = await response.json();
      setBooks(data.books || []);

      // Sélectionner automatiquement le premier livre
      if (data.books && data.books.length > 0 && !selectedBook) {
        setSelectedBook(data.books[0]);
        if (data.books[0].chapters && data.books[0].chapters.length > 0) {
          setSelectedChapter(data.books[0].chapters[0]);
          setEditedContent(data.books[0].chapters[0].content);
          setEditedTitle(data.books[0].chapters[0].title);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setEditMode(false);
    if (book.chapters && book.chapters.length > 0) {
      setSelectedChapter(book.chapters[0]);
      setEditedContent(book.chapters[0].content);
      setEditedTitle(book.chapters[0].title);
    } else {
      setSelectedChapter(null);
    }
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setEditedContent(chapter.content);
    setEditedTitle(chapter.title);
    setEditMode(false);
  };

  const handleSaveChapter = async () => {
    if (!selectedChapter || !selectedBook) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      // Mettre à jour localement
      setBooks(
        books.map((book) => {
          if (book.id === selectedBook.id) {
            return {
              ...book,
              chapters: book.chapters.map((ch) =>
                ch.id === selectedChapter.id
                  ? { ...ch, title: editedTitle, content: editedContent }
                  : ch
              ),
            };
          }
          return book;
        })
      );

      setSelectedChapter({
        ...selectedChapter,
        title: editedTitle,
        content: editedContent,
      });
      setEditMode(false);

      setToastMessage("✅ Chapitre sauvegardé avec succès !");
      setToastType("success");
      setTimeout(() => setToastType(""), 3000);
    } catch (error) {
      console.error("Erreur:", error);

      setToastMessage("❌ Erreur lors de la sauvegarde du chapitre");
      setToastType("error");
      setTimeout(() => setToastType(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFormatBook = async (book: Book) => {
    try {
      setFormatting(true);
      setFormatProgressOpen(true);
      console.log(
        "✨ [Client] Début de la mise en forme professionnelle du livre:",
        book.title
      );
      console.log("📚 [Client] ID du livre:", book.id);
      console.log(
        "📄 [Client] Nombre de chapitres dans le livre:",
        book.chapters.length
      );
      console.log("📋 [Client] Liste des chapitres:");
      book.chapters.forEach((chapter, index) => {
        console.log(
          `  ${index + 1}. "${chapter.title}" (order: ${chapter.order})`
        );
      });

      const response = await fetch(`/api/books/${book.id}/format`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ [Client] Erreur API:", error);
        throw new Error(error.details || "Erreur lors de la mise en forme");
      }

      const data = await response.json();
      console.log("✅ [Client] Mise en forme réussie");
      console.log("📊 [Client] Métadonnées:", data.metadata);
      console.log(
        "📖 [Client] Taille du contenu formaté reçu:",
        data.formattedContent.length,
        "caractères"
      );
      console.log(
        "📝 [Client] Aperçu du contenu formaté (200 premiers caractères):"
      );
      console.log(data.formattedContent.substring(0, 200) + "...");

      setFormattedContent(data.formattedContent);
      setFormatProgressOpen(false);
      setFormattedDialogOpen(true);

      setToastMessage("✅ Livre formaté avec succès !");
      setToastType("success");
      setTimeout(() => setToastType(""), 3000);
    } catch (error) {
      console.error("❌ [Client] Erreur lors de la mise en forme:", error);
      setFormatProgressOpen(false);

      setToastMessage(
        `❌ Erreur: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
      setToastType("error");
      setTimeout(() => setToastType(""), 5000);
    } finally {
      setFormatting(false);
    }
  };

  const handleExportFormattedBook = async () => {
    if (!selectedBook) return;

    try {
      setIsExporting(true);
      console.log("📥 [Client] Début de l'export du livre formaté");
      console.log("📐 [Client] Format de page:", pageFormat);
      console.log("📄 [Client] Format d'export:", exportFormat);

      // Récupérer le HTML paginé depuis l'API
      const response = await fetch(
        `/api/books/${selectedBook.id}/export-formatted`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageFormat,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.details || error.error || "Erreur lors de l'export"
        );
      }

      const data = await response.json();
      console.log("✅ [Client] HTML paginé reçu");
      console.log("📊 [Client] Métadonnées:", data.metadata);

      // Générer le fichier selon le format choisi
      if (exportFormat === "pdf") {
        await generatePDF(data.html, selectedBook.title);
      } else if (exportFormat === "docx") {
        await generateDOCX(data.html, selectedBook.title);
      } else if (exportFormat === "epub") {
        await generateEPUB(data.html, selectedBook.title);
      }

      setToastMessage(
        `✅ Livre exporté en ${exportFormat.toUpperCase()} avec succès !`
      );
      setToastType("success");
      setTimeout(() => setToastType(""), 3000);

      console.log(`✅ [Client] Export ${exportFormat.toUpperCase()} réussi`);
    } catch (error) {
      console.error("❌ [Client] Erreur lors de l'export:", error);
      setToastMessage(
        `❌ Erreur: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
      setToastType("error");
      setTimeout(() => setToastType(""), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = async (html: string, title: string) => {
    console.log("📄 [Client] Génération PDF en cours...");

    // Créer une iframe cachée pour le rendu
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Impossible de créer l'iframe pour le PDF");
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Attendre que le contenu soit chargé
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Utiliser la fonction d'impression du navigateur
    iframe.contentWindow?.print();

    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);

    console.log("✅ [Client] PDF prêt pour impression");
  };

  const generateDOCX = async (html: string, title: string) => {
    console.log("📄 [Client] Génération DOCX en cours...");

    // Pour DOCX, nous utilisons un export HTML qui peut être ouvert dans Word
    const blob = new Blob([html], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log("✅ [Client] DOCX téléchargé");
  };

  const generateEPUB = async (html: string, title: string) => {
    console.log("📄 [Client] Génération EPUB en cours...");

    // Pour EPUB, nous créons un fichier HTML qui peut être converti
    const blob = new Blob([html], { type: "application/epub+zip" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.epub`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log("✅ [Client] EPUB téléchargé");
  };

  const handleEditFormatted = () => {
    setIsEditingFormatted(true);
    setEditedFormattedContent(formattedContent);
    console.log("✏️ [Client] Mode édition activé pour le livre formaté");
  };

  const handleCancelEditFormatted = () => {
    setIsEditingFormatted(false);
    setEditedFormattedContent("");
    console.log("❌ [Client] Édition annulée");
  };

  const handleSaveFormattedContent = async () => {
    if (!selectedBook) return;

    try {
      setIsSavingFormatted(true);
      console.log("💾 [Client] Sauvegarde du contenu formaté modifié");

      const response = await fetch(`/api/books/${selectedBook.id}/format`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedFormattedContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Erreur lors de la sauvegarde");
      }

      const data = await response.json();
      console.log("✅ [Client] Contenu formaté sauvegardé avec succès");

      // Mettre à jour le contenu affiché
      setFormattedContent(editedFormattedContent);
      setIsEditingFormatted(false);

      setToastMessage("✅ Livre formaté sauvegardé avec succès !");
      setToastType("success");
      setTimeout(() => setToastType(""), 3000);
    } catch (error) {
      console.error("❌ [Client] Erreur lors de la sauvegarde:", error);
      setToastMessage(
        `❌ Erreur: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
      setToastType("error");
      setTimeout(() => setToastType(""), 5000);
    } finally {
      setIsSavingFormatted(false);
    }
  };

  const calculateReadingTime = (content: string): number => {
    // Retirer les balises HTML
    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Compter les mots
    const wordCount = plainText.split(/\s+/).length;

    // Vitesse moyenne de lecture : 200-250 mots/minute
    // On prend 225 comme moyenne
    const readingTimeMinutes = Math.ceil(wordCount / 225);

    return readingTimeMinutes;
  };

  const handleDeleteBook = async (book: Book) => {
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Retirer le livre de la liste
      const updatedBooks = books.filter((b) => b.id !== book.id);
      setBooks(updatedBooks);

      // Si c'était le livre sélectionné, sélectionner le suivant
      if (selectedBook?.id === book.id) {
        if (updatedBooks.length > 0) {
          handleSelectBook(updatedBooks[0]);
        } else {
          setSelectedBook(null);
          setSelectedChapter(null);
        }
      }

      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleExportBook = async (
    book: Book,
    format: "pdf" | "epub" | "docx"
  ) => {
    try {
      const response = await fetch(
        `/api/books/${book.id}/export?format=${format}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Filtrer les livres
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      ARCHIVED: "bg-yellow-100 text-yellow-800",
    };

    const labels = {
      DRAFT: "Brouillon",
      PUBLISHED: "Publié",
      ARCHIVED: "Archivé",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.DRAFT
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos livres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookIcon className="h-6 w-6 text-blue-600" />
              Mes Livres
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/create")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStatus("PUBLISHED")}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === "PUBLISHED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Publiés
            </button>
            <button
              onClick={() => setFilterStatus("DRAFT")}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === "DRAFT"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Brouillons
            </button>
          </div>
        </div>

        {/* Liste des livres */}
        <div className="flex-1 overflow-y-auto">
          {filteredBooks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <BookIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Aucun livre trouvé</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.push("/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un livre
              </Button>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedBook?.id === book.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
                onClick={() => handleSelectBook(book)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {book.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/books/${book.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleFormatBook(book)}
                        disabled={formatting}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {formatting
                          ? "Mise en forme..."
                          : "Mise en forme pro (IA)"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleExportBook(book, "pdf")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportBook(book, "epub")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en EPUB
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportBook(book, "docx")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en DOCX
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setBookToDelete(book);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <FileText className="h-3 w-3" />
                  <span>{book.chapters?.length || 0} chapitres</span>
                  <span>•</span>
                  <span>
                    {book.chapters?.reduce(
                      (total, ch) => total + countWords(ch.content),
                      0
                    ) || 0}{" "}
                    mots
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(book.status)}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(book.updatedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contenu principal */}
      {selectedBook ? (
        <div className="flex-1 flex">
          {/* Liste des chapitres */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">Chapitres</h3>
              <p className="text-xs text-gray-500">
                {selectedBook.chapters?.length || 0} chapitres au total
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedBook.chapters && selectedBook.chapters.length > 0 ? (
                selectedBook.chapters
                  .sort((a, b) => a.order - b.order)
                  .map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChapter?.id === chapter.id
                          ? "bg-blue-50 border-l-4 border-l-blue-600"
                          : ""
                      }`}
                      onClick={() => handleSelectChapter(chapter)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-xs font-medium flex items-center justify-center text-gray-600">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chapter.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {countWords(chapter.content)} mots
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Aucun chapitre disponible
                </div>
              )}
            </div>
          </div>

          {/* Éditeur */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedChapter ? (
              <>
                {/* Header de l'éditeur */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex-1">
                    {editMode ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditedTitle(e.target.value)
                        }
                        className="w-full text-lg font-semibold border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Titre du chapitre"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedChapter.title}
                      </h2>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{countWords(editedContent)} mots</span>
                      <span>•</span>
                      <span>{editedContent.length} caractères</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMode(false);
                            setEditedContent(selectedChapter.content);
                            setEditedTitle(selectedChapter.title);
                          }}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveChapter}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {saving ? "Sauvegarde..." : "Sauvegarder"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>

                {/* Zone d'édition */}
                <div className="flex-1 overflow-y-auto p-6">
                  {editMode ? (
                    <TiptapEditor
                      content={editedContent}
                      onChange={(newContent: string) =>
                        setEditedContent(newContent)
                      }
                    />
                  ) : (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedChapter.content,
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Sélectionnez un chapitre pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <BookIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun livre sélectionné
            </h3>
            <p className="text-gray-500 mb-6">
              Sélectionnez un livre dans la barre latérale ou créez-en un
              nouveau
            </p>
            <Button onClick={() => router.push("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un nouveau livre
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le livre ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{bookToDelete?.title}" ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setBookToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => bookToDelete && handleDeleteBook(bookToDelete)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de progression de mise en forme */}
      <Dialog open={formatProgressOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              Mise en forme en cours...
            </DialogTitle>
            <DialogDescription>
              Notre IA est en train de formater votre livre selon les standards
              professionnels de l'édition. Cette opération peut prendre entre 15
              et 60 secondes selon la longueur du livre.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {/* Spinner animé */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
            </div>

            {/* Messages de progression */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Traitement en cours...
              </p>
              <p className="text-xs text-gray-500 max-w-sm">
                ✨ Application de la typographie professionnelle
                <br />
                📄 Génération de la table des matières
                <br />
                📖 Formatage des chapitres
                <br />
                🎨 Mise en page éditoriale
              </p>
            </div>
          </div>

          <div className="text-xs text-center text-gray-400">
            Veuillez patienter, ne fermez pas cette fenêtre...
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour le contenu formaté */}
      <Dialog
        open={formattedDialogOpen}
        onOpenChange={(open) => {
          // Empêcher la fermeture sauf via les boutons Fermer ou X
          if (!open) {
            setFormattedDialogOpen(false);
          }
        }}
      >
        <DialogContent
          className="w-[80vw] max-w-[80vw] h-[90vh] flex flex-col p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-xl mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  Livre formaté professionnellement
                  {selectedBook && (
                    <span className="text-base font-normal text-gray-600">
                      - {selectedBook.title}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Votre livre a été mis en forme selon les standards
                  professionnels de l'édition. Vous pouvez le modifier,
                  l'exporter ou le sauvegarder.
                </DialogDescription>
              </div>
            </div>

            {/* Métadonnées du livre */}
            {selectedBook && formattedContent && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">
                      Métadonnées:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">
                      {selectedBook.chapters.length} chapitre
                      {selectedBook.chapters.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">
                      Temps de lecture: ~
                      {calculateReadingTime(formattedContent)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">
                      {
                        formattedContent
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .split(/\s+/).length
                      }{" "}
                      mots
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">
                      Dernière MAJ:{" "}
                      {new Date(selectedBook.updatedAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Contrôles d'export et édition */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 items-center">
              {!isEditingFormatted ? (
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format de page
                    </label>
                    <Select
                      value={pageFormat}
                      onValueChange={(value: "A4" | "A5") =>
                        setPageFormat(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">📄 A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="A5">📖 A5 (148 × 210 mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format d'export
                    </label>
                    <Select
                      value={exportFormat}
                      onValueChange={(value: "pdf" | "docx" | "epub") =>
                        setExportFormat(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">📄 PDF (impression)</SelectItem>
                        <SelectItem value="docx">📝 DOCX (Word)</SelectItem>
                        <SelectItem value="epub">📚 EPUB (eBook)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-6 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEditFormatted}
                      className="whitespace-nowrap"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      onClick={handleExportFormattedBook}
                      disabled={isExporting}
                      className="whitespace-nowrap"
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Export...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      ✏️ Mode édition activé
                    </p>
                    <p className="text-xs text-gray-500">
                      Modifiez le contenu ci-dessous puis cliquez sur
                      "Enregistrer" pour sauvegarder vos modifications.
                    </p>
                  </div>
                  <div className="pt-6 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelEditFormatted}
                      disabled={isSavingFormatted}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSaveFormattedContent}
                      disabled={isSavingFormatted}
                    >
                      {isSavingFormatted ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
            {!isEditingFormatted && (
              <p className="text-xs text-gray-500 mt-3">
                💡 Le document sera adapté au format de page sélectionné avant
                le téléchargement
              </p>
            )}
          </div>

          {/* Zone de lecture/édition avec fond papier */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="h-full overflow-y-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                {/* Conteneur papier avec ombre */}
                <div className="bg-white rounded-lg shadow-2xl p-12 min-h-full">
                  {isEditingFormatted ? (
                    // Mode édition avec Tiptap
                    <div className="min-h-[600px]">
                      <TiptapEditor
                        content={editedFormattedContent}
                        onChange={setEditedFormattedContent}
                      />
                    </div>
                  ) : (
                    // Mode lecture
                    <div
                      className="prose prose-lg prose-slate max-w-none
                        prose-headings:font-serif prose-headings:text-gray-900
                        prose-p:text-gray-700 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900 prose-strong:font-semibold
                        prose-em:text-gray-700 prose-em:italic
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:italic
                        prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-gray-900 prose-pre:text-gray-100
                        prose-ol:list-decimal prose-ul:list-disc
                        prose-li:text-gray-700
                        prose-table:border-collapse
                        prose-th:bg-gray-100 prose-th:font-semibold
                        prose-td:border prose-td:border-gray-300 prose-td:p-2
                        prose-img:rounded-lg prose-img:shadow-md"
                      dangerouslySetInnerHTML={{ __html: formattedContent }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Barre d'actions sticky en bas */}
          <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-3 w-full justify-between items-center">
              {!isEditingFormatted ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500">
                      💡 Astuce : Faites défiler pour lire l'intégralité du
                      livre
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(formattedContent);
                        setToastMessage(
                          "📋 Contenu HTML copié dans le presse-papiers !"
                        );
                        setToastType("success");
                        setTimeout(() => setToastType(""), 3000);
                      }}
                    >
                      📋 Copier HTML
                    </Button>
                  </div>
                  <Button onClick={() => setFormattedDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-xs text-gray-500">
                    ✏️ Mode édition : Modifiez le contenu ci-dessus puis
                    enregistrez vos changements
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFormattedDialogOpen(false)}
                    disabled={isSavingFormatted}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Fermer sans sauvegarder
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      {toastType && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toastType === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span className="text-lg">
              {toastType === "success" ? "✅" : "❌"}
            </span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
