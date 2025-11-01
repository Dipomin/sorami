/**
 * Page: Blog Editor
 * Éditeur Markdown pour créer/modifier des articles
 * Route dynamique: /admin/blog/editor (nouveau) ou /admin/blog/editor/[id] (édition)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { motion } from "framer-motion";

// Import dynamique de l'éditeur Markdown (CSR only)
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface BlogPostData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
  published: boolean;
  publishedAt?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id?.[0]; // [[...id]] pattern

  const { categories, isLoading: loadingCategories } = useBlogCategories();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"content" | "settings" | "seo">(
    "content"
  );

  const [formData, setFormData] = useState<BlogPostData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: [],
    status: "DRAFT",
    published: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const [tagInput, setTagInput] = useState("");

  // Charger l'article existant si on édite
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/blog/posts/${postId}`);
        if (!response.ok) throw new Error("Article non trouvé");

        const post = await response.json();

        // Parser les tags (JSON string vers array)
        let parsedTags: string[] = [];
        if (post.tags) {
          try {
            parsedTags = JSON.parse(post.tags);
          } catch {
            parsedTags = [];
          }
        }

        setFormData({
          title: post.title || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          coverImage: post.coverImage || "",
          category: post.category || "",
          tags: parsedTags,
          status: post.status || "DRAFT",
          published: post.published || false,
          publishedAt: post.publishedAt
            ? new Date(post.publishedAt).toISOString().slice(0, 16)
            : undefined,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          metaKeywords: post.metaKeywords || "",
        });
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
        router.push("/admin/blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  // Upload d'image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload échoué");
      }

      const result = await response.json();
      setFormData((prev) => ({ ...prev, coverImage: result.url }));
      alert("Image uploadée avec succès !");
    } catch (error: any) {
      alert(`Erreur d'upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Ajouter un tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Retirer un tag
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Sauvegarde
  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.content) {
      alert("Le titre et le contenu sont requis");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        ...formData,
        published: publish,
        status: publish ? "PUBLISHED" : formData.status,
      };

      const url = postId ? `/api/blog/posts/${postId}` : "/api/blog/posts";
      const method = postId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Sauvegarde échouée");
      }

      const result = await response.json();
      alert(publish ? "Article publié avec succès !" : "Article sauvegardé !");

      if (!postId) {
        // Nouveau post, rediriger vers l'éditeur avec l'ID
        router.push(`/admin/blog/editor/${result.id}`);
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {postId ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <p className="text-slate-400">
            {postId
              ? "Mettez à jour votre article"
              : "Créez un nouvel article de blog"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/admin/blog")}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Sauvegarde..." : "Enregistrer"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isSaving ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: "content", label: "Contenu", icon: "📝" },
          { id: "settings", label: "Paramètres", icon: "⚙️" },
          { id: "seo", label: "SEO", icon: "🔍" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              currentTab === tab.id
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-slate-900/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {currentTab === "content" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre de l'article *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Mon super article..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-xl font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Cover Image */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image de couverture
            </label>
            <div className="flex items-center space-x-4">
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className={`inline-block px-6 py-3 bg-slate-700 text-white rounded-lg cursor-pointer hover:bg-slate-600 transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? "Upload..." : "Choisir une image"}
                </label>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Extrait (résumé court)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Un court résumé de votre article..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Markdown Editor */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Contenu (Markdown) *
            </label>
            <div data-color-mode="dark">
              <MDEditor
                value={formData.content}
                onChange={(val) =>
                  setFormData({ ...formData, content: val || "" })
                }
                height={600}
                preview="live"
                hideToolbar={false}
                enableScroll={true}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Utilisez Markdown pour formater votre contenu. Prévisualisation en
              temps réel.
            </p>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {currentTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Category */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Aucune catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                placeholder="Ajouter un tag..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
              <option value="SCHEDULED">Programmé</option>
            </select>
          </div>

          {/* Publish Date */}
          {formData.status === "SCHEDULED" && (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date de publication
              </label>
              <input
                type="datetime-local"
                value={formData.publishedAt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, publishedAt: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* SEO Tab */}
      {currentTab === "seo" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Meta Title */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) =>
                setFormData({ ...formData, metaTitle: e.target.value })
              }
              placeholder={
                formData.title || "Titre pour les moteurs de recherche"
              }
              maxLength={60}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-sm text-slate-500 mt-2">
              {formData.metaTitle.length}/60 caractères
            </p>
          </div>

          {/* Meta Description */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              placeholder={
                formData.excerpt || "Description pour les moteurs de recherche"
              }
              maxLength={160}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-sm text-slate-500 mt-2">
              {formData.metaDescription.length}/160 caractères
            </p>
          </div>

          {/* Meta Keywords */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) =>
                setFormData({ ...formData, metaKeywords: e.target.value })
              }
              placeholder="mot-clé1, mot-clé2, mot-clé3"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-sm text-slate-500 mt-2">
              Séparez les mots-clés par des virgules
            </p>
          </div>

          {/* Preview */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Aperçu Google
            </h3>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-blue-600 text-xl hover:underline cursor-pointer mb-1">
                {formData.metaTitle || formData.title || "Titre de l'article"}
              </div>
              <div className="text-green-700 text-sm mb-2">
                https://sorami.app/blog/
                {formData.title
                  ? formData.title.toLowerCase().replace(/\s+/g, "-")
                  : "article"}
              </div>
              <div className="text-gray-600 text-sm">
                {formData.metaDescription ||
                  formData.excerpt ||
                  "Description de votre article..."}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
