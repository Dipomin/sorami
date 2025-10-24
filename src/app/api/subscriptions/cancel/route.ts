import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import paystack from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { subscriptionId } = body;
    if (!subscriptionId) return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 });

    const sub = await prisma.paystackSubscription.findUnique({ where: { id: subscriptionId } });
    if (!sub || sub.userId !== user.id) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

    // Cancel on Paystack
    const paystackId = sub.paystackId;
    const res = await paystack.cancelSubscription(paystackId);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to cancel on provider', details: res.body }, { status: res.status });
    }

    await prisma.paystackSubscription.update({ where: { id: subscriptionId }, data: { status: 'CANCELLED', providerData: res.body } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error cancelling subscription', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
