"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Disable static generation for this page (requires authentication)
export const dynamic = "force-dynamic";

/**
 * Page de développement pour promouvoir des utilisateurs au rôle ADMIN
 * ⚠️ À supprimer ou sécuriser en production
 */
export default function AdminPromotePage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePromote = async (action: "promote" | "demote") => {
    if (!email.trim()) {
      setError("Veuillez saisir un email");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      setMessage(`✅ ${data.message}`);
      setEmail("");

      // Afficher les détails de l'utilisateur
      if (data.user) {
        console.log("Utilisateur modifié:", data.user);
      }
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-900/50 backdrop-blur-xl rounded-2xl border border-dark-800/50 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
              Administration - Gestion des Rôles
            </h1>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Développement uniquement</strong> - Cette page doit
                être supprimée ou sécurisée en production
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark-300 mb-2"
              >
                Email de l'utilisateur
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handlePromote("promote")}
                disabled={isLoading}
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Promotion..." : "⬆️ Promouvoir Admin"}
              </Button>

              <Button
                onClick={() => handlePromote("demote")}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
              >
                {isLoading ? "Rétrogradation..." : "⬇️ Rétrograder User"}
              </Button>
            </div>

            {message && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-dark-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                Instructions
              </h3>
              <ul className="text-dark-300 text-sm space-y-2">
                <li>
                  1. L'utilisateur doit s'être connecté au moins une fois pour
                  exister en base
                </li>
                <li>
                  2. Saisissez l'email exact utilisé lors de l'inscription
                </li>
                <li>3. La promotion donne accès aux routes d'administration</li>
                <li>4. La rétrogradation enlève les privilèges d'admin</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Alternative via CLI
              </h3>
              <code className="text-sm text-blue-300 bg-dark-900/50 px-3 py-2 rounded block">
                npm run promote-admin email@exemple.com
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
