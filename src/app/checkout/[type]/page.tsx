"use client";

import React, { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const search = useSearchParams();
  const plan = search?.get("plan");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(5000);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!email) return alert("Email requis");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount / 100 ? amount / 100 : amount,
          email,
          metadata: { type, plan },
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        // redirect user to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        alert("Erreur initialisation paiement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Paiement {type}</h1>
        <div className="bg-dark-900/40 p-6 rounded-xl border border-dark-800">
          <label className="block text-sm text-dark-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-dark-800/30 mt-2"
          />

          <label className="block text-sm text-dark-400 mt-4">
            Montant (XOF)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-3 rounded-md bg-dark-800/30 mt-2"
          />

          <div className="mt-4">
            <Button onClick={handlePay} disabled={loading}>
              Payer
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
