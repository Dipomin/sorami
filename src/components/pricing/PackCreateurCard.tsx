import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Zap } from "lucide-react";

interface PackCreateurCardProps {
  onBuy: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Composant carte pour l'offre Pack Créateur (paiement unique)
 * Affiche les détails de l'offre et le bouton d'achat
 */
export function PackCreateurCard({
  onBuy,
  isLoading = false,
  className = "",
}: PackCreateurCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="relative p-8 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl border-2 border-emerald-500/50 hover:border-emerald-400/70 transition-all duration-300">
        {/* Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full shadow-lg">
            ⚡ PAIEMENT UNIQUE
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Gauche : Info */}
          <div>
            {/* Icône */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-white" />
            </div>

            {/* Nom */}
            <h3 className="text-3xl font-bold text-white mb-3">
              Pack Créateur
            </h3>

            {/* Description */}
            <p className="text-dark-300 mb-4">
              Parfait pour démarrer avec Sorami. Achetez une fois, utilisez
              quand vous voulez !
            </p>

            {/* Prix */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">5,000</span>
                <span className="text-xl text-dark-400">F CFA</span>
              </div>
              <p className="text-emerald-400 text-sm mt-2 font-semibold">
                🎯 Aucun abonnement - Paiement unique
              </p>
            </div>
          </div>

          {/* Droite : Features + CTA */}
          <div>
            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-semibold text-sm">
                  20 générations d'images haute qualité
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-semibold text-sm">
                  2 articles de blog optimisés SEO
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-dark-300 text-sm">
                  Valable à vie - Pas d'expiration
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-dark-300 text-sm">
                  Stockage cloud sécurisé
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-dark-300 text-sm">Support par email</span>
              </div>
            </div>

            {/* Bouton */}
            <Button
              onClick={onBuy}
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Acheter le Pack Créateur
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
