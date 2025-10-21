import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/create(.*)',
  '/books(.*)',
  '/blog(.*)',
  '/jobs(.*)',
  '/dashboard(.*)',
  '/generate-images(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/webhooks/book-completion', // Webhook pour la complétion des livres
  '/api/webhooks/blog-completion', // Webhook pour la complétion des articles de blog
  '/api/webhooks/image-completion', // Webhook pour la complétion des images
  '/api/books', // API publique pour la liste des livres
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
