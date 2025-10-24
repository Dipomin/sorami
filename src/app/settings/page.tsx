"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    // Account
    displayName: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",

    // Notifications
    emailNotifications: true,
    productUpdates: true,
    weeklyDigest: false,

    // Preferences
    language: "fr",
    theme: "dark",
    defaultWordCount: 2000,
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    setSavedSection(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    setSavedSection(section);

    setTimeout(() => setSavedSection(null), 3000);
  };

  const settingsSections = [
    {
      id: "account",
      title: "Compte",
      icon: User,
      description: "Gérez vos informations personnelles",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Configurez vos préférences de notification",
    },
    {
      id: "preferences",
      title: "Préférences",
      icon: Palette,
      description: "Personnalisez votre expérience",
    },
    {
      id: "billing",
      title: "Facturation",
      icon: CreditCard,
      description: "Gérez votre abonnement et vos paiements",
    },
    {
      id: "security",
      title: "Sécurité",
      icon: Shield,
      description: "Sécurisez votre compte",
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              Paramètres
            </h1>
            <p className="text-dark-300">
              Gérez vos préférences et votre compte
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-4 sticky top-24">
                <nav className="space-y-1">
                  {settingsSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <motion.a
                        key={section.id}
                        href={`#${section.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800/50 text-dark-300 hover:text-white transition-all group"
                      >
                        <Icon className="w-5 h-5 text-primary-400 group-hover:text-primary-300" />
                        <span className="font-medium">{section.title}</span>
                      </motion.a>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Section */}
              <motion.section
                id="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      Compte
                    </h2>
                    <p className="text-sm text-dark-400">
                      Vos informations personnelles
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-dark-800/30 border border-dark-700/30 rounded-xl text-dark-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-2">
                      L'email ne peut pas être modifié directement
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => handleSave("account")}
                      disabled={saving}
                      variant="glow"
                      className="gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : savedSection === "account" ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Enregistré
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.section>

              {/* Notifications Section */}
              <motion.section
                id="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-sm text-dark-400">
                      Choisissez ce que vous souhaitez recevoir
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Notifications par email",
                      description:
                        "Recevez des emails pour les événements importants",
                    },
                    {
                      key: "productUpdates",
                      label: "Mises à jour produit",
                      description:
                        "Nouveautés et améliorations de la plateforme",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Résumé hebdomadaire",
                      description: "Statistiques et activité de la semaine",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl border border-dark-700/30"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-dark-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            settings[
                              item.key as keyof typeof settings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => handleSave("notifications")}
                    disabled={saving}
                    variant="glow"
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : savedSection === "notifications" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Enregistré
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </motion.section>

              {/* Preferences Section */}
              <motion.section
                id="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      Préférences
                    </h2>
                    <p className="text-sm text-dark-400">
                      Personnalisez votre expérience
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings({ ...settings, language: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Nombre de mots par défaut
                    </label>
                    <input
                      type="number"
                      value={settings.defaultWordCount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultWordCount: parseInt(e.target.value),
                        })
                      }
                      min={800}
                      max={5000}
                      step={100}
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => handleSave("preferences")}
                    disabled={saving}
                    variant="glow"
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : savedSection === "preferences" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Enregistré
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </motion.section>

              {/* Billing Section */}
              <motion.section
                id="billing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      Facturation
                    </h2>
                    <p className="text-sm text-dark-400">
                      Gérez votre abonnement
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-dark-400">Plan actuel</p>
                      <p className="text-2xl font-display font-bold text-white">
                        Pro
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-dark-400">Prix</p>
                      <p className="text-2xl font-display font-bold text-white">
                        29€<span className="text-lg text-dark-400">/mois</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-dark-300">
                    Prochaine facturation le 1er novembre 2025
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1">
                    Changer de plan
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-400 hover:text-red-300 hover:border-red-500/50"
                  >
                    Annuler l'abonnement
                  </Button>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
