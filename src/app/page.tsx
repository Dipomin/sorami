"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Video,
  FileText,
  BookOpen,
  ArrowRight,
  Zap,
  Users,
  Shield,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BlogPreview from "@/components/BlogPreview";
import Newsletter from "@/components/Newsletter";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const features = [
  {
    icon: Sparkles,
    title: "Génération d'images",
    description:
      "Créez des visuels époustouflants avec l'IA en quelques secondes",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Video,
    title: "Génération de vidéos",
    description: "Transformez vos idées en vidéos captivantes automatiquement",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: FileText,
    title: "Articles de blog",
    description: "Rédigez des articles professionnels optimisés SEO en un clic",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BookOpen,
    title: "Création d'ebooks",
    description:
      "Générez des livres numériques complets structurés et cohérents",
    color: "from-violet-500 to-purple-500",
  },
];

const steps = [
  {
    number: 1,
    title: "Choisissez un outil",
    desc: "Images, vidéos, articles ou ebooks",
  },
  {
    number: 2,
    title: "Décrivez votre idée",
    desc: "Exprimez votre vision en quelques mots",
  },
  {
    number: 3,
    title: "Générez votre contenu",
    desc: "L'IA crée pour vous en quelques instants",
  },
];

const pricingPlans = [
  {
    name: "Gratuit",
    price: "0 F",
    period: "/ mois",
    description: "Pour découvrir la plateforme",
    features: [
      "10 crédits d'essai",
      "Génération d'images (watermark)",
      "1 article de blog",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
    paystackPlanCode: null,
  },
  {
    name: "STANDARD",
    price: "15 000 F",
    period: "/ mois",
    description: "Idéal pour les créateurs de contenu",
    features: [
      "3 500 crédits par mois",
      "100 images haute qualité",
      "10 articles de blog optimisés SEO",
      "3 vidéos HD",
      "Stockage cloud sécurisé",
      "Support prioritaire",
    ],
    cta: "Souscrire Standard",
    highlighted: true,
    paystackPlanCode: "PLN_dbrclylu9lqaraa",
  },
  {
    name: "CRÉATEUR",
    price: "35 000 F",
    period: "/ mois",
    description: "Pour les professionnels et entreprises",
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
    cta: "Souscrire Créateur",
    highlighted: false,
    paystackPlanCode: "PLN_grjhlpleqbx9hyc",
  },
];

const HomePage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );

  // Récupérer les derniers articles de blog
  const { posts: blogPosts, isLoading: blogLoading } = useBlogPosts({
    limit: 6,
    status: "PUBLISHED",
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  // Calculer les prix selon le cycle de facturation
  const getPlanPrice = (basePrice: string) => {
    const numericPrice = parseInt(basePrice.replace(/\D/g, ""));
    if (billingCycle === "annually") {
      const annualPrice = Math.round(numericPrice * 12 * 0.8);
      const monthlyEquivalent = Math.round(annualPrice / 12);
      return {
        display: `${annualPrice.toLocaleString()} F`,
        period: "/ an",
        monthlyEquivalent: `${monthlyEquivalent.toLocaleString()} F/mois`,
      };
    }
    return {
      display: basePrice,
      period: "/ mois",
      monthlyEquivalent: null,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-7xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-600 bg-clip-text text-transparent mb-4">
                Sorami
              </h1>
            </motion.div>

            {/* Slogan */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-3xl md:text-5xl font-display font-bold text-white mb-6"
            >
              Créez. Imaginez. Innovez avec l'IA.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-dark-300 mb-12 max-w-3xl mx-auto"
            >
              La plateforme tout-en-un pour générer des images, vidéos, articles
              et ebooks grâce à l'intelligence artificielle de pointe.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/dashboard">
                <Button variant="glow" size="lg" className="group">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Découvrir les fonctionnalités
                </Button>
              </Link>
            </motion.div>

            {/* Animated illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 relative"
            >
              <div className="relative w-full max-w-4xl mx-auto h-96 rounded-3xl bg-gradient-to-br from-primary-900/50 to-accent-900/50 backdrop-blur-xl border border-primary-500/20 shadow-glow-lg overflow-hidden">
                <div className="absolute inset-0 bg-glow-violet opacity-50" />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      scale: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="w-64 h-64"
                  >
                    <Sparkles className="w-full h-full text-primary-400 opacity-60" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Tous vos outils créatifs en un seul endroit
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Une suite complète d'outils IA pour donner vie à toutes vos idées
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="h-full p-8 rounded-2xl bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow group">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-dark-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-dark-950/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-dark-300">
              Trois étapes simples pour libérer votre créativité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-3xl font-bold shadow-glow">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-600 to-transparent" />
                  )}
                </div>
                <h3 className="text-2xl font-display font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-dark-300">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Des tarifs adaptés à vos besoins
            </h2>
            <p className="text-xl text-dark-300 mb-8">
              Commencez gratuitement — changez quand vous voulez
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

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-primary-900/50 to-accent-900/50 border-2 border-primary-500 shadow-glow-lg scale-105"
                    : "bg-dark-900/50 border border-dark-800/50"
                } backdrop-blur-sm`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-violet px-4 py-1 rounded-full text-white text-sm font-semibold">
                    Le plus populaire
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-dark-300 mb-4">{plan.description}</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.paystackPlanCode
                        ? getPlanPrice(plan.price).display
                        : plan.price}
                    </span>
                    <span className="text-dark-400 ml-2">
                      {plan.paystackPlanCode
                        ? getPlanPrice(plan.price).period
                        : plan.period}
                    </span>
                  </div>
                  {plan.paystackPlanCode && billingCycle === "annually" && (
                    <p className="text-green-400 text-sm font-semibold">
                      soit {getPlanPrice(plan.price).monthlyEquivalent}
                    </p>
                  )}
                  {plan.paystackPlanCode && billingCycle === "annually" && (
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                      <span className="text-green-400 text-xs font-semibold">
                        ✨ Économisez 20%
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-dark-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  //asChild
                  onClick={() => {
                    window.location.href = "/dashboard";
                  }}
                  variant={plan.highlighted ? "glow" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center gap-8 items-center text-dark-400"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>+100 créateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Stockage AWS S3</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-violet opacity-20 blur-3xl rounded-full" />
          <div className="relative z-10 p-12 rounded-3xl bg-dark-900/50 backdrop-blur-sm border border-primary-500/30">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Prêt à créer quelque chose d'incroyable ?
            </h2>
            <p className="text-xl text-dark-300 mb-8">
              Rejoignez des milliers de créateurs qui utilisent Sorami pour
              donner vie à leurs idées
            </p>
            <Link href="/dashboard">
              <Button variant="glow" size="lg" className="group">
                Essayer maintenant
                <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* Blog Preview Section */}
      {!blogLoading && blogPosts.length > 0 && (
        <BlogPreview posts={blogPosts} />
      )}

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
                Sorami
              </h3>
              <p className="text-dark-400">
                Créez du contenu exceptionnel avec l'IA
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-dark-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-dark-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-primary-400 transition-colors"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-dark-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-primary-400 transition-colors"
                  >
                    CGU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-800/50 pt-8 text-center text-dark-400">
            <p>© 2025 Sorami. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
