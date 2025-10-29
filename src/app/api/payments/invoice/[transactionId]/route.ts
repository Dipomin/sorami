import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payments/invoice/[transactionId]
 * Génère et télécharge une facture pour une transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { transactionId } = await params;

    // Récupérer la transaction
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        userId: user.id, // Sécurité : vérifier que la transaction appartient à l'utilisateur
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la transaction est réussie
    if (transaction.status !== "SUCCESS") {
      return NextResponse.json(
        { success: false, error: "La facture n'est disponible que pour les paiements confirmés" },
        { status: 400 }
      );
    }

    // Générer le HTML de la facture
    const invoiceHtml = generateInvoiceHTML(transaction, user);

    // Retourner le HTML avec les headers appropriés
    return new NextResponse(invoiceHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="facture-${transaction.reference}.html"`,
      },
    });
  } catch (error) {
    console.error("❌ Error generating invoice:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(transaction: any, user: any): string {
  const date = new Date(transaction.createdAt);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const amount = (transaction.amount / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${transaction.reference}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #6366f1;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
        }
        
        .company-details {
            font-size: 14px;
            color: #666;
            line-height: 1.8;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h1 {
            font-size: 36px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 14px;
            color: #666;
        }
        
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .info-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
        }
        
        .info-box h3 {
            font-size: 14px;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .info-box p {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .info-box strong {
            color: #333;
        }
        
        .invoice-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
        }
        
        .invoice-table thead {
            background: #6366f1;
            color: white;
        }
        
        .invoice-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .invoice-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .invoice-table tbody tr:hover {
            background: #f9fafb;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 20px;
            font-size: 14px;
        }
        
        .total-row.subtotal {
            background: #f9fafb;
        }
        
        .total-row.grand-total {
            background: #6366f1;
            color: white;
            font-size: 18px;
            font-weight: bold;
            margin-top: 2px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 13px;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
        .notes {
            margin-top: 30px;
            padding: 20px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }
        
        .notes h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .notes p {
            color: #78350f;
            font-size: 13px;
            line-height: 1.6;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
            
            .no-print {
                display: none;
            }
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
            transition: all 0.3s;
        }
        
        .print-button:hover {
            background: #4f46e5;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(99, 102, 241, 0.4);
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">
        🖨️ Imprimer / Télécharger PDF
    </button>
    
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <div class="company-name">SORAMI</div>
                <div class="company-details">
                    Plateforme de Génération de Contenu IA<br>
                    Email: contact@sorami.ai<br>
                    Web: www.sorami.ai
                </div>
            </div>
            <div class="invoice-title">
                <h1>FACTURE</h1>
                <div class="invoice-number">N° ${transaction.reference}</div>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-box">
                <h3>Facturé à</h3>
                <p><strong>${user.name || "Client"}</strong></p>
                <p>${user.email}</p>
                <p>ID Client: ${user.id.substring(0, 12)}...</p>
            </div>
            
            <div class="info-box">
                <h3>Détails de la facture</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Heure:</strong> ${formattedTime}</p>
                <p><strong>Statut:</strong> <span class="status-badge">Payé</span></p>
                <p><strong>Méthode:</strong> ${transaction.providerData?.channel || "Carte bancaire"}</p>
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantité</th>
                    <th style="text-align: right;">Prix unitaire</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Crédits Sorami</strong><br>
                        <small style="color: #666;">Paiement de crédits pour la génération de contenu IA</small>
                    </td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">${amount} ${transaction.currency}</td>
                    <td style="text-align: right;"><strong>${amount} ${transaction.currency}</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row subtotal">
                <span>Sous-total HT:</span>
                <span>${amount} ${transaction.currency}</span>
            </div>
            <div class="total-row subtotal">
                <span>TVA (0%):</span>
                <span>0.00 ${transaction.currency}</span>
            </div>
            <div class="total-row grand-total">
                <span>TOTAL TTC:</span>
                <span>${amount} ${transaction.currency}</span>
            </div>
        </div>
        
        <div class="notes">
            <h4>📝 Notes importantes</h4>
            <p>
                Cette facture concerne l'achat de crédits Sorami. Les crédits sont utilisables pour générer 
                du contenu IA (articles de blog, livres, images, vidéos) sur la plateforme Sorami.
                Aucun remboursement n'est possible après l'achat des crédits.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Merci pour votre confiance !</strong></p>
            <p>En cas de question, contactez-nous à support@sorami.ai</p>
            <p style="margin-top: 20px; font-size: 11px; color: #999;">
                Document généré automatiquement le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
            </p>
        </div>
    </div>
    
    <script>
        // Auto-focus pour l'impression
        window.onload = function() {
            // Optionnel: ouvrir automatiquement la boîte de dialogue d'impression
            // setTimeout(() => window.print(), 500);
        }
    </script>
</body>
</html>`;
}
