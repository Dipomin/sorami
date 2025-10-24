"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  FileText,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

interface DetailedStats {
  images: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    today: number;
    avgPerDay: number;
  };
  videos: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    today: number;
    avgPerDay: number;
  };
  articles: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    today: number;
    avgPerDay: number;
  };
  books: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    today: number;
    avgPerDay: number;
  };
}

interface TimeRange {
  label: string;
  value: "today" | "week" | "month" | "all";
}

const timeRanges: TimeRange[] = [
  { label: "Aujourd'hui", value: "today" },
  { label: "Cette semaine", value: "week" },
  { label: "Ce mois-ci", value: "month" },
  { label: "Tout", value: "all" },
];

export default function StatsPage() {
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] =
    useState<TimeRange["value"]>("month");

  useEffect(() => {
    // Charger les statistiques détaillées
    fetch("/api/dashboard/stats/detailed")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((error) => {
        console.error("Error loading detailed stats:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatsByRange = (contentType: keyof DetailedStats) => {
    if (!stats) return 0;
    const data = stats[contentType];
    switch (selectedRange) {
      case "today":
        return data.today;
      case "week":
        return data.thisWeek;
      case "month":
        return data.thisMonth;
      case "all":
        return data.total;
      default:
        return data.total;
    }
  };

  const calculateGrowth = (contentType: keyof DetailedStats) => {
    if (!stats) return { value: 0, isPositive: true };
    const data = stats[contentType];
    const growth =
      ((data.thisMonth - data.lastMonth) / (data.lastMonth || 1)) * 100;
    return {
      value: Math.abs(Math.round(growth)),
      isPositive: growth >= 0,
    };
  };

  const contentTypes = [
    {
      key: "images" as keyof DetailedStats,
      label: "Images",
      icon: Image,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-400",
    },
    {
      key: "videos" as keyof DetailedStats,
      label: "Vidéos",
      icon: Video,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      key: "articles" as keyof DetailedStats,
      label: "Articles",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      key: "books" as keyof DetailedStats,
      label: "Livres",
      icon: BookOpen,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Retour au tableau de bord</span>
            </Link>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              Statistiques détaillées
            </h1>
            <p className="text-dark-300">
              Analysez vos performances et suivez votre progression
            </p>
          </div>
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">Total de contenus</p>
                <p className="text-2xl font-bold text-white">
                  {stats
                    ? stats.images.total +
                      stats.videos.total +
                      stats.articles.total +
                      stats.books.total
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-2">
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                  selectedRange === range.value
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                    : "text-dark-400 hover:text-white hover:bg-dark-800/50"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentTypes.map((content, index) => {
            const growth = calculateGrowth(content.key);
            const value = getStatsByRange(content.key);
            const avgPerDay = stats?.[content.key].avgPerDay || 0;

            return (
              <motion.div
                key={content.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 hover:border-dark-700/50 transition-all">
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="w-12 h-12 bg-dark-800/50 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-dark-800/50 rounded w-1/2" />
                        <div className="h-8 bg-dark-800/50 rounded w-3/4" />
                      </div>
                      <div className="h-4 bg-dark-800/50 rounded w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-3 rounded-xl", content.bgColor)}>
                          <content.icon
                            className={cn("w-6 h-6", content.textColor)}
                          />
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            growth.isPositive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {growth.isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{growth.value}%</span>
                        </div>
                      </div>
                      <p className="text-dark-400 text-sm mb-1">
                        {content.label}
                      </p>
                      <p className="text-3xl font-bold text-white mb-4">
                        {value}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-dark-400">
                        <Zap className="w-4 h-4" />
                        <span>Moyenne: {avgPerDay.toFixed(1)}/jour</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                Performance mensuelle
              </h2>
            </div>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-dark-800/50 rounded w-24" />
                        <div className="h-4 bg-dark-800/50 rounded w-16" />
                      </div>
                      <div className="h-2 bg-dark-800/50 rounded-full" />
                    </div>
                  ))
                : contentTypes.map((content) => {
                    const thisMonth = stats?.[content.key].thisMonth || 0;
                    const total = stats?.[content.key].total || 1;
                    const percentage = Math.round((thisMonth / total) * 100);

                    return (
                      <div key={content.key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-dark-300 text-sm">
                            {content.label}
                          </span>
                          <span className="text-white font-medium">
                            {thisMonth} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-dark-800/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r",
                              content.color
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                Activité récente
              </h2>
            </div>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-dark-800/50 rounded-lg" />
                        <div className="h-4 bg-dark-800/50 rounded w-24" />
                      </div>
                      <div className="h-6 bg-dark-800/50 rounded w-16" />
                    </div>
                  ))
                : contentTypes.map((content) => {
                    const today = stats?.[content.key].today || 0;
                    const thisWeek = stats?.[content.key].thisWeek || 0;

                    return (
                      <div
                        key={content.key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn("p-2 rounded-lg", content.bgColor)}
                          >
                            <content.icon
                              className={cn("w-4 h-4", content.textColor)}
                            />
                          </div>
                          <span className="text-dark-300 text-sm">
                            {content.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {today} aujourd'hui
                          </p>
                          <p className="text-dark-400 text-xs">
                            {thisWeek} cette semaine
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Insights Card */}
        <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-2">
                Aperçu de vos performances
              </h3>
              <p className="text-dark-300 mb-4">
                {stats ? (
                  <>
                    Vous avez créé{" "}
                    <span className="text-white font-semibold">
                      {stats.images.thisMonth +
                        stats.videos.thisMonth +
                        stats.articles.thisMonth +
                        stats.books.thisMonth}
                    </span>{" "}
                    contenus ce mois-ci, avec une moyenne de{" "}
                    <span className="text-white font-semibold">
                      {(
                        (stats.images.avgPerDay +
                          stats.videos.avgPerDay +
                          stats.articles.avgPerDay +
                          stats.books.avgPerDay) /
                        4
                      ).toFixed(1)}
                    </span>{" "}
                    contenus par jour. Continue comme ça ! 🚀
                  </>
                ) : (
                  "Chargement de vos statistiques..."
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((content) => {
                  const growth = calculateGrowth(content.key);
                  if (!growth.isPositive || growth.value < 10) return null;

                  return (
                    <div
                      key={content.key}
                      className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>
                        {content.label} +{growth.value}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
