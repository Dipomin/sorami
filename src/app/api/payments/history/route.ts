import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();
    const tx = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, transactions: tx });
  } catch (err) {
    console.error('Error fetching payments history', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
