"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book as BookIcon,
  FileText,
  Calendar,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Clock,
  Loader2,
  ChevronRight,
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

const BooksPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

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

  const handleDeleteBook = async (book: Book) => {
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      const updatedBooks = books.filter((b) => b.id !== book.id);
      setBooks(updatedBooks);

      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

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
            <p className="text-dark-300">Chargement de vos livres...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                <BookIcon className="w-10 h-10 text-primary-400" />
                Mes Livres
              </h1>
              <p className="text-dark-300">
                Gérez et éditez vos livres générés par l'IA
              </p>
            </div>
            <Link href="/books/create">
              <Button className="bg-gradient-violet hover:opacity-90 transition-opacity shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Nouveau livre
              </Button>
            </Link>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {["all", "PUBLISHED", "DRAFT"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-4 py-3 rounded-xl font-medium transition-all",
                    filterStatus === status
                      ? "bg-gradient-violet text-white shadow-glow"
                      : "bg-dark-800/50 text-dark-300 hover:text-white hover:bg-dark-700"
                  )}
                >
                  {status === "all"
                    ? "Tous"
                    : status === "PUBLISHED"
                    ? "Publiés"
                    : "Brouillons"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-dark-800/50 flex items-center justify-center mx-auto mb-6">
              <BookIcon className="w-12 h-12 text-dark-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-dark-400 mb-6">
              Commencez par créer votre premier livre avec l'IA
            </p>
            <Link href="/books/create">
              <Button className="bg-gradient-violet hover:opacity-90 transition-opacity shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Créer un livre
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-dark-800/30 backdrop-blur-xl border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => router.push(`/books/${book.id}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-dark-400 line-clamp-2">
                        {book.description || "Aucune description"}
                      </p>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookToDelete(book);
                        setDeleteDialogOpen(true);
                      }}
                      className="ml-2"
                    >
                      <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-dark-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-dark-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{book.chapters?.length || 0} chapitres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {book.chapters?.reduce(
                          (total, ch) => total + countWords(ch.content),
                          0
                        ) || 0}{" "}
                        mots
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                    {getStatusBadge(book.status)}
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(book.updatedAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {deleteDialogOpen && bookToDelete && (
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
                  Êtes-vous sûr de vouloir supprimer "{bookToDelete.title}" ?
                  Cette action est irréversible.
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
                    onClick={() => handleDeleteBook(bookToDelete)}
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

export default BooksPage;
