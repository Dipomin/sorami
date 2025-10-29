/**
 * Utilitaire pour générer des factures PDF côté client
 * Utilise html2pdf.js pour convertir le HTML en PDF
 */

export async function downloadInvoiceAsPDF(transactionId: string, reference: string) {
  try {
    // Ouvrir la facture HTML dans un nouvel onglet
    // L'utilisateur pourra utiliser Ctrl+P pour imprimer en PDF
    const invoiceWindow = window.open(
      `/api/payments/invoice/${transactionId}`,
      "_blank"
    );

    if (!invoiceWindow) {
      throw new Error("Le popup a été bloqué. Veuillez autoriser les popups pour ce site.");
    }

    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'ouverture de la facture:", error);
    throw error;
  }
}

/**
 * Alternative: Télécharger la facture HTML directement
 */
export async function downloadInvoiceAsHTML(transactionId: string, reference: string) {
  try {
    const response = await fetch(`/api/payments/invoice/${transactionId}`);
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la facture");
    }
    
    const html = await response.text();
    
    // Créer un blob et télécharger
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-${reference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du téléchargement de la facture:", error);
    throw error;
  }
}
