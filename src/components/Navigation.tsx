"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  Home,
  Sparkles,
  Video,
  FileText,
  BookOpen,
  Image,
  Zap,
  Users,
  Settings,
  LogIn,
  User,
  Search,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import NotificationCenter from "@/components/NotificationCenter";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

// Navigation items pour utilisateurs connectés
const protectedNavItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Tableau de bord",
    description: "Vue d'ensemble de vos projets",
  },
  {
    href: "/generate-images",
    icon: Image,
    label: "Générer des images",
    description: "IA créative pour vos visuels",
  },
  {
    href: "/generate-videos",
    icon: Video,
    label: "Créer des vidéos",
    description: "Montage vidéo automatisé",
  },
  {
    href: "/blog",
    icon: FileText,
    label: "Rédiger un article",
    description: "Contenu optimisé SEO",
  },
  {
    href: "/books",
    icon: BookOpen,
    label: "Écrire un ebook",
    description: "Livres numériques complets",
  },
];

// Navigation items publiques
const publicNavItems = [
  { href: "/", label: "Accueil" },
  { href: "/blog", label: "Blog" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
];

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Fermer le sidebar quand on clique en dehors
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted || !isLoaded) {
    return null; // Éviter les problèmes d'hydratation
  }

  const isDashboardPage = pathname?.startsWith("/dashboard");

  return (
    <>
      {/* Navigation principale */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800/50",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Sorami
              </span>
            </Link>

            {/* Navigation publique (desktop) */}
            <div className="hidden lg:flex items-center space-x-8">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    pathname === item.href
                      ? "text-primary-400"
                      : "text-dark-300 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Utilisateur connecté */}
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  {/* Bouton sidebar (utilisateurs connectés uniquement) */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 transition-colors duration-200"
                    aria-label="Ouvrir le menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  {/* Notifications */}
                  <NotificationCenter />

                  {/* User button */}
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-8 h-8 ring-2 ring-primary-500/50 hover:ring-primary-400 transition-all duration-200",
                      },
                    }}
                  />
                </div>
              ) : (
                /* Utilisateur non connecté */
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary-500/50 text-primary-400 hover:bg-primary-500 hover:text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Connexion
                    </Button>
                  </SignInButton>

                  <SignInButton mode="modal">
                    <Button variant="glow" size="sm">
                      Commencer
                    </Button>
                  </SignInButton>
                </div>
              )}

              {/* Mobile menu button (public) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-800/50 text-white"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navigation;
