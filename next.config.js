/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['clerk.com', 'images.clerk.dev'], // Ajout des domaines Clerk pour les avatars
  },
  env: {
    API_URL: process.env.API_URL,
  },
};

module.exports = nextConfig;