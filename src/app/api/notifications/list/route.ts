import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();
    const notes = await (prisma as any).notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    return NextResponse.json({ success: true, notifications: notes });
  } catch (err) {
    console.error('Error fetching notifications', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
