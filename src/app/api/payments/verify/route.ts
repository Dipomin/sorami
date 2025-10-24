import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import paystack from '@/lib/paystack';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const reference = url.searchParams.get('reference');
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    const res = await paystack.verifyTransaction(reference);
    if (!res.ok) return NextResponse.json({ error: 'Paystack verify failed', details: res.body }, { status: res.status });

    const data = res.body.data || res.body;

    // Update transaction in DB
    await prisma.transaction.updateMany({
      where: { reference },
      data: {
        status: data.status === 'success' ? 'SUCCESS' : data.status === 'failed' ? 'FAILED' : 'PENDING',
        providerData: data,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error verify payment:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
