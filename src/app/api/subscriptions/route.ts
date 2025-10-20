// API Route pour la gestion des abonnements Paystack
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Initialiser un abonnement Paystack
export async function POST(request: NextRequest) {
  try {
    const { organizationId, planId, customerEmail } = await request.json()
    
    if (!organizationId || !planId || !customerEmail) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }
    
    // 1. Créer un customer Paystack
    const customerResponse = await fetch('https://api.paystack.co/customer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customerEmail,
        metadata: { organizationId }
      })
    })
    
    if (!customerResponse.ok) {
      throw new Error('Erreur création customer Paystack')
    }
    
    const customerData = await customerResponse.json()
    
    // 2. Créer l'abonnement Paystack
    const subscriptionResponse = await fetch('https://api.paystack.co/subscription', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: customerData.data.customer_code,
        plan: planId
      })
    })
    
    if (!subscriptionResponse.ok) {
      throw new Error('Erreur création abonnement Paystack')
    }
    
    const subscriptionData = await subscriptionResponse.json()
    
    // 3. Créer l'abonnement en base de données
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        plan: mapPaystackPlanToLocal(planId),
        amount: subscriptionData.data.amount / 100,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        paystackCustomerId: customerData.data.customer_code,
        paystackSubscriptionId: subscriptionData.data.subscription_code,
        paystackPlanId: planId
      }
    })
    
    return NextResponse.json({
      subscription,
      paystack: {
        customerCode: customerData.data.customer_code,
        subscriptionCode: subscriptionData.data.subscription_code,
        authorizationUrl: subscriptionData.data.email_token
      }
    })
  } catch (error) {
    console.error('Erreur création abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Récupérer les abonnements d'une organisation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId requis' },
        { status: 400 }
      )
    }
    
    const subscriptions = await prisma.subscription.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Erreur récupération abonnements:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Annuler un abonnement
export async function DELETE(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId requis' },
        { status: 400 }
      )
    }
    
    // 1. Récupérer l'abonnement
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })
    
    if (!subscription || !subscription.paystackSubscriptionId) {
      return NextResponse.json(
        { error: 'Abonnement non trouvé' },
        { status: 404 }
      )
    }
    
    // 2. Annuler l'abonnement chez Paystack
    const cancelResponse = await fetch(
      `https://api.paystack.co/subscription/disable`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: subscription.paystackSubscriptionId,
          token: subscription.paystackSubscriptionId
        })
      }
    )
    
    if (!cancelResponse.ok) {
      throw new Error('Erreur annulation abonnement Paystack')
    }
    
    // 3. Mettre à jour l'abonnement en base
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    })
    
    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Erreur annulation abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Utilitaire pour mapper les plans Paystack vers nos plans locaux
function mapPaystackPlanToLocal(paystackPlanId: string): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' {
  switch (paystackPlanId) {
    case 'PLN_starter': return 'STARTER'
    case 'PLN_pro': return 'PRO'
    case 'PLN_enterprise': return 'ENTERPRISE'
    default: return 'FREE'
  }
}