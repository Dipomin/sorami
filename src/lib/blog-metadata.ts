/**
 * Metadata Generator for Next.js 15 App Router
 * Génère les métadonnées SEO pour les pages blog
 */

import type { Metadata } from 'next';

interface BlogMetadataParams {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sorami.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

export function generateBlogMetadata({
  title,
  description,
  keywords,
  author,
  image,
  url,
  publishedTime,
  modifiedTime,
  section,
  tags,
}: BlogMetadataParams): Metadata {
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const ogImage = image || DEFAULT_IMAGE;
  const fullTitle = `${title} | Sorami`;
  const metaKeywords = keywords || tags?.join(', ');

  return {
    title: fullTitle,
    description,
    keywords: metaKeywords,
    authors: author ? [{ name: author }] : undefined,
    
    openGraph: {
      type: 'article',
      title,
      description,
      url: fullUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Sorami',
      locale: 'fr_FR',
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      ...(section && { section }),
      ...(tags && { tags }),
    },
    
    twitter: {
      card: 'summary_large_image',
      site: '@sorami_app',
      title,
      description,
      images: [ogImage],
      ...(author && { creator: `@${author}` }),
    },
    
    alternates: {
      canonical: fullUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Génère le JSON-LD pour les articles de blog
 */
export function generateArticleJsonLd({
  title,
  description,
  image,
  url,
  publishedTime,
  modifiedTime,
  author,
  keywords,
  tags,
}: BlogMetadataParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || DEFAULT_IMAGE,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: author
      ? {
          '@type': 'Person',
          name: author,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Sorami',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url ? `${SITE_URL}${url}` : SITE_URL,
    },
    keywords: keywords || tags?.join(', '),
  };
}

/**
 * Génère les métadonnées pour la page liste du blog
 */
export function generateBlogListMetadata(): Metadata {
  return {
    title: 'Blog | Sorami - Création de contenu IA',
    description:
      'Découvrez nos articles sur l\'intelligence artificielle, la génération de contenu, l\'écriture créative et les dernières innovations en matière de création assistée par IA.',
    keywords: 'blog, IA, intelligence artificielle, génération contenu, écriture, livres, articles',
    openGraph: {
      type: 'website',
      title: 'Blog Sorami - Création de contenu IA',
      description:
        'Articles et guides sur la création de contenu assistée par intelligence artificielle',
      url: `${SITE_URL}/blog`,
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Blog Sorami',
        },
      ],
      siteName: 'Sorami',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@sorami_app',
      title: 'Blog Sorami',
      description: 'Articles sur la création de contenu IA',
      images: [DEFAULT_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

/**
 * Génère les métadonnées pour une page catégorie
 */
export function generateCategoryMetadata(
  categoryName: string,
  description: string,
  slug: string
): Metadata {
  return {
    title: `${categoryName} | Blog Sorami`,
    description: description || `Tous les articles de la catégorie ${categoryName}`,
    openGraph: {
      type: 'website',
      title: `${categoryName} - Blog Sorami`,
      description: description || `Articles de la catégorie ${categoryName}`,
      url: `${SITE_URL}/blog/category/${slug}`,
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
      siteName: 'Sorami',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@sorami_app',
      title: categoryName,
      description: description || `Articles de la catégorie ${categoryName}`,
      images: [DEFAULT_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/category/${slug}`,
    },
  };
}
