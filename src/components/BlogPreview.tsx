import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Eye, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/hooks/useBlogPosts";
import { BlogCoverImage } from "@/components/ui/BlogImage";

interface BlogPreviewProps {
  posts: BlogPost[];
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ posts }) => {
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Tutoriels: "#10b981",
      "Marketing Vidéo": "#8b5cf6",
      "Création de contenu": "#f59e0b",
      default: "#6366f1",
    };
    return colors[category || "default"] || colors.default;
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Derniers articles du{" "}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              blog
            </span>
          </h2>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Découvrez nos guides, tutoriels et conseils pour maîtriser l'IA
            créative
          </p>
        </motion.div>

        {/* Blog Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {posts.map((post) => (
            <motion.article
              key={post.id}
              variants={item}
              className="group relative"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-full rounded-3xl bg-dark-900/50 backdrop-blur-sm border border-dark-700/50 hover:border-primary-500/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] overflow-hidden">
                  {/* Image de couverture */}
                  {post.coverImage && (
                    <div className="h-48 relative overflow-hidden">
                      <BlogCoverImage
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay catégorie sur l'image */}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                            style={{
                              backgroundColor:
                                getCategoryColor(post.category) + "E6",
                            }}
                          >
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-6">
                    {/* Category Badge (si pas d'image) */}
                    {!post.coverImage && post.category && (
                      <div className="mb-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCategoryColor(post.category),
                          }}
                        >
                          {post.category}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-dark-300 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-dark-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author.name || "Équipe Sorami"}</span>
                        </div>
                        {post.readingTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readingTime} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.viewsCount.toLocaleString()}</span>
                        </div>
                        {post._count?.comments && (
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post._count.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-dark-500 mb-4">
                      {post.publishedAt
                        ? formatDate(post.publishedAt)
                        : formatDate(post.createdAt)}
                    </div>

                    {/* Read More Link */}
                    <div className="flex items-center text-primary-400 group-hover:text-primary-300 transition-colors duration-300">
                      <span className="font-medium">Lire la suite</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>

                    {/* Gradient Hover Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 pointer-events-none" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA to Blog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="group border-primary-500/50 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
            >
              Voir tous les articles
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogPreview;
