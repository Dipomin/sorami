import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Calculer les timestamps pour différentes périodes
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche de cette semaine
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Calculer le nombre de jours depuis le premier contenu
    const firstContent = await prisma.$transaction([
      prisma.imageGeneration.findFirst({
        where: { authorId: user.id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.videoGeneration.findFirst({
        where: { authorId: user.id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.blogArticle.findFirst({
        where: { authorId: user.id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.book.findFirst({
        where: { authorId: user.id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const firstDate = firstContent
      .filter((c) => c !== null)
      .map((c) => c!.createdAt)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    const daysSinceFirst = firstDate
      ? Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    // Fonction helper pour calculer les stats d'un type de contenu
    const getContentStats = async (
      model: any,
      userIdField: string
    ): Promise<{
      total: number;
      thisMonth: number;
      lastMonth: number;
      thisWeek: number;
      today: number;
      avgPerDay: number;
    }> => {
      const whereClause = { [userIdField]: user.id };
      
      const [total, thisMonth, lastMonth, thisWeek, today] = await Promise.all([
        model.count({ where: whereClause }),
        model.count({
          where: {
            ...whereClause,
            createdAt: { gte: startOfMonth },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            createdAt: { gte: startOfWeek },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            createdAt: { gte: startOfToday },
          },
        }),
      ]);

      return {
        total,
        thisMonth,
        lastMonth,
        thisWeek,
        today,
        avgPerDay: total / daysSinceFirst,
      };
    };

    // Récupérer les stats pour chaque type de contenu en parallèle
    const [images, videos, articles, books] = await Promise.all([
      getContentStats(prisma.imageGeneration, "authorId"),
      getContentStats(prisma.videoGeneration, "authorId"),
      getContentStats(prisma.blogArticle, "authorId"),
      getContentStats(prisma.book, "userId"),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        images,
        videos,
        articles,
        books,
      },
    });
  } catch (error) {
    console.error("Error fetching detailed stats:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch detailed stats" },
      { status: 500 }
    );
  }
}
