import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();
    const subs = await prisma.paystackSubscription.findMany({ where: { userId: user.id }, include: { plan: true } });
    return NextResponse.json({ success: true, subscriptions: subs });
  } catch (err) {
    console.error('Error fetching subscriptions', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
