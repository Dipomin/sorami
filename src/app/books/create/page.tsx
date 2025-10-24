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
  const { isLoading, error, createBook, clearError, reset, jobId } =
    useBookCreation();

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
            {/* Success State - Job créé */}
            {jobId && !error && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-800/30 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Livre en cours de génération !
                </h2>
                <p className="text-dark-300 mb-2">
                  Votre livre est en cours de création par notre IA
                </p>
                <p className="text-sm text-dark-500 mb-6">Job ID: {jobId}</p>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleReset}
                    className="bg-gradient-violet hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer un autre livre
                  </Button>
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
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Analyse du sujet et des objectifs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                      <span>Génération du plan du livre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                      <span>Rédaction des chapitres</span>
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
