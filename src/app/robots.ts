/**
 * Dynamic robots.txt
 * Configure les règles d'indexation pour les moteurs de recherche
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sorami.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/blog',
          '/blog/*',
          '/pricing',
          '/legal/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/dashboard',
          '/dashboard/*',
          '/books/*',
          '/generate-*',
          '/create/*',
          '/jobs/*',
          '/_next/*',
          '/static/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog',
          '/blog/*',
          '/pricing',
          '/legal/*',
        ],
        disallow: [
          '/admin',
          '/api/*',
          '/dashboard',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/blog',
          '/blog/*',
          '/pricing',
        ],
        disallow: [
          '/admin',
          '/api/*',
          '/dashboard',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
