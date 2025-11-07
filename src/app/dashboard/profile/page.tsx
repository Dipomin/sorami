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
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profileData, loading, error } = useProfile();

  // Fonction pour formater la date relative
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else if (diffInDays === 1) {
      return "Hier";
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `Il y a ${months} mois`;
    }
  };

  // Fonction pour formater la date d'inscription
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    return `Membre depuis ${date.toLocaleDateString("fr-FR", options)}`;
  };

  // Fonction pour obtenir l'icône selon le type d'activité
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "blog":
        return FileText;
      case "book":
        return BookOpen;
      case "image":
        return Image;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  // Statistiques avec données réelles
  const stats = [
    {
      label: "Articles créés",
      value: profileData?.stats.blogs.toString() || "0",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Livres générés",
      value: profileData?.stats.books.toString() || "0",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Images créées",
      value: profileData?.stats.images.toString() || "0",
      icon: Image,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Vidéos produites",
      value: profileData?.stats.videos.toString() || "0",
      icon: Video,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Chargement de votre profil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Erreur: {error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                    <span className="text-sm">
                      {profileData?.memberSince
                        ? formatMemberSince(profileData.memberSince)
                        : "Nouveau membre"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
                  {profileData?.subscription && (
                    <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                      <span className="text-sm text-primary-300 font-medium">
                        {profileData.subscription.plan}
                      </span>
                    </div>
                  )}
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-sm text-green-300 font-medium">
                      Niveau {profileData?.level.current || 1}
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
                  {profileData?.recentActivity &&
                  profileData.recentActivity.length > 0 ? (
                    profileData.recentActivity.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div
                          key={activity.id}
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
                              {formatRelativeDate(activity.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-dark-400">Aucune activité récente</p>
                    </div>
                  )}
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
                  {profileData?.achievements &&
                  profileData.achievements.length > 0 ? (
                    profileData.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
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
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-dark-400 text-sm">
                        Aucun succès pour le moment
                      </p>
                    </div>
                  )}
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
                  Progression vers le niveau{" "}
                  {(profileData?.level.current || 1) + 1}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">XP</span>
                    <span className="text-white font-semibold">
                      {profileData?.level.xp.toLocaleString()} /{" "}
                      {profileData?.level.nextLevelXP.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-dark-800/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((profileData?.level.xp || 0) /
                            (profileData?.level.nextLevelXP || 1)) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-dark-300">
                    Plus que{" "}
                    {(
                      (profileData?.level.nextLevelXP || 0) -
                      (profileData?.level.xp || 0)
                    ).toLocaleString()}{" "}
                    XP pour débloquer des récompenses exclusives !
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
