"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Receipt,
  Download,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  providerData?: any;
}

export default function PaymentsHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/payments/history");

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();

      console.log("📊 [Payments] Réponse API:", data);

      if (data.success) {
        // L'API retourne { success: true, data: { transactions: [...] } }
        const txList = data.data?.transactions || [];
        console.log("✅ [Payments] Transactions chargées:", txList.length);
        setTransactions(txList);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("❌ [Payments] Erreur:", error);
      setError(error instanceof Error ? error.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SUCCESS: {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/30",
        icon: CheckCircle,
      },
      PENDING: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
        icon: Clock,
      },
      FAILED: {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        icon: XCircle,
      },
      REFUNDED: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30",
        icon: FileText,
      },
    };

    const labels = {
      SUCCESS: "Confirmé",
      PENDING: "En attente",
      FAILED: "Échoué",
      REFUNDED: "Remboursé",
    };

    const style = styles[status as keyof typeof styles] || styles.PENDING;
    const Icon = style.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${style.bg} ${style.text} border ${style.border}`}
      >
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const downloadInvoice = (transactionId: string, reference: string) => {
    // Ouvrir la facture dans un nouvel onglet
    window.open(`/api/payments/invoice/${transactionId}`, "_blank");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                <Receipt className="w-10 h-10 text-primary-400" />
                Historique des Paiements
              </h1>
              <p className="text-dark-300">
                Consultez toutes vos transactions et téléchargez vos factures
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Erreur de chargement</p>
                <p className="text-sm text-red-300/70">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchTransactions}
            >
              Réessayer
            </Button>
          </motion.div>
        )}

        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-dark-900/40 rounded-2xl border border-dark-800"
          >
            <Receipt className="w-16 h-16 mx-auto mb-4 text-dark-500" />
            <h3 className="text-xl font-bold text-white mb-2">
              Aucune transaction
            </h3>
            <p className="text-dark-400 mb-6">Vos paiements apparaîtront ici</p>
            <Button onClick={() => router.push("/pricing")}>
              Voir les offres
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-900/40 backdrop-blur-xl border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-primary-400" />
                      <span className="text-lg font-semibold text-white">
                        {(tx.amount / 100).toLocaleString("fr-FR")}{" "}
                        {tx.currency}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-dark-400">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Réf: {tx.reference}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(tx.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {tx.status === "SUCCESS" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(tx.id, tx.reference)}
                      title="Télécharger ou imprimer la facture"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Facture
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
