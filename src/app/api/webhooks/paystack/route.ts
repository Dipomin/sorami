// API Route pour les webhooks Paystack
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      )
    }
    
    // Vérifier la signature du webhook
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')
    
    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      )
    }
    
    const event = JSON.parse(body)
    
    // Traiter les différents types d'événements Paystack
    switch (event.event) {
      case 'subscription.create':
        await handleSubscriptionCreated(event.data)
        break
        
      case 'subscription.not_renew':
        await handleSubscriptionCanceled(event.data)
        break
        
      case 'invoice.create':
        await handleInvoiceCreated(event.data)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data)
        break
        
      case 'charge.success':
        await handleChargeSuccess(event.data)
        break
        
      default:
        console.log('Événement Paystack non géré:', event.event)
    }
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Erreur webhook Paystack:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Gestionnaires d'événements Paystack
async function handleSubscriptionCreated(data: any) {
  try {
    const subscription = await prisma.subscription.upsert({
      where: {
        paystackSubscriptionId: data.subscription_code
      },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end)
      },
      create: {
        organizationId: data.customer.metadata?.organizationId || '',
        plan: 'STARTER', // À déterminer selon le plan Paystack
        amount: parseFloat(data.amount) / 100,
        paystackCustomerId: data.customer.customer_code,
        paystackSubscriptionId: data.subscription_code,
        paystackPlanId: data.plan.plan_code,
        status: 'ACTIVE',
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end)
      }
    })
    
    console.log('Abonnement créé/mis à jour:', subscription.id)
  } catch (error) {
    console.error('Erreur création abonnement:', error)
  }
}

async function handleSubscriptionCanceled(data: any) {
  try {
    await prisma.subscription.update({
      where: {
        paystackSubscriptionId: data.subscription_code
      },
      data: {
        cancelAtPeriodEnd: true,
        status: 'CANCELED'
      }
    })
    
    console.log('Abonnement annulé:', data.subscription_code)
  } catch (error) {
    console.error('Erreur annulation abonnement:', error)
  }
}

async function handleInvoiceCreated(data: any) {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        organizationId: data.customer.metadata?.organizationId || '',
        paystackInvoiceId: data.invoice_code,
        status: 'OPEN',
        subtotal: parseFloat(data.amount) / 100,
        taxAmount: parseFloat(data.tax || 0) / 100,
        total: parseFloat(data.amount) / 100,
        currency: data.currency || 'NGN',
        dueDate: new Date(data.due_date)
      }
    })
    
    console.log('Facture créée:', invoice.id)
  } catch (error) {
    console.error('Erreur création facture:', error)
  }
}

async function handleInvoicePaymentFailed(data: any) {
  try {
    await prisma.invoice.update({
      where: {
        paystackInvoiceId: data.invoice_code
      },
      data: {
        status: 'VOID'
      }
    })
    
    console.log('Paiement facture échoué:', data.invoice_code)
  } catch (error) {
    console.error('Erreur échec paiement facture:', error)
  }
}

async function handleChargeSuccess(data: any) {
  try {
    // Mettre à jour la facture correspondante
    if (data.metadata?.invoice_code) {
      await prisma.invoice.update({
        where: {
          paystackInvoiceId: data.metadata.invoice_code
        },
        data: {
          status: 'PAID',
          paystackTransactionId: data.reference,
          paidAt: new Date(data.paid_at)
        }
      })
    }
    
    // Enregistrer une métrique d'usage pour le paiement
    const now = new Date(data.created_at)
    await prisma.usageMetric.create({
      data: {
        organizationId: data.customer?.metadata?.organizationId || '',
        metric: 'API_CALLS',
        value: parseFloat(data.amount) / 100,
        unit: 'NGN',
        periodStart: now,
        periodEnd: now,
        metadata: {
          transactionId: data.reference,
          channel: data.channel,
          currency: data.currency
        }
      }
    })
    
    console.log('Paiement réussi:', data.reference)
  } catch (error) {
    console.error('Erreur traitement paiement:', error)
  }
}