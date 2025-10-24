"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  FileText,
  Image,
  Video,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUser();

  const stats = [
    {
      label: "Articles créés",
      value: "24",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Livres générés",
      value: "8",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Images créées",
      value: "156",
      icon: Image,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Vidéos produites",
      value: "42",
      icon: Video,
      color: "from-orange-500 to-red-500",
    },
  ];

  const achievements = [
    {
      title: "Premier article",
      description: "Créé votre premier article de blog",
      icon: "🎯",
      unlocked: true,
    },
    {
      title: "Créateur prolifique",
      description: "Publié 10 articles",
      icon: "✍️",
      unlocked: true,
    },
    {
      title: "Maître SEO",
      description: "Obtenu un score SEO de 95+",
      icon: "🏆",
      unlocked: true,
    },
    {
      title: "Auteur",
      description: "Écrit 5 livres complets",
      icon: "📚",
      unlocked: true,
    },
    {
      title: "Créateur multimédia",
      description: "Utilisé les 4 outils de création",
      icon: "🎨",
      unlocked: true,
    },
    {
      title: "Expert IA",
      description: "100 contenus générés",
      icon: "🤖",
      unlocked: false,
    },
  ];

  const recentActivity = [
    {
      type: "blog",
      title: "Intelligence Artificielle en 2025",
      date: "Il y a 2 heures",
      icon: FileText,
    },
    {
      type: "book",
      title: "Guide complet du Marketing Digital",
      date: "Hier",
      icon: BookOpen,
    },
    {
      type: "image",
      title: "Illustration pour article tech",
      date: "Il y a 3 jours",
      icon: Image,
    },
    {
      type: "video",
      title: "Tutoriel SEO",
      date: "Il y a 5 jours",
      icon: Video,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-1">
                  <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "Profile"}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-primary-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center border-4 border-dark-900">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  {user?.fullName || "Utilisateur"}
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 text-dark-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Membre depuis octobre 2025</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
                  <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                    <span className="text-sm text-primary-300 font-medium">
                      Plan Pro
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-sm text-green-300 font-medium">
                      Niveau 12
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline">Partager profil</Button>
                <Button
                  variant="glow"
                  onClick={() => (window.location.href = "/settings")}
                >
                  Modifier profil
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-4">
                  Statistiques
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4 text-center hover:border-primary-500/50 transition-all group"
                      >
                        <div
                          className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-dark-400">
                          {stat.label}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                  <h2 className="text-2xl font-display font-bold text-white">
                    Activité récente
                  </h2>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-all cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center group-hover:bg-primary-500/20 transition-all">
                          <Icon className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium group-hover:text-primary-300 transition-colors">
                            {activity.title}
                          </p>
                          <p className="text-sm text-dark-400">
                            {activity.date}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary-400" />
                  <h2 className="text-xl font-display font-bold text-white">
                    Succès
                  </h2>
                </div>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        achievement.unlocked
                          ? "bg-primary-500/10 border-primary-500/30"
                          : "bg-dark-800/30 border-dark-700/30 opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              achievement.unlocked
                                ? "text-white"
                                : "text-dark-400"
                            }`}
                          >
                            {achievement.title}
                          </p>
                          <p className="text-sm text-dark-400 mt-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-display font-bold text-white mb-4">
                  Progression vers le niveau 13
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">XP</span>
                    <span className="text-white font-semibold">
                      8,450 / 10,000
                    </span>
                  </div>
                  <div className="w-full bg-dark-800/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "84.5%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-dark-300">
                    Plus que 1,550 XP pour débloquer des récompenses exclusives
                    !
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
