"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

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

export default function BookReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    params.then((p) => setBookId(p.id));
  }, [params]);

  useEffect(() => {
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du livre");
      }

      const data = await response.json();
      setBook(data.book);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer le livre "${book.title}" ?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.push("/books-modern");
    } catch (err) {
      alert("Erreur lors de la suppression du livre");
    }
  };

  const currentChapter = book?.chapters[currentChapterIndex];
  const hasNextChapter = book && currentChapterIndex < book.chapters.length - 1;
  const hasPrevChapter = currentChapterIndex > 0;

  const goToNextChapter = () => {
    if (hasNextChapter) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const goToPrevChapter = () => {
    if (hasPrevChapter) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Chargement du livre...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !book) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
            <p className="text-dark-300 mb-6">{error || "Livre non trouvé"}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/books-modern")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux livres
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        {/* Header */}
        <div className="border-b border-dark-800/50 bg-dark-900/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/books-modern")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" size="sm">
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Éditer</span>
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar - Sommaire */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 border-r border-dark-800/50 bg-dark-900/30 backdrop-blur-sm overflow-y-auto"
              >
                <div className="p-6">
                  {/* Book Info */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-display font-bold text-white line-clamp-2">
                          {book.title}
                        </h2>
                        <p className="text-sm text-dark-400 mt-1">
                          {book.chapters.length} chapitre
                          {book.chapters.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-dark-300 line-clamp-3">
                      {book.description}
                    </p>
                  </div>

                  {/* Chapters List */}
                  <div>
                    <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">
                      Sommaire
                    </h3>
                    <div className="space-y-1">
                      {book.chapters.map((chapter, index) => (
                        <button
                          key={chapter.id}
                          onClick={() => setCurrentChapterIndex(index)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                            currentChapterIndex === index
                              ? "bg-primary-500/20 border border-primary-500/30 text-white"
                              : "hover:bg-dark-800/50 text-dark-300 hover:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                currentChapterIndex === index
                                  ? "bg-primary-500 text-white"
                                  : "bg-dark-800 text-dark-400"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="text-sm line-clamp-2">
                              {chapter.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12">
              <AnimatePresence mode="wait">
                {currentChapter && (
                  <motion.div
                    key={currentChapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Chapter Header */}
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-1 mb-4">
                        <FileText className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-primary-300">
                          Chapitre {currentChapterIndex + 1} /{" "}
                          {book.chapters.length}
                        </span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                        {currentChapter.title}
                      </h1>
                    </div>

                    {/* Chapter Content */}
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="text-dark-200 leading-relaxed whitespace-pre-wrap">
                        {currentChapter.content}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-dark-800/50">
                      <Button
                        variant="outline"
                        onClick={goToPrevChapter}
                        disabled={!hasPrevChapter}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Chapitre précédent
                      </Button>
                      <span className="text-dark-400 text-sm">
                        {currentChapterIndex + 1} / {book.chapters.length}
                      </span>
                      <Button
                        variant="outline"
                        onClick={goToNextChapter}
                        disabled={!hasNextChapter}
                        className="gap-2"
                      >
                        Chapitre suivant
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
