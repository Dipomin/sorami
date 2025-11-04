import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsletterProps {
  className?: string;
  variant?: "default" | "minimal" | "sidebar";
}

const Newsletter: React.FC<NewsletterProps> = ({
  className = "",
  variant = "default",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Veuillez entrer une adresse email valide");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      setStatus("success");
      setMessage("Merci ! Vous êtes maintenant inscrit à notre newsletter.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center space-x-3 ${className}`}>
        <Mail className="w-5 h-5 text-primary-400" />
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="px-3 py-2 bg-dark-800/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={status === "loading"}
            className="border-primary-500/50 text-primary-400 hover:bg-primary-500 hover:text-white"
          >
            {status === "loading" ? "..." : "S'abonner"}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div
        className={`p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 backdrop-blur-sm border border-primary-500/20 ${className}`}
      >
        <div className="flex items-center mb-4">
          <Mail className="w-6 h-6 text-primary-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Newsletter</h3>
        </div>

        <p className="text-dark-300 text-sm mb-4">
          Recevez nos derniers articles et conseils sur l'IA créative
        </p>

        {status === "success" ? (
          <div className="flex items-center text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Inscription réussie !</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-3 py-2 bg-dark-800/50 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              variant="glow"
              disabled={status === "loading"}
              className="w-full"
            >
              {status === "loading" ? "Inscription..." : "S'abonner"}
            </Button>
            {status === "error" && (
              <div className="flex items-center text-red-400 text-xs">
                <X className="w-3 h-3 mr-1" />
                <span>{message}</span>
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <section className={`py-16 px-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-3xl rounded-full" />
          <div className="relative z-10 p-8 md:p-12 rounded-3xl bg-dark-900/50 backdrop-blur-sm border border-primary-500/30">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Restez à la pointe de l'
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                IA créative
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-dark-300 mb-8 max-w-2xl mx-auto">
              Recevez chaque semaine nos derniers guides, tutoriels et conseils
              pour exploiter au maximum le potentiel de l'intelligence
              artificielle dans vos créations.
            </p>

            {/* Success State */}
            {status === "success" ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center text-green-400 text-lg"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                <span>
                  Merci ! Vous êtes maintenant inscrit à notre newsletter.
                </span>
              </motion.div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                      required
                    />
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      disabled={status === "loading"}
                      className="group px-6"
                    >
                      {status === "loading" ? (
                        "Inscription..."
                      ) : (
                        <>
                          S'abonner
                          <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Error Message */}
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center text-red-400 text-sm mt-4"
                    >
                      <X className="w-4 h-4 mr-2" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </form>

                {/* Privacy Notice */}
                <p className="text-dark-400 text-sm mt-6">
                  Pas de spam, désinscription possible à tout moment.
                  <br />
                  Vos données sont protégées selon notre{" "}
                  <a
                    href="/privacy"
                    className="text-primary-400 hover:underline"
                  >
                    politique de confidentialité
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
