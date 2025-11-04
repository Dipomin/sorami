"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PenSquare, Search, Filter, AlertCircle } from "lucide-react";
import { BlogList } from "../../../components/BlogList";
import { useBlogs } from "../../../hooks/useBlogs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  const { blogs, loading, error, refetch } = useBlogs();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  Articles de blog
                </h1>
                <p className="text-dark-300">
                  Gérez vos articles de blog optimisés SEO
                </p>
              </div>
              <Link href="/blog/create">
                <Button variant="glow" className="gap-2">
                  <PenSquare className="w-5 h-5" />
                  Nouvel article
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  className="w-full bg-dark-900/50 border border-dark-800/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-5 h-5" />
                Filtrer
              </Button>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-300 mb-1">
                    Erreur de chargement
                  </h3>
                  <p className="text-sm text-red-200 mb-2">{error}</p>
                  <button
                    onClick={refetch}
                    className="text-sm text-red-300 hover:text-red-200 underline"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BlogList blogs={blogs} loading={loading} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
