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
        await handlePaystackSubscriptionCreated(event.data)
        break
        
      case 'subscription.not_renew':
      case 'subscription.disable':
        await handleSubscriptionCanceled(event.data)
        await handlePaystackSubscriptionDisabled(event.data)
        break
        
      case 'invoice.create':
        await handleInvoiceCreated(event.data)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data)
        break
        
      case 'charge.success':
        await handleChargeSuccess(event.data)
        await handlePaystackChargeSuccess(event.data)
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

// Nouveaux gestionnaires pour PaystackSubscription
async function handlePaystackSubscriptionCreated(data: any) {
  try {
    const subscriptionCode = data.subscription_code;
    const customerEmail = data.customer?.email;

    console.log(`✅ PaystackSubscription créé: ${subscriptionCode} pour ${customerEmail}`);

    // Mettre à jour le statut dans la DB
    await prisma.paystackSubscription.updateMany({
      where: { paystackId: subscriptionCode },
      data: {
        status: 'ACTIVE',
        currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : null,
        providerData: data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erreur handlePaystackSubscriptionCreated:', error)
  }
}

async function handlePaystackSubscriptionDisabled(data: any) {
  try {
    const subscriptionCode = data.subscription_code;

    console.log(`❌ PaystackSubscription désactivé: ${subscriptionCode}`);

    // Mettre à jour le statut dans la DB
    await prisma.paystackSubscription.updateMany({
      where: { paystackId: subscriptionCode },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erreur handlePaystackSubscriptionDisabled:', error)
  }
}

async function handlePaystackChargeSuccess(data: any) {
  try {
    const reference = data.reference;
    const amount = data.amount / 100; // Convertir de kobo/centimes en XOF
    const customerEmail = data.customer?.email;

    console.log(`💰 Paiement PaystackSubscription réussi: ${reference} - ${amount} ${data.currency} pour ${customerEmail}`);

    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
      select: { id: true, credits: true },
    });

    if (!user) {
      console.warn(`⚠️ Utilisateur non trouvé pour l'email: ${customerEmail}`);
      return;
    }

    // Créer ou mettre à jour la transaction
    await prisma.transaction.upsert({
      where: { reference },
      update: {
        status: 'SUCCESS',
        providerData: data,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        reference,
        amount,
        currency: data.currency || 'XOF',
        status: 'SUCCESS',
        providerData: data,
      },
    });

    // Si c'est un paiement avec un plan (premier paiement d'abonnement)
    if (data.plan && data.plan.plan_code) {
      console.log(`📝 Création d'abonnement pour le plan: ${data.plan.plan_code}`);

      // Récupérer le plan depuis la DB
      const plan = await prisma.paystackPlan.findFirst({
        where: { paystackId: data.plan.plan_code },
      });

      if (!plan) {
        console.error(`❌ Plan non trouvé: ${data.plan.plan_code}`);
        return;
      }

      // Vérifier s'il n'existe pas déjà un abonnement actif
      const existingSubscription = await prisma.paystackSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      let subscription;
      if (!existingSubscription) {
        // Créer l'abonnement
        subscription = await prisma.paystackSubscription.create({
          data: {
            userId: user.id,
            paystackId: data.metadata?.subscription_code || `sub_${reference}`,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodEnd: data.paid_at 
              ? new Date(new Date(data.paid_at).getTime() + 30 * 24 * 60 * 60 * 1000) 
              : null,
            providerData: {
              customer_code: data.customer?.customer_code,
              plan_code: data.plan.plan_code,
              authorization: data.authorization,
              first_payment_reference: reference,
            },
          },
        });

        console.log(`✅ Abonnement créé avec succès pour ${customerEmail}`);
      } else {
        subscription = existingSubscription;
        console.log(`ℹ️ Abonnement déjà actif pour ${customerEmail}`);
      }

      // 🎯 POINT CRITIQUE : ATTRIBUTION DES CRÉDITS
      if (plan.credits > 0) {
        await prisma.$transaction(async (tx) => {
          // Ajouter les crédits à l'utilisateur
          await tx.user.update({
            where: { id: user.id },
            data: {
              credits: { increment: plan.credits },
              creditsUpdatedAt: new Date(),
            },
          });

          // Créer une transaction de crédits pour l'historique
          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              amount: plan.credits,
              type: 'SUBSCRIPTION',
              description: `Crédits d'abonnement ${plan.name} - ${plan.interval}`,
              planId: plan.id,
              transactionRef: reference,
              metadata: {
                planName: plan.name,
                planAmount: plan.amount,
                planCurrency: plan.currency,
                paystackReference: reference,
              },
            },
          });

          console.log(`💳 ${plan.credits} crédits ajoutés à ${customerEmail} (Plan: ${plan.name})`);
        });

        // Créer une notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SUCCESS',
            title: 'Crédits ajoutés !',
            message: `${plan.credits} crédits ont été ajoutés à votre compte suite à votre abonnement ${plan.name}.`,
            metadata: {
              credits: plan.credits,
              planName: plan.name,
              reference,
            },
          },
        });
      }
    }

    // Si c'est un renouvellement d'abonnement existant
    if (data.metadata?.subscription_code) {
      const subscription = await prisma.paystackSubscription.findUnique({
        where: { paystackId: data.metadata.subscription_code },
        include: { plan: true },
      });

      if (subscription) {
        // Mettre à jour l'abonnement
        await prisma.paystackSubscription.update({
          where: { paystackId: data.metadata.subscription_code },
          data: {
            status: 'ACTIVE',
            currentPeriodEnd: data.paid_at 
              ? new Date(new Date(data.paid_at).getTime() + 30 * 24 * 60 * 60 * 1000) 
              : null,
            updatedAt: new Date(),
          },
        });

        // 🎯 RENOUVELLEMENT : ATTRIBUTION DES CRÉDITS
        if (subscription.plan.credits > 0) {
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: user.id },
              data: {
                credits: { increment: subscription.plan.credits },
                creditsUpdatedAt: new Date(),
              },
            });

            await tx.creditTransaction.create({
              data: {
                userId: user.id,
                amount: subscription.plan.credits,
                type: 'SUBSCRIPTION',
                description: `Renouvellement abonnement ${subscription.plan.name}`,
                planId: subscription.plan.id,
                transactionRef: reference,
                metadata: {
                  planName: subscription.plan.name,
                  renewal: true,
                  paystackReference: reference,
                },
              },
            });

            console.log(`🔄 Renouvellement: ${subscription.plan.credits} crédits ajoutés à ${customerEmail}`);
          });

          // Notification de renouvellement
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SUCCESS',
              title: 'Abonnement renouvelé',
              message: `Votre abonnement ${subscription.plan.name} a été renouvelé. ${subscription.plan.credits} crédits ajoutés !`,
              metadata: {
                credits: subscription.plan.credits,
                planName: subscription.plan.name,
                reference,
              },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur handlePaystackChargeSuccess:', error)
    throw error; // Re-throw pour que le webhook puisse être rejoué
  }
}
