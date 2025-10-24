import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import paystack from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { amount, email, metadata } = body;

    if (!amount || !email) {
      return NextResponse.json({ error: 'Missing amount or email' }, { status: 400 });
    }

    // Initialize transaction on Paystack
    const res = await paystack.initializeTransaction({ amount, email, metadata });
    if (!res.ok) {
      return NextResponse.json({ error: 'Paystack initialization failed', details: res.body }, { status: res.status });
    }

    const data = res.body.data || res.body;

    // Persist a pending transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        reference: data.reference,
        amount: Math.round(amount * 100),
        currency: data.currency || 'XOF',
        status: 'PENDING',
        providerData: data,
      },
    });

    return NextResponse.json({ success: true, authorization_url: data.authorization_url, reference: data.reference });
  } catch (error) {
    console.error('Error initialize payment:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
