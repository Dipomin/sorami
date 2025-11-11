"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Calendar, Image as ImageIcon, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    url: string;
    filename: string;
    width: number;
    height: number;
    format: string;
    aspectRatio: string;
    metadata?: any;
  };
  prompt?: string;
  createdAt?: string;
  additionalMetadata?: Record<string, any>;
}

export default function ImageModal({
  isOpen,
  onClose,
  image,
  prompt,
  createdAt,
  additionalMetadata,
}: ImageModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {image.filename}
                  </h2>
                  {createdAt && (
                    <p className="text-sm text-dark-400">
                      Généré{" "}
                      {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="bg-dark-800/50 rounded-xl p-4 flex items-center justify-center">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="max-w-full max-h-[500px] object-contain rounded-lg"
                  />
                </div>

                {/* Informations */}
                <div className="space-y-6">
                  {/* Prompt */}
                  {prompt && (
                    <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Wand2 className="w-4 h-4 text-primary-400" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                          Prompt utilisé
                        </h3>
                      </div>
                      <p className="text-dark-200 text-sm leading-relaxed">
                        {prompt}
                      </p>
                    </div>
                  )}

                  {/* Métadonnées techniques */}
                  <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
                      Informations techniques
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-dark-400 mb-1">Dimensions</p>
                        <p className="text-white font-medium">
                          {image.width} × {image.height}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 mb-1">Format</p>
                        <p className="text-white font-medium uppercase">
                          {image.format}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 mb-1">
                          Ratio d'aspect
                        </p>
                        <p className="text-white font-medium">
                          {image.aspectRatio}
                        </p>
                      </div>
                      {createdAt && (
                        <div>
                          <p className="text-xs text-dark-400 mb-1">Date</p>
                          <p className="text-white font-medium">
                            {new Date(createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métadonnées additionnelles */}
                  {additionalMetadata &&
                    Object.keys(additionalMetadata).length > 0 && (
                      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
                          Métadonnées de génération
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(additionalMetadata).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-dark-400 capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span className="text-white font-medium">
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Image metadata (si disponible) */}
                  {image.metadata && (
                    <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
                        Métadonnées de l'image
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(image.metadata).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-dark-400 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-white font-medium">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bouton téléchargement */}
                  <Button
                    onClick={handleDownload}
                    variant="glow"
                    size="lg"
                    className="w-full"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger l'image
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
