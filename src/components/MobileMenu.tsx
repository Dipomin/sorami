import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Image,
  Video,
  FileText,
  BookOpen,
  Settings,
  User,
  Sparkles,
  X,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const mobileNavItems = [
  { href: "/dashboard", icon: Home, label: "Accueil", requiresAuth: true },
  {
    href: "/generate-images",
    icon: Image,
    label: "Images IA",
    requiresAuth: true,
  },
  {
    href: "/generate-videos",
    icon: Video,
    label: "Vidéos IA",
    requiresAuth: true,
  },
  { href: "/blog", icon: FileText, label: "Blog", requiresAuth: false },
  { href: "/books", icon: BookOpen, label: "Ebooks", requiresAuth: true },
  {
    href: "/dashboard/profile",
    icon: User,
    label: "Profil",
    requiresAuth: true,
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Paramètres",
    requiresAuth: true,
  },
];

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { isSignedIn, user } = useUser();
  const { getFilteredNavItems, isActiveRoute } = useNavigation();

  const filteredItems = getFilteredNavItems(mobileNavItems);

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Menu mobile */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-x-4 top-20 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-800/50 z-50 lg:hidden shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">
                      Menu
                    </h2>
                    {isSignedIn && (
                      <p className="text-sm text-dark-400">
                        {user?.firstName || "Utilisateur"}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-dark-800/50 text-dark-300 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                {isSignedIn ? (
                  // Menu pour utilisateurs connectés
                  filteredItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      custom={index}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center space-x-4 p-4 rounded-xl transition-all duration-200",
                          isActiveRoute(item.href)
                            ? "bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-white"
                            : "hover:bg-dark-800/50 text-dark-300 hover:text-white"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActiveRoute(item.href)
                              ? "bg-primary-500 text-white"
                              : "bg-dark-800/50 text-dark-400 group-hover:text-primary-400"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  // Menu pour utilisateurs non connectés
                  <>
                    {["/", "/blog", "/#features", "/#pricing"].map(
                      (href, index) => {
                        const labels = [
                          "Accueil",
                          "Blog",
                          "Fonctionnalités",
                          "Tarifs",
                        ];
                        return (
                          <motion.div
                            key={href}
                            custom={index}
                            variants={itemVariants}
                            initial="closed"
                            animate="open"
                          >
                            <Link
                              href={href}
                              onClick={onClose}
                              className={cn(
                                "block px-4 py-3 rounded-lg transition-colors",
                                isActiveRoute(href)
                                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                                  : "text-dark-300 hover:text-white hover:bg-dark-800/50"
                              )}
                            >
                              {labels[index]}
                            </Link>
                          </motion.div>
                        );
                      }
                    )}

                    {/* CTA Connexion */}
                    <motion.div
                      custom={4}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      className="pt-4 border-t border-dark-800/50"
                    >
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-primary-500/50 text-primary-400 hover:bg-primary-500 hover:text-white"
                          onClick={onClose}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Se connecter
                        </Button>
                        <Button
                          variant="glow"
                          size="sm"
                          className="w-full"
                          onClick={onClose}
                        >
                          Commencer gratuitement
                        </Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Footer info pour utilisateurs connectés */}
              {isSignedIn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-dark-800/50"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Crédits disponibles</span>
                    <span className="text-primary-400 font-medium">
                      {user?.publicMetadata?.credits || 0}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
