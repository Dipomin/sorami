"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Sparkles } from "lucide-react";

interface GeneratedImagesGalleryProps {
  images: string[];
}

const GeneratedImagesGallery: React.FC<GeneratedImagesGalleryProps> = ({
  images,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Filtrer les images qui ont échoué au chargement
  const validImages = images.filter((img) => !failedImages.has(img));

  const handleImageError = (imagePath: string) => {
    setFailedImages((prev) => new Set(prev).add(imagePath));
  };

  const handleImageLoad = (imagePath: string) => {
    setLoadedImages((prev) => new Set(prev).add(imagePath));
  };

  // Diviser les images en deux lignes (uniquement les images valides)
  const midPoint = Math.ceil(validImages.length / 2);
  const firstRow = validImages.slice(0, midPoint);
  const secondRow = validImages.slice(midPoint);

  // Dupliquer les images pour un défilement infini sans coupure
  const firstRowImages = [...firstRow, ...firstRow, ...firstRow];
  const secondRowImages = [...secondRow, ...secondRow, ...secondRow];

  // Ne rien afficher si aucune image n'est valide
  if (validImages.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 overflow-hidden bg-gradient-to-b from-dark-950/50 to-dark-900/30">
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-primary-400 text-sm font-semibold">
              Galerie IA
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Images générées par notre IA
          </h2>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Découvrez quelques créations réalisées avec notre générateur
            d'images
          </p>
        </motion.div>
      </div>

      {/* Première ligne - défilement vers la droite */}
      <div className="relative mb-6 overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [0, -33.33 + "%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {firstRowImages.map((image, index) => (
            <motion.div
              key={`row1-${index}`}
              className="relative flex-shrink-0 w-64 h-64 rounded-2xl overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                alt={`Image générée ${index + 1}`}
                fill
                className="object-cover"
                sizes="256px"
                onError={() => handleImageError(image)}
                onLoad={() => handleImageLoad(image)}
                unoptimized
              />
              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-semibold">
                    Cliquez pour agrandir
                  </p>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 ring-2 ring-primary-500/0 group-hover:ring-primary-500/50 rounded-2xl transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Deuxième ligne - défilement vers la gauche */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [-33.33 + "%", 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {secondRowImages.map((image, index) => (
            <motion.div
              key={`row2-${index}`}
              className="relative flex-shrink-0 w-64 h-64 rounded-2xl overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                alt={`Image générée ${index + 1}`}
                fill
                className="object-cover"
                sizes="256px"
                onError={() => handleImageError(image)}
                onLoad={() => handleImageLoad(image)}
                unoptimized
              />
              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-semibold">
                    Cliquez pour agrandir
                  </p>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 ring-2 ring-accent-500/0 group-hover:ring-accent-500/50 rounded-2xl transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal pour afficher l'image en taille réelle */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            {/* Bouton fermer */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-dark-900/80 border border-dark-700 hover:bg-dark-800 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Image en taille réelle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-primary-500/30">
                <Image
                  src={selectedImage}
                  alt="Image agrandie"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-contain"
                  priority
                  unoptimized
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GeneratedImagesGallery;
