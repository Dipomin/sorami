"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book as BookIcon,
  ArrowLeft,
  Sparkles,
  FileText,
  Target,
  Lightbulb,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import { useBookCreation } from "@/hooks/useBookCreation";

const CreateBookPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const {
    isLoading,
    error,
    createBook,
    clearError,
    reset,
    jobId,
    bookId,
    isCompleted,
    progress,
    status,
  } = useBookCreation();

  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    goal: "",
  });

  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  // Rediriger vers le livre une fois terminé
  React.useEffect(() => {
    if (isCompleted && bookId) {
      // Notification de succès
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Livre généré avec succès ! 🎉", {
          body: "Votre livre est prêt à être consulté",
          icon: "/favicon.ico",
        });
      }

      // Attendre 2 secondes pour que l'utilisateur voie le message de succès
      const timeout = setTimeout(() => {
        router.push(`/books/${bookId}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCompleted, bookId, router]);

  // Demander la permission pour les notifications au chargement
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookRequest = {
      title: formData.title,
      topic: formData.topic,
      goal: formData.goal,
      chapters: [
        { title: "Introduction", description: "Introduction au sujet" },
        { title: "Développement", description: "Développement principal" },
        { title: "Conclusion", description: "Conclusion et résumé" },
      ],
    };

    await createBook(bookRequest);
  };

  const handleReset = () => {
    setFormData({ title: "", topic: "", goal: "" });
    reset();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/books">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-primary-400" />
                Créer un Livre avec l'IA
              </h1>
              <p className="text-dark-300">
                Générez un livre complet en quelques minutes grâce à
                l'intelligence artificielle
              </p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Success State - Livre terminé */}
            {isCompleted && bookId && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-dark-800/30 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center relative overflow-hidden"
              >
                {/* Animation de succès en arrière-plan */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 bg-green-500/20 rounded-full"
                />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 relative"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white mb-4"
                >
                  Livre généré avec succès ! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-dark-300 mb-6"
                >
                  Votre livre est prêt ! Redirection en cours...
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-3"
                >
                  <Button
                    onClick={() => router.push(`/books/${bookId}`)}
                    className="bg-gradient-violet hover:opacity-90 transition-opacity shadow-glow"
                  >
                    <BookIcon className="w-4 h-4 mr-2" />
                    Voir mon livre
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer un autre livre
                  </Button>
                </motion.div>

                {/* Indicateur de décompte */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-sm text-dark-400"
                >
                  Redirection automatique dans 2 secondes...
                </motion.div>
              </motion.div>
            )}

            {/* Progress State - Job créé mais pas terminé */}
            {jobId && !isCompleted && !error && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-800/30 backdrop-blur-xl border border-primary-500/30 rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Livre en cours de génération !
                </h2>
                <p className="text-dark-300 mb-2">
                  Votre livre est en cours de création par notre IA
                </p>

                {/* Barre de progression */}
                <div className="mt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-dark-400">Progression</span>
                    <span className="text-sm font-bold text-primary-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-900/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-violet"
                    />
                  </div>
                  {status && (
                    <p className="text-sm text-dark-400 mt-2">
                      Status: {status}
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-3">
                  <Link href="/books">
                    <Button variant="outline">
                      <BookIcon className="w-4 h-4 mr-2" />
                      Voir mes livres
                    </Button>
                  </Link>
                </div>

                {/* Progress Animation */}
                <div className="mt-8 p-6 bg-dark-900/50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                    <span className="text-dark-300">
                      Génération en cours...
                    </span>
                  </div>
                  <div className="space-y-3 text-left text-sm text-dark-400">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          progress > 0
                            ? "bg-green-500"
                            : "bg-dark-600 animate-pulse"
                        )}
                      />
                      <span>Analyse du sujet et des objectifs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          progress > 30
                            ? "bg-green-500"
                            : progress > 0
                            ? "bg-primary-500 animate-pulse"
                            : "bg-dark-600"
                        )}
                      />
                      <span>Génération du plan du livre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          progress > 70
                            ? "bg-green-500"
                            : progress > 30
                            ? "bg-primary-500 animate-pulse"
                            : "bg-dark-600"
                        )}
                      />
                      <span>Rédaction des chapitres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          progress > 90
                            ? "bg-green-500 animate-pulse"
                            : "bg-dark-600"
                        )}
                      />
                      <span>Finalisation du livre</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-800/30 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Erreur de génération
                    </h3>
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button
                      onClick={clearError}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form State */}
            {!jobId && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Titre */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-dark-800/30 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
                  >
                    <label className="flex items-center gap-3 text-white font-bold mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-violet flex items-center justify-center">
                        <BookIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xl">Titre du livre</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Guide complet du développement web moderne"
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-sm text-dark-400 mt-2">
                      Choisissez un titre clair et descriptif pour votre livre
                    </p>
                  </motion.div>

                  {/* Sujet */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-dark-800/30 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
                  >
                    <label className="flex items-center gap-3 text-white font-bold mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-violet flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xl">Sujet principal</span>
                    </label>
                    <textarea
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      placeholder="Ex: Le développement web avec React, Next.js et TypeScript. Couvre les concepts fondamentaux, les bonnes pratiques et des exemples concrets..."
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-sm text-dark-400 mt-2">
                      Décrivez le sujet principal que vous souhaitez aborder
                    </p>
                  </motion.div>

                  {/* Objectif */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-dark-800/30 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
                  >
                    <label className="flex items-center gap-3 text-white font-bold mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-violet flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="text-xl">Objectif du livre</span>
                    </label>
                    <textarea
                      value={formData.goal}
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                      placeholder="Ex: Aider les développeurs débutants à maîtriser les technologies web modernes et créer leurs premières applications professionnelles..."
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-sm text-dark-400 mt-2">
                      Définissez l'objectif et ce que les lecteurs apprendront
                    </p>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !formData.title ||
                        !formData.topic ||
                        !formData.goal
                      }
                      className="w-full py-6 text-lg font-bold bg-gradient-violet hover:opacity-90 transition-opacity shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Générer le livre avec l'IA
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 bg-primary-500/5 border border-primary-500/20 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">
                        Comment ça fonctionne ?
                      </h3>
                      <ol className="space-y-2 text-dark-300">
                        <li className="flex items-start gap-2">
                          <span className="text-primary-400 font-bold">1.</span>
                          <span>
                            Définissez le titre et le sujet de votre livre
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-400 font-bold">2.</span>
                          <span>
                            Décrivez l'objectif et le contenu souhaité
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-400 font-bold">3.</span>
                          <span>
                            L'IA génère automatiquement un plan détaillé
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-400 font-bold">4.</span>
                          <span>
                            Chaque chapitre est écrit de manière approfondie
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-400 font-bold">5.</span>
                          <span>
                            Consultez et modifiez votre livre dans l'onglet "Mes
                            livres"
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateBookPage;
