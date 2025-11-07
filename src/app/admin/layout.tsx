"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAccess() {
      if (!isLoaded) return;

      // Si pas connecté, rediriger vers la page de connexion
      if (!user) {
        router.push("/sign-in?redirect=/admin");
        return;
      }

      try {
        // Vérifier le rôle via l'API
        const response = await fetch("/api/admin/check-access");
        const data = await response.json();

        if (response.ok && data.authorized) {
          setIsAuthorized(true);
          setUserRole(data.role);
        } else {
          setIsAuthorized(false);
          // Rediriger après un court délai pour afficher le message
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setIsAuthorized(false);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    }

    checkAdminAccess();
  }, [user, isLoaded, router]);

  // Chargement initial
  if (!isLoaded || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-dark-300">Vérification des permissions...</p>
        </motion.div>
      </div>
    );
  }

  // Accès refusé
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">
            Accès refusé
          </h1>
          <p className="text-dark-300 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            section. Seuls les administrateurs peuvent accéder à cette zone.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900/50 rounded-lg text-sm text-dark-400">
            <Shield className="w-4 h-4" />
            <span>Rôle requis : ADMIN</span>
          </div>
          <p className="text-xs text-dark-400 mt-4">
            Redirection vers le tableau de bord...
          </p>
        </motion.div>
      </div>
    );
  }

  // Accès autorisé - afficher le contenu admin
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Bandeau admin */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-medium">
              Mode Administrateur
            </span>
            {userRole && (
              <span className="text-purple-400/60">• Rôle : {userRole}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu admin avec padding pour le bandeau */}
      <div className="pt-12">{children}</div>
    </div>
  );
}
