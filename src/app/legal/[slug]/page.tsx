"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  publishedAt: string;
  updatedAt: string;
}

export default function LegalPageView() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        const response = await fetch(`/api/legal?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error('Page non trouvée');
        }
        
        const data = await response.json();
        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Page non trouvée</h1>
          <p className="text-dark-400 mb-6">{error || 'Cette page légale n\'existe pas'}</p>
          <a
            href="/"
            className="text-primary-500 hover:text-primary-400 underline"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{page.title}</h1>
          <div className="flex items-center gap-4 text-dark-400 text-sm">
            <span>Version {page.version}</span>
            <span>•</span>
            <span>
              Mis à jour le {new Date(page.updatedAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-800">
            <ReactMarkdown
              className="markdown-content"
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-semibold text-white mt-4 mb-2" {...props} />,
                p: ({ ...props }) => <p className="text-dark-200 mb-4 leading-relaxed" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-inside text-dark-200 mb-4 space-y-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-inside text-dark-200 mb-4 space-y-2" {...props} />,
                li: ({ ...props }) => <li className="text-dark-200" {...props} />,
                a: ({ ...props }) => <a className="text-primary-400 hover:text-primary-300 underline" {...props} />,
                strong: ({ ...props }) => <strong className="text-white font-semibold" {...props} />,
                em: ({ ...props }) => <em className="text-dark-300 italic" {...props} />,
                code: ({ ...props }) => <code className="bg-dark-800 text-primary-400 px-2 py-1 rounded text-sm" {...props} />,
                table: ({ ...props }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-dark-700" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => <thead className="bg-dark-800" {...props} />,
                th: ({ ...props }) => <th className="border border-dark-700 px-4 py-2 text-left text-white" {...props} />,
                td: ({ ...props }) => <td className="border border-dark-700 px-4 py-2 text-dark-200" {...props} />,
                hr: ({ ...props }) => <hr className="border-dark-700 my-8" {...props} />,
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-primary-500 hover:text-primary-400 underline"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
