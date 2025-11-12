"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Download,
  Share2,
  FileText,
  TrendingUp,
  Tag,
  Calendar,
  Clock,
  Edit3,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Settings,
  Sparkles,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Disable static generation
export const dynamic = "force-dynamic";

interface BlogArticle {
  id: string;
  title: string;
  topic: string;
  goal?: string;
  metaDescription?: string;
  introduction?: string;
  conclusion?: string;
  fullContent?: string;
  seoScore?: number;
  wordCount?: number;
  readabilityScore?: string;
  targetWordCount: number;
  tags?: string[];
  mainKeywords?: string[];
  sections?: Array<{
    heading: string;
    content: string;
  }>;
  status: string;
  visibility: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function BlogArticlePage() {
  const params = useParams();
  const router = useRouter();
  //const { toast } = useToast();
  const articleId = params.id as string;

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedMetaDescription, setEditedMetaDescription] = useState("");
  const [editedIntroduction, setEditedIntroduction] = useState("");
  const [editedConclusion, setEditedConclusion] = useState("");
  const [editedFullContent, setEditedFullContent] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // États UI
  const [showPreview, setShowPreview] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "seo">(
    "edit"
  );

  // Charger l'article
  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blog/articles/${articleId}`);

      if (!response.ok) {
        throw new Error("Article non trouvé");
      }

      const data = await response.json();
      setArticle(data);

      // Initialiser les champs d'édition
      setEditedTitle(data.title || "");
      setEditedMetaDescription(data.metaDescription || "");
      setEditedIntroduction(data.introduction || "");
      setEditedConclusion(data.conclusion || "");
      setEditedFullContent(data.fullContent || "");
      setEditedTags(data.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      toast.error("Impossible de charger l'article");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedTitle,
          metaDescription: editedMetaDescription,
          introduction: editedIntroduction,
          conclusion: editedConclusion,
          fullContent: editedFullContent,
          tags: editedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const updatedArticle = await response.json();
      setArticle(updatedArticle);
      setIsEditing(false);

      toast("✅ Sauvegardé", {
        description: "Les modifications ont été enregistrées",
      });
    } catch (err) {
      toast("Erreur", {
        description: "Impossible de sauvegarder les modifications",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleExport = (format: "markdown" | "html" | "pdf") => {
    if (!article) return;

    // Créer un blob avec le contenu
    let content = "";
    let filename = "";
    let mimeType = "";

    if (format === "markdown") {
      content = `# ${editedTitle}\n\n${editedIntroduction}\n\n${editedFullContent}\n\n${editedConclusion}`;
      filename = `${article.id}-article.md`;
      mimeType = "text/markdown";
    } else if (format === "html") {
      content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="description" content="${editedMetaDescription}">
  <title>${editedTitle}</title>
</head>
<body>
  <article>
    <h1>${editedTitle}</h1>
    <div class="introduction">${editedIntroduction}</div>
    <div class="content">${editedFullContent}</div>
    <div class="conclusion">${editedConclusion}</div>
  </article>
</body>
</html>`;
      filename = `${article.id}-article.html`;
      mimeType = "text/html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Article exporté en ${format.toUpperCase()}`);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Chargement de l'article...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !article) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Article introuvable
            </h2>
            <p className="text-dark-300 mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard/blog")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux articles
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/blog")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux articles
              </Button>

              <div className="flex items-center gap-3">
                {/* Bouton Prévisualisation */}
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Prévisualiser
                    </>
                  )}
                </Button>

                {/* Menu Export */}
                <div className="relative group">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={() => handleExport("markdown")}
                      className="w-full px-4 py-2 text-left text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors first:rounded-t-xl"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => handleExport("html")}
                      className="w-full px-4 py-2 text-left text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors last:rounded-b-xl"
                    >
                      HTML (.html)
                    </button>
                  </div>
                </div>

                {/* Bouton Sauvegarder */}
                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 bg-primary-600 hover:bg-primary-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                )}

                

                {/* Bouton Éditer */}
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Éditer
                  </Button>
                )}
              </div>
            </div>

            {/* Titre et méta */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-4xl font-display font-bold text-white bg-dark-800/50 border border-dark-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Titre de l'article"
                  />
                ) : (
                  <h1 className="text-4xl font-display font-bold text-white mb-2">
                    {article.title}
                  </h1>
                )}

                <div className="flex items-center gap-4 text-sm text-dark-400 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {article.wordCount
                      ? `${Math.ceil(article.wordCount / 200)} min de lecture`
                      : "N/A"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        article.status === "PUBLISHED"
                          ? "bg-green-500/20 text-green-300"
                          : article.status === "REVIEW"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Métriques SEO */}
          {showMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-400">Score SEO</span>
                  <TrendingUp className="w-4 h-4 text-primary-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {article.seoScore ? Math.round(article.seoScore) : "N/A"}
                </div>
                <div className="text-xs text-dark-500 mt-1">Sur 100</div>
              </div>

              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-400">Mots</span>
                  <FileText className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {article.wordCount || 0}
                </div>
                <div className="text-xs text-dark-500 mt-1">
                  Objectif: {article.targetWordCount}
                </div>
              </div>

              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-400">Lisibilité</span>
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {article.readabilityScore || "N/A"}
                </div>
                <div className="text-xs text-dark-500 mt-1">Score Flesch</div>
              </div>

              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-400">Mots-clés</span>
                  <Tag className="w-4 h-4 text-accent-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {article.mainKeywords?.length || 0}
                </div>
                <div className="text-xs text-dark-500 mt-1">Identifiés</div>
              </div>
            </motion.div>
          )}

          {/* Onglets */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-primary-600 text-white"
                  : "bg-dark-800/50 text-dark-300 hover:bg-dark-700/50"
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              Édition
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-primary-600 text-white"
                  : "bg-dark-800/50 text-dark-300 hover:bg-dark-700/50"
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Prévisualisation
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "seo"
                  ? "bg-primary-600 text-white"
                  : "bg-dark-800/50 text-dark-300 hover:bg-dark-700/50"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              SEO
            </button>
          </div>

          {/* Contenu selon l'onglet actif */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Onglet Édition */}
            {activeTab === "edit" && (
              <>
                {/* Meta Description */}
                <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Meta Description
                    </h3>
                    {editedMetaDescription && (
                      <span className="text-sm text-dark-400">
                        {editedMetaDescription.length}/160
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editedMetaDescription}
                      onChange={(e) => setEditedMetaDescription(e.target.value)}
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Description SEO de l'article (150-160 caractères)"
                    />
                  ) : (
                    <p className="text-dark-200">
                      {article.metaDescription || "Aucune description"}
                    </p>
                  )}
                </div>

                {/* Introduction */}
                <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Introduction
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editedIntroduction}
                      onChange={(e) => setEditedIntroduction(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Introduction de l'article"
                    />
                  ) : (
                    <div className="text-dark-200 whitespace-pre-wrap">
                      {article.introduction || "Aucune introduction"}
                    </div>
                  )}
                </div>

                {/* Contenu principal */}
                <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Contenu principal
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editedFullContent}
                      onChange={(e) => setEditedFullContent(e.target.value)}
                      rows={20}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                      placeholder="Contenu de l'article (Markdown supporté)"
                    />
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-dark-200 whitespace-pre-wrap">
                        {article.fullContent || "Aucun contenu"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Conclusion */}
                <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Conclusion
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editedConclusion}
                      onChange={(e) => setEditedConclusion(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Conclusion de l'article"
                    />
                  ) : (
                    <div className="text-dark-200 whitespace-pre-wrap">
                      {article.conclusion || "Aucune conclusion"}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Onglet Prévisualisation */}
            {activeTab === "preview" && (
              <div className="bg-white rounded-xl p-8 shadow-xl">
                <article className="prose prose-lg max-w-none">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {editedTitle}
                  </h1>

                  {editedMetaDescription && (
                    <p className="text-lg text-gray-600 italic mb-8">
                      {editedMetaDescription}
                    </p>
                  )}

                  {editedIntroduction && (
                    <div className="text-gray-700 mb-6 whitespace-pre-wrap">
                      {editedIntroduction}
                    </div>
                  )}

                  {editedFullContent && (
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {editedFullContent}
                    </div>
                  )}

                  {editedConclusion && (
                    <div className="text-gray-700 mt-8 whitespace-pre-wrap">
                      {editedConclusion}
                    </div>
                  )}
                </article>
              </div>
            )}

            {/* Onglet SEO */}
            {activeTab === "seo" && (
              <>
                {/* Mots-clés principaux */}
                {article.mainKeywords && article.mainKeywords.length > 0 && (
                  <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Mots-clés principaux
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            article.mainKeywords!.join(", "),
                            "Mots-clés"
                          )
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.mainKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-500/10 text-primary-300 text-sm px-4 py-2 rounded-lg border border-primary-500/20"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Tags
                  </h3>

                  {isEditing && (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Ajouter un tag"
                        className="flex-1 px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button onClick={handleAddTag} size="sm">
                        Ajouter
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {editedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-accent-500/10 text-accent-300 text-sm px-4 py-2 rounded-lg border border-accent-500/20"
                      >
                        {tag}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-accent-200"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                {article.sections && article.sections.length > 0 && (
                  <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Structure de l'article
                    </h3>
                    <div className="space-y-4">
                      {article.sections.map((section, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-primary-500 pl-4 py-2"
                        >
                          <h4 className="font-semibold text-white mb-2">
                            {section.heading}
                          </h4>
                          <p className="text-sm text-dark-300 line-clamp-2">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
