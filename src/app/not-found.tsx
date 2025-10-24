"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-violet opacity-20 blur-3xl" />
          <h1 className="relative text-9xl md:text-[12rem] font-display font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-600 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Page introuvable
          </h2>
          <p className="text-xl text-dark-300 mb-2">
            Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <p className="text-dark-400">
            Il semblerait que vous vous soyez égaré dans l'espace numérique...
          </p>
        </motion.div>

        {/* Animated illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <Sparkles className="w-24 h-24 text-primary-400 opacity-60" />
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button variant="glow" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-dark-800/50"
        >
          <p className="text-dark-400 mb-4">Pages populaires :</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/generation-images"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Génération d'images
            </Link>
            <span className="text-dark-700">•</span>
            <Link
              href="/generation-videos"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Génération de vidéos
            </Link>
            <span className="text-dark-700">•</span>
            <Link
              href="/blog"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Blog
            </Link>
            <span className="text-dark-700">•</span>
            <Link
              href="/books"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Ebooks
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
