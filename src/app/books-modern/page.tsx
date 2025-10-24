"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Sparkles,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
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

const BooksModernPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "IN_PROGRESS":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "DRAFT":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-dark-700/50 text-dark-300 border-dark-600/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Terminé";
      case "IN_PROGRESS":
        return "En cours";
      case "DRAFT":
        return "Brouillon";
      default:
        return status;
    }
  };

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Chargement des livres...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  Mes Livres & E-books
                </h1>
                <p className="text-dark-300">
                  Gérez et créez vos livres et e-books avec l'IA
                </p>
              </div>
              <Button
                variant="glow"
                className="gap-2"
                onClick={() => router.push("/create")}
              >
                <Plus className="w-5 h-5" />
                Nouveau livre
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Rechercher un livre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-800/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-5 h-5" />
                Filtrer
              </Button>
            </div>
          </motion.div>

          {/* Books Grid */}
          <AnimatePresence mode="wait">
            {filteredBooks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  {searchQuery
                    ? "Aucun livre trouvé"
                    : "Aucun livre pour le moment"}
                </h3>
                <p className="text-dark-300 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "Essayez avec d'autres mots-clés"
                    : "Commencez par créer votre premier livre avec l'IA"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="glow"
                    className="gap-2"
                    onClick={() => router.push("/create")}
                  >
                    <Sparkles className="w-5 h-5" />
                    Créer mon premier livre
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div
                      onClick={() => router.push(`/books/${book.id}`)}
                      className="h-full bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 hover:border-primary-500/50 hover:shadow-glow transition-all duration-300 cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            book.status
                          )}`}
                        >
                          {getStatusLabel(book.status)}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                        {book.description}
                      </p>

                      {/* Topic */}
                      <div className="mb-4">
                        <span className="inline-block bg-primary-500/10 text-primary-300 text-xs px-2 py-1 rounded-lg border border-primary-500/20">
                          {book.topic}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-dark-400 pt-4 border-t border-dark-800/50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>
                            {book.chapters?.length || 0} chapitre
                            {(book.chapters?.length || 0) > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(book.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/books/${book.id}/edit`);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                          Éditer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle export
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Exporter
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BooksModernPage;
