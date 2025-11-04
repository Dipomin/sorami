"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Play,
  Loader2,
  Download,
  RefreshCw,
  Wand2,
  ArrowLeft,
  Film,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

const durations = [
  { id: "5", label: "5 secondes", icon: "⚡" },
  { id: "10", label: "10 secondes", icon: "🎬" },
  { id: "15", label: "15 secondes", icon: "🎥" },
];

const qualities = [
  { id: "sd", label: "SD", desc: "480p" },
  { id: "hd", label: "HD", desc: "720p" },
  { id: "fhd", label: "Full HD", desc: "1080p" },
];

export default function GenerateVideosPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("hd");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ videoUrl: string } | null>(null);

  const { generateVideo } = useVideoGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Simuler la génération
    await generateVideo({ prompt });
  };

  const handleReset = () => {
    setResult(null);
    setPrompt("");
    setIsGenerating(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                Génération de Vidéos
              </h1>
              <p className="text-dark-300 mt-1">
                Créez des vidéos captivantes avec l'IA
              </p>
            </div>
          </div>
          {result && (
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelle vidéo
            </Button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Décrivez votre vidéo
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Une vidéo inspirante montrant l'innovation technologique en Afrique avec des plans aériens de villes modernes..."
                className="w-full h-32 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={isGenerating}
              />
              <p className="text-dark-400 text-sm mt-2">
                Décrivez les scènes, mouvements et ambiance souhaitée
              </p>
            </div>

            {/* Durée */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Durée de la vidéo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      duration === d.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <div className="text-3xl mb-2">{d.icon}</div>
                    <p className="text-sm font-medium text-white">{d.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Qualité */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Qualité vidéo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {qualities.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      quality === q.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <p className="text-lg font-bold text-white mb-1">
                      {q.label}
                    </p>
                    <p className="text-xs text-dark-400">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de génération */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              variant="glow"
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer la vidéo
                </>
              )}
            </Button>
          </motion.div>

          {/* Zone de résultats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Résultat</h3>
                {result && (
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full opacity-20 animate-ping" />
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Film className="w-12 h-12 text-white animate-pulse" />
                        </div>
                      </div>
                      <p className="text-white font-medium mb-2">
                        Création en cours...
                      </p>
                      <p className="text-dark-400 text-sm">
                        Traitement vidéo IA
                      </p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-dark-950 aspect-video group">
                        <video
                          src={result.videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                      <div className="mt-4 p-4 bg-dark-800/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-400">Durée:</span>
                          <span className="text-white font-medium">
                            {duration}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-400">Qualité:</span>
                          <span className="text-white font-medium">
                            {quality.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-dark-400"
                    >
                      <Play className="w-20 h-20 mx-auto mb-4 opacity-20" />
                      <p>Votre vidéo apparaîtra ici</p>
                      <p className="text-sm mt-2">
                        Décrivez la scène que vous imaginez
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Galerie récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Vos vidéos récentes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-video bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className="w-full h-full flex items-center justify-center text-dark-600 group-hover:text-dark-500">
                  <Video className="w-12 h-12" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
