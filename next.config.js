/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration des images
  images: {
    domains: ['clerk.com', 'images.clerk.dev'], // Ajout des domaines Clerk pour les avatars
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
    ],
  },
  
  // Variables d'environnement exposées au client
  env: {
    API_URL: process.env.API_URL,
  },
  
  // Configuration pour le déploiement standalone (Docker/VPS)
  output: 'standalone',
  
  // Optimisations de production
  swcMinify: true,
  
  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;