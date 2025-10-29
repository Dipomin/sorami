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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les plans
      const plansResponse = await fetch("/api/plans");
      if (!plansResponse.ok) {
        throw new Error("Erreur lors du chargement des plans");
      }
      const plansData = await plansResponse.json();
      setPlans(plansData.plans || []);

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

      // Initialiser l'abonnement
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
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
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Accédez à toutes les fonctionnalités de Sorami et créez du contenu
            illimité avec l'IA
          </p>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(index);
            const gradient = gradients[index % gradients.length];
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            const isSubscribing = subscribingPlanId === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 bg-dark-900/50 backdrop-blur-xl rounded-2xl border ${
                  isCurrentPlan ? "border-green-500/50" : "border-dark-800/50"
                } hover:border-primary-500/50 transition-all duration-300`}
              >
                {/* Badge abonnement actif */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Actif
                    </span>
                  </div>
                )}

                {/* Icône */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Nom du plan */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>

                {/* Description */}
                {plan.description && (
                  <p className="text-dark-400 text-sm mb-4">
                    {plan.description}
                  </p>
                )}

                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.amount.toLocaleString()}
                    </span>
                    <span className="text-dark-400">{plan.currency}</span>
                  </div>
                  <p className="text-dark-400 text-sm mt-1">
                    par {intervalLabels[plan.interval] || plan.interval}
                  </p>
                </div>

                {/* Bouton d'action */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isSubscribing}
                  className={`w-full ${
                    isCurrentPlan
                      ? "bg-dark-800 cursor-not-allowed"
                      : `bg-gradient-to-r ${gradient} hover:opacity-90`
                  }`}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : isCurrentPlan ? (
                    "Plan actuel"
                  ) : (
                    "Souscrire"
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
            className="text-center py-12"
          >
            <p className="text-dark-400">
              Aucun plan d'abonnement disponible pour le moment.
            </p>
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
