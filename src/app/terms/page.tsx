"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Conditions générales d'utilisation
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
              1. Acceptation des conditions
            </h2>
            <p className="leading-relaxed">
              En accédant et en utilisant Sorami, vous acceptez d'être lié par
              ces conditions générales d'utilisation. Si vous n'acceptez pas ces
              conditions, veuillez ne pas utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              2. Description des services
            </h2>
            <p className="leading-relaxed mb-4">
              Sorami est une plateforme de création de contenu assistée par
              intelligence artificielle permettant de :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Générer des images à partir de descriptions textuelles</li>
              <li>Créer des vidéos avec l'IA</li>
              <li>Rédiger des articles de blog optimisés</li>
              <li>Produire des ebooks structurés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              3. Compte utilisateur
            </h2>
            <p className="leading-relaxed mb-4">
              Pour utiliser nos services, vous devez :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Créer un compte avec des informations exactes</li>
              <li>Maintenir la sécurité de votre mot de passe</li>
              <li>
                Avoir au moins 18 ans ou l'âge de la majorité dans votre
                juridiction
              </li>
              <li>Ne pas partager votre compte avec d'autres personnes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              4. Utilisation acceptable
            </h2>
            <p className="leading-relaxed mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Générer du contenu illégal, diffamatoire ou offensant</li>
              <li>Violer les droits de propriété intellectuelle d'autrui</li>
              <li>Utiliser les services à des fins malveillantes</li>
              <li>Tenter de contourner les limitations techniques</li>
              <li>Revendre l'accès aux services sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              5. Propriété intellectuelle
            </h2>
            <p className="leading-relaxed">
              Le contenu que vous générez vous appartient. Cependant, vous
              accordez à Sorami une licence limitée pour stocker et traiter ce
              contenu afin de fournir les services. Sorami conserve tous les
              droits sur la plateforme, la technologie et les marques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              6. Paiements et abonnements
            </h2>
            <p className="leading-relaxed mb-4">Concernant les paiements :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Les prix sont indiqués en euros TTC</li>
              <li>Les abonnements sont renouvelés automatiquement</li>
              <li>Vous pouvez annuler à tout moment depuis votre compte</li>
              <li>
                Aucun remboursement n'est accordé pour les périodes non
                utilisées
              </li>
              <li>
                Les crédits non utilisés expirent à la fin de chaque période
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              7. Limitation de responsabilité
            </h2>
            <p className="leading-relaxed">
              Sorami fournit les services "en l'état". Nous ne garantissons pas
              que les services seront ininterrompus ou exempts d'erreurs. Notre
              responsabilité est limitée au montant que vous avez payé au cours
              des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              8. Modifications des conditions
            </h2>
            <p className="leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions à tout
              moment. Les modifications importantes seront notifiées par email.
              Votre utilisation continue des services après notification
              constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              9. Résiliation
            </h2>
            <p className="leading-relaxed">
              Nous pouvons suspendre ou résilier votre compte en cas de
              violation de ces conditions. Vous pouvez résilier votre compte à
              tout moment depuis les paramètres.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              10. Contact
            </h2>
            <p className="leading-relaxed">
              Pour toute question concernant ces conditions, contactez-nous à :
              <br />
              <a
                href="mailto:legal@sorami.ai"
                className="text-primary-400 hover:text-primary-300"
              >
                legal@sorami.ai
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
          <Link href="/privacy">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Politique de confidentialité
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
