"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Politique de confidentialité
              </h1>
              <p className="text-dark-300 mt-2">
                Dernière mise à jour : 23 octobre 2025
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8 space-y-8 text-dark-200"
        >
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Chez Sorami, nous accordons une grande importance à la protection
              de vos données personnelles. Cette politique de confidentialité
              décrit comment nous collectons, utilisons et protégeons vos
              informations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              2. Données collectées
            </h2>
            <p className="leading-relaxed mb-4">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Informations d'identification (nom, email)</li>
              <li>Données d'utilisation de la plateforme</li>
              <li>Contenus générés (images, vidéos, textes)</li>
              <li>
                Informations de paiement (traitées par nos partenaires
                sécurisés)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              3. Utilisation des données
            </h2>
            <p className="leading-relaxed mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience</li>
              <li>Traiter vos paiements</li>
              <li>Communiquer avec vous concernant nos services</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              4. Partage des données
            </h2>
            <p className="leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Nous pouvons
              partager vos informations uniquement avec :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>
                Nos prestataires de services (AWS, processeurs de paiement)
              </li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              5. Sécurité
            </h2>
            <p className="leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et
              organisationnelles pour protéger vos données, incluant le
              chiffrement SSL/TLS, le stockage sécurisé sur AWS S3, et des
              contrôles d'accès stricts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              6. Vos droits
            </h2>
            <p className="leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              7. Contact
            </h2>
            <p className="leading-relaxed">
              Pour toute question concernant cette politique ou pour exercer vos
              droits, contactez-nous à :
              <br />
              <a
                href="mailto:privacy@sorami.ai"
                className="text-primary-400 hover:text-primary-300"
              >
                privacy@sorami.ai
              </a>
            </p>
          </section>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-4"
        >
          <Link href="/terms">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Conditions d'utilisation
            </Button>
          </Link>
          <Link href="/legal">
            <Button variant="outline">
              <Scale className="w-4 h-4 mr-2" />
              Mentions légales
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
