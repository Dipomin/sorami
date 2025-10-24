import nodemailer from 'nodemailer';

// Configuration SMTP via variables d'environnement
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour port 465, false pour autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendNotification(email: string, subject: string, body: string) {
  try {
    console.log(`📧 Envoi email à ${email}: ${subject}`);
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ SMTP non configuré - email non envoyé');
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Sorami" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: body,
    });

    console.log('✅ Email envoyé:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

export async function sendInvoiceEmail(email: string, invoice: {
  reference: string;
  amount: number;
  currency: string;
  date: string;
  userName: string;
}) {
  const subject = `Facture Sorami - ${invoice.reference}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 24px; font-weight: bold; color: #8b5cf6; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Paiement Confirmé</h1>
          <p>Merci pour votre confiance !</p>
        </div>
        <div class="content">
          <p>Bonjour ${invoice.userName},</p>
          <p>Nous avons bien reçu votre paiement. Voici les détails de votre transaction :</p>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span>Référence :</span>
              <strong>${invoice.reference}</strong>
            </div>
            <div class="detail-row">
              <span>Date :</span>
              <strong>${invoice.date}</strong>
            </div>
            <div class="detail-row">
              <span>Montant :</span>
              <span class="total">${(invoice.amount / 100).toLocaleString('fr-FR')} ${invoice.currency}</span>
            </div>
          </div>

          <p>Cette facture confirme votre paiement et vous donne accès aux services Sorami.</p>
          <p>Vous pouvez consulter l'historique de vos paiements dans votre <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sorami.app'}/dashboard/payments">tableau de bord</a>.</p>
          
          <p>Cordialement,<br><strong>L'équipe Sorami</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement. Pour toute question, contactez-nous à support@sorami.app</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendNotification(email, subject, html);
}

export async function sendSubscriptionEmail(email: string, subscription: {
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  startDate: string;
  userName: string;
}) {
  const subject = `Abonnement Sorami activé - ${subscription.planName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .feature { padding: 8px 0; }
        .feature:before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Abonnement Activé</h1>
          <p>Bienvenue parmi nos membres !</p>
        </div>
        <div class="content">
          <p>Bonjour ${subscription.userName},</p>
          <p>Votre abonnement <strong>${subscription.planName}</strong> est maintenant actif !</p>
          
          <div class="plan-details">
            <h3>Détails de votre abonnement</h3>
            <div class="feature">Plan : ${subscription.planName}</div>
            <div class="feature">Montant : ${(subscription.amount / 100).toLocaleString('fr-FR')} ${subscription.currency} / ${subscription.interval}</div>
            <div class="feature">Date de début : ${subscription.startDate}</div>
            <div class="feature">Renouvellement automatique</div>
          </div>

          <p>Vous avez maintenant accès à toutes les fonctionnalités de votre plan. Profitez de la génération illimitée de contenu IA !</p>
          <p>Gérez votre abonnement dans votre <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sorami.app'}/dashboard/subscription">tableau de bord</a>.</p>
          
          <p>Bonne création,<br><strong>L'équipe Sorami</strong></p>
        </div>
        <div class="footer">
          <p>Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendNotification(email, subject, html);
}

export default { sendNotification, sendInvoiceEmail, sendSubscriptionEmail };
