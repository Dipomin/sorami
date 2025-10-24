"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Building2,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Mentions légales
              </h1>
              <p className="text-dark-300 mt-2">
                Informations légales et éditoriales
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Éditeur */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-display font-bold text-white">
                Éditeur du site
              </h2>
            </div>
            <div className="space-y-3 text-dark-200">
              <p>
                <strong className="text-white">Raison sociale :</strong> Sorami
                SAS
              </p>
              <p>
                <strong className="text-white">Capital social :</strong> 50 000
                €
              </p>
              <p>
                <strong className="text-white">SIRET :</strong> 123 456 789
                00012
              </p>
              <p>
                <strong className="text-white">RCS :</strong> Paris B 123 456
                789
              </p>
              <p>
                <strong className="text-white">TVA intracommunautaire :</strong>{" "}
                FR 12 123456789
              </p>
            </div>
          </div>

          {/* Siège social */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-display font-bold text-white">
                Siège social
              </h2>
            </div>
            <div className="space-y-2 text-dark-200">
              <p>123 Avenue de l'Innovation</p>
              <p>75001 Paris, France</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-display font-bold text-white">
                Contact
              </h2>
            </div>
            <div className="space-y-2 text-dark-200">
              <p>
                <strong className="text-white">Email :</strong>{" "}
                <a
                  href="mailto:contact@sorami.ai"
                  className="text-primary-400 hover:text-primary-300"
                >
                  contact@sorami.ai
                </a>
              </p>
              <p>
                <strong className="text-white">Téléphone :</strong> +33 1 23 45
                67 89
              </p>
            </div>
          </div>

          {/* Directeur de publication */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Directeur de publication
            </h2>
            <p className="text-dark-200">Josh Hili, Président</p>
          </div>

          {/* Hébergement */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Hébergement
            </h2>
            <div className="space-y-2 text-dark-200">
              <p>
                <strong className="text-white">Hébergeur :</strong> Amazon Web
                Services (AWS)
              </p>
              <p>
                <strong className="text-white">Adresse :</strong> Amazon Web
                Services EMEA SARL
              </p>
              <p>38 Avenue John F. Kennedy, L-1855 Luxembourg</p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Propriété intellectuelle
            </h2>
            <p className="text-dark-200 leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos,
              icônes) est la propriété exclusive de Sorami SAS, sauf mention
              contraire. Toute reproduction, distribution ou utilisation sans
              autorisation préalable est strictement interdite et constitue une
              contrefaçon sanctionnée par le Code de la Propriété
              Intellectuelle.
            </p>
          </div>

          {/* Données personnelles */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Protection des données personnelles
            </h2>
            <p className="text-dark-200 leading-relaxed mb-4">
              Conformément au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés, vous disposez d'un
              droit d'accès, de rectification, d'effacement et de portabilité de
              vos données personnelles.
            </p>
            <p className="text-dark-200 leading-relaxed">
              Pour exercer ces droits, contactez notre Délégué à la Protection
              des Données :
              <a
                href="mailto:dpo@sorami.ai"
                className="text-primary-400 hover:text-primary-300 ml-1"
              >
                dpo@sorami.ai
              </a>
            </p>
          </div>

          {/* Cookies */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Cookies
            </h2>
            <p className="text-dark-200 leading-relaxed">
              Ce site utilise des cookies nécessaires à son fonctionnement et à
              l'amélioration de l'expérience utilisateur. En poursuivant votre
              navigation, vous acceptez l'utilisation de ces cookies. Vous
              pouvez configurer vos préférences dans les paramètres de votre
              navigateur.
            </p>
          </div>

          {/* Médiation */}
          <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Médiation
            </h2>
            <p className="text-dark-200 leading-relaxed">
              Conformément aux articles L.616-1 et R.616-1 du Code de la
              consommation, nous proposons un dispositif de médiation de la
              consommation. Le médiateur peut être saisi par tout consommateur
              sur le site
              <a
                href="https://mediateur-consommation.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 ml-1"
              >
                mediateur-consommation.fr
              </a>
            </p>
          </div>
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
          <Link href="/terms">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Conditions d'utilisation
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
