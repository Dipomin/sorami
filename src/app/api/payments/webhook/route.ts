import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import paystack from '@/lib/paystack';
import notifications from '@/lib/notifications';

export async function POST(request: Request) {
  // Read raw body for signature verification
  const raw = await request.text();
  const signature = request.headers.get('x-paystack-signature') || undefined;

  if (!paystack.verifyWebhookSignature(raw, signature)) {
    console.warn('Invalid Paystack signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON webhook payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const event = payload.event;
  const data = payload.data;

  try {
    // Handle common events
    if (event === 'charge.success') {
      const reference = data.reference;
      // Update transaction status to SUCCESS and store provider data
      await prisma.transaction.updateMany({ where: { reference }, data: { status: 'SUCCESS', providerData: data } });

      // Create notification and send invoice email
      try {
        // Find transaction and user
        const tx = await prisma.transaction.findUnique({ where: { reference }, include: { user: true } });
        if (tx && tx.user) {
          await prisma.notification.create({ data: {
            userId: tx.user.id,
            type: 'SUCCESS',
            title: 'Paiement confirmé',
            message: `Votre paiement de ${(tx.amount/100).toLocaleString('fr-FR')} XOF a été confirmé avec succès.`,
            metadata: { reference, amount: tx.amount, currency: tx.currency },
          }});

          // Send invoice email
          await notifications.sendInvoiceEmail(tx.user.email, {
            reference,
            amount: tx.amount,
            currency: tx.currency,
            date: new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            userName: `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || tx.user.email,
          });
        }
      } catch (e) {
        console.error('Notification/email failed', e);
      }
    }

    if (event === 'subscription.create' || event === 'subscription.create.success') {
      // Create or update subscription record
      const paystackId = data.subscription_code || data.id || data.subscription;
      const customer = data.customer || (data.customer_code || null);
      const plan = data.plan || data.plan_code || null;

      // Find user by clerkId present in metadata or provider fields
      const clerkId = data.customer?.customer_code || data.customer?.email || data.customer_code || data.metadata?.clerkId || null;

      // Best-effort: try to find user by clerkId in users.clerkId
      let user: any = null;
      if (clerkId) {
        user = await prisma.user.findFirst({ where: { clerkId: clerkId } });
      }

      // find plan mapping
      const planRecord = await prisma.paystackPlan.findFirst({ where: { paystackId: plan } });

      if (user && paystackId) {
        await prisma.paystackSubscription.upsert({
          where: { paystackId },
          update: { status: 'ACTIVE', providerData: data },
          create: {
            userId: user.id,
            paystackId,
            planId: planRecord ? planRecord.id : '',
            status: 'ACTIVE',
            providerData: data,
          },
        });

        // Send subscription confirmation email
        try {
          await prisma.notification.create({ data: {
            userId: user.id,
            type: 'SUCCESS',
            title: 'Abonnement activé',
            message: `Votre abonnement ${planRecord?.name || 'Premium'} est maintenant actif !`,
            metadata: { paystackId, planId: planRecord?.id },
          }});

          if (planRecord) {
            await notifications.sendSubscriptionEmail(user.email, {
              planName: planRecord.name,
              amount: planRecord.amount,
              currency: planRecord.currency,
              interval: planRecord.interval,
              startDate: new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            });
          }
        } catch (e) {
          console.error('Subscription notification failed', e);
        }
      }
    }

    if (event === 'subscription.disable' || event === 'subscription.disable.success' || event === 'subscription.cancel') {
      const paystackId = data.subscription_code || data.id || data.subscription;
      if (paystackId) {
        await prisma.paystackSubscription.updateMany({ where: { paystackId }, data: { status: 'CANCELLED', providerData: data } });
      }
    }

    // Acknowledge webhook
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error', err);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}
