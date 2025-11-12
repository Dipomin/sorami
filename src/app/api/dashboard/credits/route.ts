import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/credits
 * Récupère les informations de crédits basées sur le système Paystack
 */
export async function GET() {
  try {
    const user = await requireAuth();

    // Récupérer l'utilisateur avec ses crédits
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        credits: true,
        totalCreditsUsed: true,
        creditsUpdatedAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Récupérer l'abonnement Paystack actif
    const paystackSubscription = await prisma.paystackSubscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Déterminer les crédits max selon l'abonnement
    const maxCredits = paystackSubscription?.plan.credits || userData.credits;
    const usedCredits = userData.totalCreditsUsed;
    const remainingCredits = Math.max(0, userData.credits);

    // Calculer le pourcentage (basé sur les crédits disponibles vs utilisés total)
    const totalCredits = remainingCredits + usedCredits;
    const percentage = totalCredits > 0 
      ? Math.round((remainingCredits / totalCredits) * 100) 
      : 0;

    // Récupérer les détails d'utilisation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [imagesCount, videosCount, articlesCount, booksCount] = await Promise.all([
      prisma.imageGeneration.count({
        where: {
          authorId: user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.videoGeneration.count({
        where: {
          authorId: user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.blogArticle.count({
        where: {
          authorId: user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.book.count({
        where: {
          authorId: user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      credits: {
        used: usedCredits,
        remaining: remainingCredits,
        max: maxCredits,
        totalCredits: totalCredits,
        percentage,
        plan: paystackSubscription?.plan.name || "AUCUN",
      },
      breakdown: {
        images: { count: imagesCount },
        videos: { count: videosCount },
        articles: { count: articlesCount },
        books: { count: booksCount },
      },
    });
  } catch (error) {
    console.error("Error fetching credits:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
