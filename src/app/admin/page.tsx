"use client";

import { motion } from "framer-motion";
import { Shield, Users, Settings, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const adminFeatures = [
    {
      icon: FileText,
      title: "Gestion du Blog",
      description: "Créer, modifier et supprimer des articles de blog",
      href: "/admin/blog",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Gestion des utilisateurs",
      description: "Promouvoir des utilisateurs et gérer les rôles",
      href: "/admin/promote",
      color: "from-purple-500 to-indigo-500",
      devOnly: true,
    },
    {
      icon: Settings,
      title: "Logs système",
      description: "Consulter les logs et l'activité de la plateforme",
      href: "/admin/logs",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Administration Sorami
            </span>
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Gérez votre plateforme, les utilisateurs et le contenu en toute
            sécurité.
          </p>
        </motion.div>

        {/* Stats rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-300 text-sm">Statut système</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-semibold">Opérationnel</span>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
            <span className="text-dark-300 text-sm block mb-2">
              Niveau d'accès
            </span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold">Administrateur</span>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6">
            <span className="text-dark-300 text-sm block mb-2">Protection</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Rôle vérifié</span>
            </div>
          </div>
        </motion.div>

        {/* Features admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 h-full cursor-pointer">
                  {/* Badge dev only */}
                  {feature.devOnly && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                        Dev only
                      </span>
                    </div>
                  )}

                  {/* Icône */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Contenu */}
                  <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300 text-sm">{feature.description}</p>

                  {/* Flèche */}
                  <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Accéder</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Note de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Zone sécurisée</h4>
              <p className="text-sm text-dark-300">
                Cette section est protégée et accessible uniquement aux
                utilisateurs disposant du rôle <strong>ADMIN</strong> ou{" "}
                <strong>SUPER_ADMIN</strong>. Toutes les actions sont
                enregistrées dans les logs système.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
