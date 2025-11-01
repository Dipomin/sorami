import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/create(.*)',
  '/books(.*)',
  '/jobs(.*)',
  '/dashboard(.*)',
  '/generate-images(.*)',
  '/generate-videos(.*)',
  '/admin(.*)', // Routes admin (blog, etc.)
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/blog(.*)', // Pages publiques du blog
  '/legal(.*)', // Pages légales
  '/api/webhooks/clerk',
  '/api/webhooks/book-completion', // Webhook pour la complétion des livres
  '/api/webhooks/blog-completion', // Webhook pour la complétion des articles de blog
  '/api/webhooks/image-completion', // Webhook pour la complétion des images
  '/api/webhooks/image-ecommerce-completion', // Webhook pour la complétion des images e-commerce
  '/api/webhooks/video-completion', // Webhook pour la complétion des vidéos
  '/api/webhooks/video-personnalisee-completion', // Webhook pour la complétion des vidéos personnalisées
  '/api/books', // API publique pour la liste des livres
  '/api/blog/posts', // API publique pour les articles (GET seulement)
  '/api/blog/categories', // API publique pour les catégories (GET seulement)
  '/api/legal(.*)', // API publique pour les pages légales
]);

export default clerkMiddleware(async (auth, req) => {
  // Si c'est une route publique, laisser passer
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  const { userId } = await auth();
  
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
