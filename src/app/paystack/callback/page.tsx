"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PaystackCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState(
    "Vérification du paiement en cours..."
  );

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get("reference");
      const trxref = searchParams.get("trxref");

      const paymentReference = reference || trxref;

      if (!paymentReference) {
        setStatus("error");
        setMessage("Référence de paiement manquante");
        return;
      }

      const token = await getToken();
      if (!token) {
        setStatus("error");
        setMessage("Vous devez être connecté");
        return;
      }

      // Vérifier le paiement avec notre API
      const response = await fetch(
        `/api/payments/verify?reference=${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Paiement confirmé avec succès !");

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Échec de la vérification du paiement");
      }
    } catch (error) {
      console.error("Erreur vérification paiement:", error);
      setStatus("error");
      setMessage("Erreur lors de la vérification du paiement");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 bg-dark-900/50 backdrop-blur-xl rounded-2xl border border-dark-800/50 text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary-500 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Vérification en cours
            </h1>
            <p className="text-dark-400">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Paiement réussi !
            </h1>
            <p className="text-dark-400 mb-6">{message}</p>
            <p className="text-sm text-dark-500">
              Redirection vers le dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Erreur de paiement
            </h1>
            <p className="text-dark-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/pricing")} variant="outline">
                Retour aux tarifs
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Aller au dashboard
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
