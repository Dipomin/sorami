"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  FileText,
  BookOpen,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Créer une image",
    description: "Générez des images IA personnalisées",
    icon: Image,
    href: "/generation-images",
    color: "from-pink-500 to-rose-500",
    gradient: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
  },
  {
    title: "Créer une vidéo",
    description: "Produisez des vidéos captivantes",
    icon: Video,
    href: "/generation-videos",
    color: "from-purple-500 to-indigo-500",
    gradient: "bg-gradient-to-br from-purple-500/20 to-indigo-500/20",
  },
  {
    title: "Rédiger un article",
    description: "Écrivez des articles optimisés SEO",
    icon: FileText,
    href: "/blog",
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Générer un ebook",
    description: "Créez des livres numériques complets",
    icon: BookOpen,
    href: "/books",
    color: "from-violet-500 to-purple-500",
    gradient: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
  },
];

const stats = [
  { label: "Images générées", value: "47", icon: Image, change: "+12%" },
  { label: "Vidéos créées", value: "8", icon: Video, change: "+3%" },
  { label: "Articles publiés", value: "23", icon: FileText, change: "+18%" },
  { label: "Ebooks complétés", value: "5", icon: BookOpen, change: "+2%" },
];

const recentActivity = [
  {
    type: "image",
    title: "Image d'un chef africain dans un bureau moderne",
    time: "Il y a 2 heures",
    status: "completed",
  },
  {
    type: "article",
    title: "L'impact de l'IA dans l'éducation en Afrique",
    time: "Il y a 5 heures",
    status: "completed",
  },
  {
    type: "video",
    title: "Vidéo inspirante sur l'innovation",
    time: "Hier",
    status: "processing",
  },
  {
    type: "ebook",
    title: "Guide du marketing digital en 2025",
    time: "Il y a 2 jours",
    status: "completed",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-violet opacity-10 blur-3xl" />
          <div className="relative bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  Bienvenue sur Sorami 👋
                </h1>
                <p className="text-dark-300 text-lg">
                  Que souhaitez-vous créer aujourd'hui ?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 rounded-full bg-gradient-violet opacity-20 animate-pulse-slow" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 hover:border-primary-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={action.href}>
                  <div
                    className={cn(
                      "relative h-full p-6 rounded-2xl border border-dark-800/50 hover:border-primary-500/50 transition-all group cursor-pointer",
                      action.gradient
                    )}
                  >
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm rounded-2xl" />
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-full h-full text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-dark-300 text-sm mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Commencer</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Activité récente
            </h2>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl divide-y divide-dark-800/50">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-dark-800/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        activity.type === "image" && "bg-pink-500/10",
                        activity.type === "video" && "bg-purple-500/10",
                        activity.type === "article" && "bg-blue-500/10",
                        activity.type === "ebook" && "bg-violet-500/10"
                      )}
                    >
                      {activity.type === "image" && (
                        <Image className="w-5 h-5 text-pink-400" />
                      )}
                      {activity.type === "video" && (
                        <Video className="w-5 h-5 text-purple-400" />
                      )}
                      {activity.type === "article" && (
                        <FileText className="w-5 h-5 text-blue-400" />
                      )}
                      {activity.type === "ebook" && (
                        <BookOpen className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1 group-hover:text-primary-300 transition-colors truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {activity.time}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            activity.status === "completed" &&
                              "bg-green-500/10 text-green-400",
                            activity.status === "processing" &&
                              "bg-yellow-500/10 text-yellow-400"
                          )}
                        >
                          {activity.status === "completed"
                            ? "Terminé"
                            : "En cours"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Conseils rapides
            </h2>
            <div className="space-y-4">
              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Optimisez vos prompts
                </h3>
                <p className="text-dark-300 text-sm mb-4">
                  Soyez précis dans vos descriptions pour obtenir les meilleurs
                  résultats.
                </p>
                <Link href="/help/prompts">
                  <Button variant="ghost" size="sm" className="w-full">
                    En savoir plus
                  </Button>
                </Link>
              </div>

              <div className="bg-gradient-to-br from-primary-900/30 to-accent-900/30 backdrop-blur-sm border border-primary-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  ⚡ Crédits restants
                </h3>
                <p className="text-3xl font-bold text-white mb-2">47 / 500</p>
                <div className="w-full h-2 bg-dark-800/50 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-violet rounded-full"
                    style={{ width: "9.4%" }}
                  />
                </div>
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="w-full">
                    Recharger
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
