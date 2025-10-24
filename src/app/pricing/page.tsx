"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const plans = [
    { id: "bronze", name: "Mensuel", interval: "monthly", amount: 5000 },
    { id: "silver", name: "Trimestriel", interval: "quarterly", amount: 12000 },
    { id: "gold", name: "Annuel", interval: "yearly", amount: 40000 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Abonnements</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="p-6 bg-dark-900/40 rounded-xl border border-dark-800"
            >
              <h3 className="text-xl font-semibold text-white">{p.name}</h3>
              <p className="text-dark-400 mt-2">
                {p.amount} XOF / {p.interval}
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => {
                    // simple flow: open checkout page for plan
                    window.location.href = `/checkout/subscription?plan=${p.id}`;
                  }}
                >
                  Souscrire
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
