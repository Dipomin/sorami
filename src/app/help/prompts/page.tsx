"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Image,
  Video,
  Book,
  MessageSquare,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PromptsHelpPage() {
  const router = useRouter();

  const promptExamples = [
    {
      category: "Génération d'images",
      icon: Image,
      color: "from-blue-500 to-cyan-500",
      prompts: [
        {
          title: "Image professionnelle",
          prompt:
            "Une photographie professionnelle en haute résolution d'un produit tech moderne sur fond blanc minimaliste, éclairage studio, ultra détaillé, 8K",
        },
        {
          title: "Art conceptuel",
          prompt:
            "Un paysage cyberpunk futuriste au coucher de soleil, néons violets et bleus, architecture verticale, style art numérique détaillé",
        },
        {
          title: "Portrait artistique",
          prompt:
            "Portrait expressif d'une personne créative, éclairage dramatique, couleurs vibrantes, style peinture à l'huile numérique",
        },
      ],
    },
    {
      category: "Génération de vidéos",
      icon: Video,
      color: "from-purple-500 to-pink-500",
      prompts: [
        {
          title: "Vidéo produit",
          prompt:
            "Rotation fluide à 360° d'un produit sur fond blanc, éclairage professionnel, zoom progressif sur les détails, 30 secondes",
        },
        {
          title: "Animation logo",
          prompt:
            "Animation d'apparition élégante d'un logo moderne, particules lumineuses, transition fluide, fond dégradé animé, 10 secondes",
        },
        {
          title: "Vidéo publicitaire",
          prompt:
            "Séquence dynamique présentant les avantages d'un service tech, transitions modernes, texte animé, musique enjouée, 60 secondes",
        },
      ],
    },
    {
      category: "Génération de livres",
      icon: Book,
      color: "from-green-500 to-emerald-500",
      prompts: [
        {
          title: "Guide pratique",
          prompt:
            "Un guide complet sur le marketing digital pour débutants : stratégies réseaux sociaux, SEO, publicité en ligne, études de cas réels",
        },
        {
          title: "E-book business",
          prompt:
            "Livre sur l'automatisation d'entreprise : processus, outils, méthodologies, retours d'expérience d'entrepreneurs, exemples concrets",
        },
        {
          title: "Manuel technique",
          prompt:
            "Documentation technique complète d'une API REST moderne : architecture, authentification, endpoints, exemples de code, bonnes pratiques",
        },
      ],
    },
    {
      category: "Articles de blog",
      icon: FileText,
      color: "from-orange-500 to-red-500",
      prompts: [
        {
          title: "Article SEO",
          prompt:
            "Article optimisé SEO sur l'intelligence artificielle en 2025 : tendances, applications pratiques, impact sur les entreprises, 2000 mots",
        },
        {
          title: "Tutoriel détaillé",
          prompt:
            "Guide pas à pas pour créer une stratégie de contenu efficace : recherche mots-clés, planification éditoriale, outils recommandés, métriques de succès",
        },
        {
          title: "Analyse de marché",
          prompt:
            "Analyse approfondie du marché du SaaS en Afrique : opportunités, défis, acteurs clés, prévisions 2025-2030, données chiffrées",
        },
      ],
    },
  ];

  const bestPractices = [
    {
      icon: Sparkles,
      title: "Soyez spécifique",
      description:
        "Plus votre prompt est détaillé, meilleur sera le résultat. Incluez le style, l'ambiance, les couleurs, et les détails techniques souhaités.",
    },
    {
      icon: Lightbulb,
      title: "Utilisez des mots-clés techniques",
      description:
        "Des termes comme '4K', 'ultra détaillé', 'éclairage professionnel', 'style cinématographique' améliorent la qualité.",
    },
    {
      icon: Zap,
      title: "Structurez votre demande",
      description:
        "Organisez votre prompt : sujet principal → détails visuels → style artistique → qualité technique.",
    },
    {
      icon: MessageSquare,
      title: "Expérimentez et itérez",
      description:
        "N'hésitez pas à ajuster votre prompt et régénérer pour affiner le résultat selon vos besoins.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                Guide des Prompts
              </h1>
              <p className="text-dark-300 text-lg">
                Apprenez à créer des prompts efficaces pour obtenir les
                meilleurs résultats avec l'IA
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bonnes pratiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Bonnes pratiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestPractices.map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6 hover:border-primary-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                  <practice.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {practice.title}
                </h3>
                <p className="text-sm text-dark-300">{practice.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Exemples de prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Exemples de prompts
          </h2>
          <div className="space-y-8">
            {promptExamples.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + catIndex * 0.1 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {category.category}
                  </h3>
                </div>

                {/* Prompts */}
                <div className="space-y-4">
                  {category.prompts.map((example, exIndex) => (
                    <div
                      key={exIndex}
                      className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 hover:border-primary-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {example.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(example.prompt);
                            // Toast notification
                          }}
                          className="text-xs"
                        >
                          Copier
                        </Button>
                      </div>
                      <p className="text-sm text-dark-300 leading-relaxed">
                        "{example.prompt}"
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips finaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-400" />
            Conseil Pro
          </h3>
          <p className="text-dark-200 leading-relaxed">
            Les meilleurs résultats sont obtenus en combinant plusieurs éléments
            : un sujet clair, des détails visuels précis, un style artistique
            défini, et des spécifications techniques. N'hésitez pas à
            expérimenter avec différentes formulations jusqu'à obtenir le
            résultat parfait !
          </p>
        </motion.div>
      </div>
    </div>
  );
}
