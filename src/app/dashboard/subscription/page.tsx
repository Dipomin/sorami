"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Subscription {
  id: string;
  paystackId: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  providerData: any;
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscriptions/status");
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setCancelling(subscriptionId);
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchSubscriptions();
        setCancelDialogOpen(false);
        setSelectedSub(null);
      } else {
        alert(
          "Erreur lors de l'annulation: " + (data.error || "Erreur inconnue")
        );
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Erreur lors de l'annulation");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: {
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/30",
        icon: CheckCircle,
        label: "Actif",
      },
      CANCELLED: {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        icon: XCircle,
        label: "Annulé",
      },
      EXPIRED: {
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        border: "border-gray-500/30",
        icon: AlertCircle,
        label: "Expiré",
      },
      PAST_DUE: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
        icon: AlertCircle,
        label: "Impayé",
      },
    };

    const style = styles[status as keyof typeof styles] || styles.ACTIVE;
    const Icon = style.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${style.bg} ${style.text} border ${style.border}`}
      >
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const activeSubscription = subscriptions.find((s) => s.status === "ACTIVE");

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
                <Crown className="w-10 h-10 text-primary-400" />
                Mon Abonnement
              </h1>
              <p className="text-dark-300">
                Gérez votre abonnement et vos avantages
              </p>
            </div>
            {!activeSubscription && (
              <Button
                onClick={() => router.push("/pricing")}
                className="bg-gradient-violet"
              >
                <Zap className="w-4 h-4 mr-2" />
                S'abonner
              </Button>
            )}
          </div>
        </motion.div>

        {activeSubscription ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 backdrop-blur-xl border border-primary-500/30 rounded-2xl p-8 mb-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-primary-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Plan Premium
                  </h2>
                  {getStatusBadge(activeSubscription.status)}
                </div>
                <p className="text-dark-300">
                  Accès illimité à toutes les fonctionnalités IA
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-dark-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-dark-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date d'activation</span>
                </div>
                <p className="text-white font-semibold">
                  {new Date(activeSubscription.createdAt).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>

              {activeSubscription.currentPeriodEnd && (
                <div className="bg-dark-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-dark-400 mb-1">
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">Prochain renouvellement</span>
                  </div>
                  <p className="text-white font-semibold">
                    {new Date(
                      activeSubscription.currentPeriodEnd
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}

              <div className="bg-dark-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-dark-400 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Mode de paiement</span>
                </div>
                <p className="text-white font-semibold">Paystack</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <div>
                {activeSubscription.cancelAtPeriodEnd ? (
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Votre abonnement sera annulé à la fin de la période en
                    cours
                  </p>
                ) : (
                  <p className="text-dark-400 text-sm">
                    Renouvellement automatique actif
                  </p>
                )}
              </div>
              {!activeSubscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSub(activeSubscription);
                    setCancelDialogOpen(true);
                  }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Annuler l'abonnement
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-dark-900/40 rounded-2xl border border-dark-800"
          >
            <Crown className="w-16 h-16 mx-auto mb-4 text-dark-500" />
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun abonnement actif
            </h3>
            <p className="text-dark-400 mb-6">
              Profitez de la génération illimitée avec un abonnement Premium
            </p>
            <Button
              onClick={() => router.push("/pricing")}
              className="bg-gradient-violet"
            >
              <Zap className="w-4 h-4 mr-2" />
              Découvrir les plans
            </Button>
          </motion.div>
        )}

        {subscriptions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Historique</h3>
            <div className="space-y-3">
              {subscriptions.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark-900/40 rounded-xl p-4 border border-dark-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusBadge(sub.status)}
                      <span className="text-sm text-dark-400">
                        Créé{" "}
                        {formatDistanceToNow(new Date(sub.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        <AnimatePresence>
          {cancelDialogOpen && selectedSub && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
              onClick={() => setCancelDialogOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  Annuler l'abonnement ?
                </h3>
                <p className="text-dark-400 mb-6">
                  Vous perdrez l'accès aux fonctionnalités premium à la fin de
                  votre période actuelle. Cette action est irréversible.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={cancelling !== null}
                  >
                    Conserver
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleCancelSubscription(selectedSub.id)}
                    disabled={cancelling !== null}
                  >
                    {cancelling === selectedSub.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Annulation...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Annuler
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
