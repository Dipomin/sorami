/**
 * SEO Meta Tags Component
 * Composant pour gérer toutes les balises SEO (Open Graph, Twitter Cards, JSON-LD)
 */

import Head from "next/head";

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function SEOMeta({
  title,
  description,
  keywords,
  author,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags,
}: SEOMetaProps) {
  const fullTitle = `${title} | Sorami`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sorami.app";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/og-default.png`;
  const ogImage = image || defaultImage;

  // JSON-LD structured data pour les articles
  const articleSchema =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: ogImage,
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          author: author
            ? {
                "@type": "Person",
                name: author,
              }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "Sorami",
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/logo.png`,
            },
          },
          keywords: keywords || tags?.join(", "),
        }
      : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Sorami" />
      <meta property="og:locale" content="fr_FR" />

      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sorami_app" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {author && <meta name="twitter:creator" content={`@${author}`} />}

      {/* JSON-LD Structured Data */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
    </Head>
  );
}

/**
 * Génère les métadonnées pour Next.js App Router (export metadata)
 */
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
}: SEOMetaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sorami.app";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/og-default.png`;
  const ogImage = image || defaultImage;

  return {
    title: `${title} | Sorami`,
    description,
    keywords: keywords || tags?.join(", "),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type: "article",
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
      siteName: "Sorami",
      locale: "fr_FR",
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      section,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      site: "@sorami_app",
      title,
      description,
      images: [ogImage],
      creator: author ? `@${author}` : undefined,
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
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
