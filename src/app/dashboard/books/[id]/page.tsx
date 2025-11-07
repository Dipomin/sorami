"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book as BookIcon,
  FileText,
  Calendar,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Download,
  Share2,
  Trash2,
  Clock,
  Eye,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";

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

const BookDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    if (user && id) {
      fetchBook();
    }
  }, [user, isLoaded, id, router]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${id}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du livre");
      }

      const data = await response.json();
      setBook(data);

      if (data.chapters && data.chapters.length > 0) {
        const sortedChapters = [...data.chapters].sort(
          (a, b) => a.order - b.order
        );
        setSelectedChapter(sortedChapters[0]);
        setEditedTitle(sortedChapters[0].title);
        setEditedContent(sortedChapters[0].content);
      }
    } catch (error) {
      console.error("Erreur:", error);
      router.push("/books");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = (chapter: Chapter) => {
    if (editMode) {
      const confirmChange = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de chapitre ?"
      );
      if (!confirmChange) return;
      setEditMode(false);
    }

    setSelectedChapter(chapter);
    setEditedTitle(chapter.title);
    setEditedContent(chapter.content);
  };

  const handleSaveChapter = async () => {
    if (!selectedChapter || !book) return;

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
      setBook({
        ...book,
        chapters: book.chapters.map((ch) =>
          ch.id === selectedChapter.id
            ? { ...ch, title: editedTitle, content: editedContent }
            : ch
        ),
      });

      setSelectedChapter({
        ...selectedChapter,
        title: editedTitle,
        content: editedContent,
      });

      setEditMode(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde du chapitre");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.push("/books");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression du livre");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-dark-800/50 text-dark-300 border border-dark-700",
      PUBLISHED: "bg-green-500/10 text-green-400 border border-green-500/30",
      ARCHIVED: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    };

    const labels = {
      DRAFT: "Brouillon",
      PUBLISHED: "Publié",
      ARCHIVED: "Archivé",
    };

    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          styles[status as keyof typeof styles] || styles.DRAFT
        )}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const getCurrentChapterIndex = () => {
    if (!book || !selectedChapter) return -1;
    const sortedChapters = [...book.chapters].sort((a, b) => a.order - b.order);
    return sortedChapters.findIndex((ch) => ch.id === selectedChapter.id);
  };

  const goToPreviousChapter = () => {
    if (!book) return;
    const sortedChapters = [...book.chapters].sort((a, b) => a.order - b.order);
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      handleSelectChapter(sortedChapters[currentIndex - 1]);
    }
  };

  const goToNextChapter = () => {
    if (!book) return;
    const sortedChapters = [...book.chapters].sort((a, b) => a.order - b.order);
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < sortedChapters.length - 1) {
      handleSelectChapter(sortedChapters[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-violet flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-dark-300">Chargement du livre...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (!book) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BookIcon className="w-16 h-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Livre introuvable
            </h3>
            <p className="text-dark-400 mb-6">
              Ce livre n'existe pas ou a été supprimé
            </p>
            <Link href="/books">
              <Button className="bg-gradient-violet">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux livres
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sortedChapters = [...book.chapters].sort((a, b) => a.order - b.order);
  const currentIndex = getCurrentChapterIndex();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/books">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    {book.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusBadge(book.status)}
                    <span className="text-sm text-dark-400">
                      {book.chapters.length} chapitres
                    </span>
                    <span className="text-sm text-dark-400">•</span>
                    <span className="text-sm text-dark-400">
                      {formatDistanceToNow(new Date(book.updatedAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Liste des chapitres */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 border-r border-dark-700 bg-dark-900/30 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-4 border-b border-dark-700">
              <h3 className="font-bold text-white mb-1">Chapitres</h3>
              <p className="text-sm text-dark-400">
                {book.chapters.length} au total
              </p>
            </div>

            <div className="p-2">
              {sortedChapters.map((chapter, index) => (
                <motion.button
                  key={chapter.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectChapter(chapter)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl mb-2 transition-all group",
                    selectedChapter?.id === chapter.id
                      ? "bg-gradient-violet text-white shadow-glow"
                      : "bg-dark-800/30 text-dark-300 hover:bg-dark-800 hover:text-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        selectedChapter?.id === chapter.id
                          ? "bg-white/20"
                          : "bg-dark-700 group-hover:bg-dark-600"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chapter.title}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          selectedChapter?.id === chapter.id
                            ? "text-white/70"
                            : "text-dark-500"
                        )}
                      >
                        {countWords(chapter.content)} mots
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Contenu principal - Éditeur */}
          <div className="flex-1 flex flex-col">
            {selectedChapter ? (
              <>
                {/* Header du chapitre */}
                <div className="p-6 border-b border-dark-700 bg-dark-900/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    {editMode ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 text-2xl font-bold bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Titre du chapitre"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white">
                        {selectedChapter.title}
                      </h2>
                    )}

                    <div className="flex items-center gap-2 ml-4">
                      {editMode ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditMode(false);
                              setEditedTitle(selectedChapter.title);
                              setEditedContent(selectedChapter.content);
                            }}
                            disabled={saving}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveChapter}
                            disabled={saving}
                            className="bg-gradient-violet"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {saving ? "Sauvegarde..." : "Sauvegarder"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Éditer
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{countWords(editedContent)} mots</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{editedContent.length} caractères</span>
                    </div>
                  </div>
                </div>

                {/* Contenu du chapitre */}
                <div className="flex-1 overflow-y-auto p-6">
                  {editMode ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full min-h-[500px] bg-dark-800/30 border border-dark-700 rounded-xl p-6 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm leading-relaxed"
                      placeholder="Contenu du chapitre..."
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-invert max-w-none"
                    >
                      <div
                        className="text-dark-200 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: selectedChapter.content,
                        }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Navigation chapitres */}
                <div className="p-4 border-t border-dark-700 bg-dark-900/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousChapter}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Chapitre précédent
                    </Button>

                    <span className="text-sm text-dark-400">
                      Chapitre {currentIndex + 1} sur {sortedChapters.length}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextChapter}
                      disabled={currentIndex === sortedChapters.length - 1}
                    >
                      Chapitre suivant
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400">Aucun chapitre sélectionné</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Dialog */}
        <AnimatePresence>
          {deleteDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
              onClick={() => setDeleteDialogOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  Supprimer le livre ?
                </h3>
                <p className="text-dark-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer "{book.title}" ? Cette
                  action est irréversible et supprimera tous les chapitres.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteBook}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default BookDetailPage;
