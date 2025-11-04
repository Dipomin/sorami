"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Crown, Zap, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface Plan {
  id: string;
  paystackId: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
  description: string | null;
}

interface CurrentSubscription {
  id: string;
  status: string;
  plan: {
    id: string;
    name: string;
    amount: number;
    interval: string;
  };
}

export default function PricingPage() {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );

  // Mapping des intervalles pour l'affichage en français
  const intervalLabels: Record<string, string> = {
    daily: "jour",
    weekly: "semaine",
    monthly: "mois",
    quarterly: "trimestre",
    biannually: "semestre",
    annually: "an",
  };

  // Icônes par plan (basé sur le montant)
  const getPlanIcon = (index: number) => {
    const icons = [Crown, Zap, Rocket];
    return icons[index % icons.length];
  };

  // Couleurs de gradient par plan
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
  ];

  useEffect(() => {
    loadData();
  }, [billingCycle]); // Recharger quand le cycle change

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les plans depuis Paystack
      const plansResponse = await fetch("/api/plans");
      if (!plansResponse.ok) {
        throw new Error("Erreur lors du chargement des plans");
      }
      const plansData = await plansResponse.json();

      // Filtrer les plans selon le cycle de facturation (interval)
      const targetInterval =
        billingCycle === "monthly" ? "monthly" : "annually";

      const filteredPlans = (plansData.plans || []).filter(
        (plan: Plan) => plan.interval === targetInterval
      );

      setPlans(filteredPlans);

      // Charger l'abonnement actuel
      const token = await getToken();
      if (token) {
        const subResponse = await fetch("/api/subscriptions/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setCurrentSubscription(subData.subscription);
        }
      }
    } catch (err) {
      console.error("Erreur chargement données:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribingPlanId(planId);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Vous devez être connecté pour souscrire");
        return;
      }

      // Initialiser l'abonnement avec le cycle de facturation
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'initialisation");
      }

      const data = await response.json();

      // Rediriger vers l'URL d'autorisation Paystack
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("URL d'autorisation manquante");
      }
    } catch (err) {
      console.error("Erreur souscription:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubscribingPlanId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choisissez votre{" "}
            <span className="bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent">
              abonnement
            </span>
          </h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto mb-8">
            Accédez à toutes les fonctionnalités de Sorami et créez du contenu
            illimité avec l'IA
          </p>

          {/* Toggle Mensuel/Annuel */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg"
                  : "bg-dark-800/50 text-dark-400 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 relative ${
                billingCycle === "annually"
                  ? "bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg"
                  : "bg-dark-800/50 text-dark-400 hover:text-white"
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Abonnement actuel */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-semibold">
                Abonnement actif : {currentSubscription.plan.name}
              </span>
            </div>
          </motion.div>
        )}

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(index);
            const gradient = gradients[index % gradients.length];
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            const isSubscribing = subscribingPlanId === plan.id;

            // Affichage du prix direct depuis le plan (le montant est déjà en unité principale)
            const isAnnual = billingCycle === "annually";
            const displayAmount = plan.amount; // Déjà converti dans l'API
            const monthlyEquivalent = isAnnual
              ? Math.round(displayAmount / 12)
              : null;

            // Détails spécifiques par plan (basé sur le nom ou le montant)
            const isStandardPlan =
              plan.name.toLowerCase().includes("standard") ||
              (isAnnual ? plan.amount < 150000 : plan.amount < 20000);
            const planDetails = isStandardPlan
              ? {
                  features: [
                    "3 500 crédits par mois",
                    "100 images haute qualité",
                    "10 articles de blog optimisés SEO",
                    "3 vidéos HD",
                    "Stockage cloud sécurisé",
                    "Support prioritaire",
                  ],
                  badge: null,
                }
              : {
                  features: [
                    "8 000 crédits par mois",
                    "700 images premium",
                    "50 articles de blog professionnels",
                    "10 vidéos HD personnalisées",
                    "5 ebooks complets",
                    "API complète",
                    "Support dédié 24/7",
                    "Analytiques avancées",
                  ],
                  badge: "🔥 POPULAIRE",
                };

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 bg-dark-900/50 backdrop-blur-xl rounded-2xl border-2 ${
                  isCurrentPlan
                    ? "border-green-500/50"
                    : planDetails.badge
                    ? "border-primary-500/50"
                    : "border-dark-800/50"
                } hover:border-primary-500/50 transition-all duration-300 ${
                  planDetails.badge ? "scale-105" : ""
                }`}
              >
                {/* Badge populaire ou actif */}
                {planDetails.badge && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
                      {planDetails.badge}
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                      ✓ ACTIF
                    </span>
                  </div>
                )}

                {/* Icône */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Nom du plan */}
                <h3 className="text-3xl font-bold text-white mb-3">
                  {plan.name}
                </h3>

                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      {displayAmount.toLocaleString()}
                    </span>
                    <span className="text-xl text-dark-400">F CFA</span>
                  </div>
                  <p className="text-dark-400 text-sm mt-2">
                    {isAnnual ? (
                      <>
                        par an{" "}
                        <span className="text-green-400 font-semibold">
                          (soit {monthlyEquivalent?.toLocaleString()} F/mois)
                        </span>
                      </>
                    ) : (
                      `par ${intervalLabels[plan.interval] || plan.interval}`
                    )}
                  </p>
                  {isAnnual && (
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                      <span className="text-green-400 text-xs font-semibold">
                        ✨ Économisez 20% avec le paiement annuel
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {planDetails.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-dark-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bouton d'action */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isSubscribing}
                  size="lg"
                  className={`w-full ${
                    isCurrentPlan
                      ? "bg-dark-800 cursor-not-allowed"
                      : `bg-gradient-to-r ${gradient} hover:opacity-90 shadow-lg`
                  }`}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : isCurrentPlan ? (
                    "Plan actuel"
                  ) : (
                    `Souscrire ${plan.name}`
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Pas de plans */}
        {plans.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-dark-900/30 backdrop-blur-xl rounded-2xl border border-dark-800/50 p-8"
          >
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Plans {billingCycle === "monthly" ? "mensuels" : "annuels"} non
              disponibles
            </h3>
            <p className="text-dark-400 mb-4">
              Les plans d'abonnement{" "}
              {billingCycle === "monthly" ? "mensuels" : "annuels"} ne sont pas
              encore configurés.
            </p>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "annually" : "monthly"
                )
              }
              className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Voir les plans{" "}
              {billingCycle === "monthly" ? "annuels" : "mensuels"}
            </button>
          </motion.div>
        )}

        {/* Section FAQ ou avantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 p-8 bg-dark-900/30 backdrop-blur-xl rounded-2xl border border-dark-800/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Tous les plans incluent
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Génération de livres IA illimitée",
              "Génération d'images e-commerce",
              "Génération de vidéos personnalisées",
              "Génération d'articles de blog",
              "Stockage cloud sécurisé",
              "Support prioritaire",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-dark-300">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
