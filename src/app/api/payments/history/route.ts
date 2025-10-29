import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payments/history
 * Récupère l'historique des paiements de l'utilisateur
 */
export async function GET() {
  try {
    const user = await requireAuth();

    // Récupérer les transactions de l'utilisateur
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limiter à 50 dernières transactions
    });

    // Récupérer l'historique des crédits
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Récupérer les abonnements
    const subscriptions = await prisma.paystackSubscription.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          reference: t.reference,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          providerData: t.providerData,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        creditTransactions: creditTransactions.map((ct) => ({
          id: ct.id,
          amount: ct.amount,
          type: ct.type,
          description: ct.description,
          transactionRef: ct.transactionRef,
          createdAt: ct.createdAt,
        })),
        subscriptions: subscriptions.map((sub) => ({
          id: sub.id,
          paystackId: sub.paystackId,
          planName: sub.plan.name,
          planAmount: sub.plan.amount,
          planInterval: sub.plan.interval,
          planCredits: sub.plan.credits,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
