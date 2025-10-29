"use client";

import { useCredits } from "@/hooks/useCredits";
import { useState } from "react";

export default function CreditsTestPage() {
  const { data, loading, error, refetch, deductCredits } = useCredits();
  const [deductAmount, setDeductAmount] = useState(10);
  const [deducting, setDeducting] = useState(false);
  const [deductError, setDeductError] = useState<string | null>(null);

  const handleDeduct = async () => {
    try {
      setDeducting(true);
      setDeductError(null);
      await deductCredits(
        deductAmount,
        `Test déduction de ${deductAmount} crédits`
      );
      alert(`${deductAmount} crédits déduits avec succès !`);
    } catch (err) {
      setDeductError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDeducting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des crédits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          🧪 Test du Système de Crédits
        </h1>

        {/* Carte principale des crédits */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💳 Vos Crédits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-700">
                {data?.credits.available || 0}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-600 mb-1">Utilisés</p>
              <p className="text-3xl font-bold text-orange-700">
                {data?.credits.used || 0}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-700">
                {data?.credits.total || 0}
              </p>
            </div>
          </div>
          {data?.credits.updatedAt && (
            <p className="text-xs text-gray-500 mt-4">
              Dernière mise à jour :{" "}
              {new Date(data.credits.updatedAt).toLocaleString("fr-FR")}
            </p>
          )}
        </div>

        {/* Abonnement */}
        {data?.subscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📦 Abonnement Actif</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Plan :</span>{" "}
                {data.subscription.plan}
              </p>
              <p>
                <span className="font-medium">Crédits par période :</span>{" "}
                {data.subscription.creditsPerPeriod} /{" "}
                {data.subscription.interval}
              </p>
              <p>
                <span className="font-medium">Statut :</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    data.subscription.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {data.subscription.status}
                </span>
              </p>
              {data.subscription.currentPeriodEnd && (
                <p>
                  <span className="font-medium">Fin de période :</span>{" "}
                  {new Date(
                    data.subscription.currentPeriodEnd
                  ).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Test de déduction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test de Déduction</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de crédits à déduire
              </label>
              <input
                type="number"
                min="1"
                value={deductAmount}
                onChange={(e) => setDeductAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleDeduct}
              disabled={deducting || !deductAmount}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {deducting ? "Déduction..." : "Déduire"}
            </button>
          </div>
          {deductError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{deductError}</p>
            </div>
          )}
        </div>

        {/* Historique des transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            📜 Historique des Transactions
          </h2>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} crédits
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transaction.type === "SUBSCRIPTION" ||
                        transaction.type === "PURCHASE"
                          ? "bg-green-100 text-green-800"
                          : transaction.type === "USAGE"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucune transaction récente
            </p>
          )}
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="mt-6 text-center">
          <button
            onClick={refetch}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🔄 Rafraîchir les données
          </button>
        </div>
      </div>
    </div>
  );
}
