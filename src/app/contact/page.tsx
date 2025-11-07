"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  User,
  Send,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du message");
      }

      setStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
      });

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite. Veuillez réessayer.",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "contact@sorami.app",
      link: "mailto:contact@sorami.app",
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Abidjan, Côte d'Ivoire",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "Lun - Ven : 9h - 18h (GMT)",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              Contactez-nous
            </span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
            Envoyez-nous un message et nous vous répondrons rapidement.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-8">
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary-400" />
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-dark-200 mb-2"
                  >
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                      disabled={status.type === "loading"}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-dark-200 mb-2"
                  >
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="votre.email@exemple.com"
                      disabled={status.type === "loading"}
                    />
                  </div>
                </div>

                {/* Sujet */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-dark-200 mb-2"
                  >
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="De quoi souhaitez-vous parler ?"
                    disabled={status.type === "loading"}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-dark-200 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-900/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre demande en détail..."
                    disabled={status.type === "loading"}
                  />
                </div>

                {/* Status Messages */}
                {status.type === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-300">{status.message}</p>
                  </motion.div>
                )}

                {status.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{status.message}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="glow"
                  className="w-full"
                  disabled={status.type === "loading"}
                >
                  {status.type === "loading" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Carte d'informations */}
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg">
                    <info.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {info.title}
                    </h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-dark-300 hover:text-primary-400 transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-dark-300">{info.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Call to action */}
            <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 backdrop-blur-sm rounded-xl border border-primary-500/20 p-6">
              <h3 className="font-display font-bold text-xl mb-3 text-white">
                Besoin d'assistance ?
              </h3>
              <p className="text-dark-300 mb-4 text-sm">
                Notre équipe support est disponible pour répondre à toutes vos
                questions et vous accompagner dans l'utilisation de Sorami.
              </p>
              <div className="flex flex-col gap-2 text-sm text-dark-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Temps de réponse moyen : 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  <span>Support en français</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
