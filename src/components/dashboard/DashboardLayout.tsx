"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  Video,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  User,
  Search,
  Bell,
  Menu,
  X,
  Film,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/dashboard/generation-images", icon: Image, label: "Images" },
  {
    href: "/dashboard/ecommerce-images",
    icon: ShoppingBag,
    label: "E-commerce",
  },
  { href: "/dashboard/generation-videos", icon: Video, label: "Vidéos" },
  {
    href: "/dashboard/custom-videos",
    icon: Film,
    label: "Vidéos personnalisées",
  },
  { href: "/dashboard/blog", icon: FileText, label: "Blog" },
  { href: "/dashboard/books", icon: BookOpen, label: "Ebooks" },
  { href: "/dashboard/profile", icon: User, label: "Profil" },
  { href: "/dashboard/stats", icon: BarChart3, label: "Statistiques" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Gérer l'hydratation pour éviter les erreurs SSR/client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Sur desktop (lg+), la sidebar est toujours visible
  // Sur mobile, elle est cachée par défaut
  const shouldShowSidebar = isMounted
    ? sidebarOpen || window.innerWidth >= 1024
    : true;

  // Afficher un loader pendant la vérification de l'authentification
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">
            Vérification de votre session...
          </p>
          <p className="text-dark-300 text-sm mt-2">
            Vous allez être redirigé dans un instant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: shouldShowSidebar ? 0 : -300 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-72 bg-dark-900/50 backdrop-blur-xl border-r border-dark-800/50 z-50",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-800/50">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-violet flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Sorami
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive
                      ? "bg-gradient-violet text-white shadow-glow"
                      : "text-dark-300 hover:text-white hover:bg-dark-800/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-white"
                        : "text-dark-400 group-hover:text-primary-400"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-dark-800/50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/30">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-primary-500",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || user?.username || "Mon profil"}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress ||
                    "Gérer mon compte"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-dark-800/50 text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800/50 text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-dark-800/50 text-dark-300 hover:text-white relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
              </button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-primary-500",
                  },
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
