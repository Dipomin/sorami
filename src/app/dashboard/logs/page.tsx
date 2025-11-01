"use client";

import { useState, useEffect, Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  AlertCircle,
  Info,
  AlertTriangle,
  Terminal,
  Server,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

type LogType = "pm2" | "nginx" | "system" | "all";
type LogLevel = "all" | "error" | "warn" | "info";

function LogsContent() {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<LogType>("pm2");
  const [level, setLevel] = useState<LogLevel>("all");
  const [lines, setLines] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/logs?type=${type}&lines=${lines}&level=${level}`
      );
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setLastUpdate(new Date(data.timestamp));
      } else {
        setLogs(`Erreur: ${data.error}\n${data.details || ""}`);
      }
    } catch (error: any) {
      setLogs(`Erreur réseau: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [type, level, lines]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, [autoRefresh, type, level, lines]);

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sorami-logs-${type}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogTypeIcon = (logType: LogType) => {
    switch (logType) {
      case "pm2":
        return <Terminal className="w-4 h-4" />;
      case "nginx":
        return <Server className="w-4 h-4" />;
      case "system":
        return <Activity className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const getLevelIcon = (logLevel: LogLevel) => {
    switch (logLevel) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Monitoring des Logs
          </h1>
          <p className="text-dark-400">
            Consultez les logs de l&apos;application en temps réel
          </p>
        </motion.div>

        {/* Contrôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-900/40 backdrop-blur-sm border border-dark-800 rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Type de logs */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Source
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["pm2", "nginx", "system", "all"] as LogType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      type === t
                        ? "bg-violet-600 text-white"
                        : "bg-dark-800/50 text-dark-300 hover:bg-dark-800"
                    }`}
                  >
                    {getLogTypeIcon(t)}
                    <span className="text-xs capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Niveau
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["all", "error", "warn", "info"] as LogLevel[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      level === l
                        ? "bg-violet-600 text-white"
                        : "bg-dark-800/50 text-dark-300 hover:bg-dark-800"
                    }`}
                  >
                    {getLevelIcon(l)}
                    <span className="text-xs capitalize">{l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre de lignes */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Lignes
              </label>
              <select
                value={lines}
                onChange={(e) => setLines(Number(e.target.value))}
                className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Actions
              </label>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={fetchLogs}
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Rafraîchir
                </Button>
                <Button
                  onClick={downloadLogs}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </div>

          {/* Auto-refresh */}
          <div className="flex items-center gap-4 pt-4 border-t border-dark-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-dark-700 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-dark-300">
                Rafraîchissement automatique (5s)
              </span>
            </label>

            {lastUpdate && (
              <span className="text-xs text-dark-500 ml-auto">
                Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Zone de logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/40 backdrop-blur-sm border border-dark-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {getLogTypeIcon(type)}
              Logs {type.toUpperCase()}
              {level !== "all" && ` - ${level.toUpperCase()}`}
            </h2>
            <span className="text-xs text-dark-500">
              {logs.split("\n").length} lignes
            </span>
          </div>

          <div className="relative">
            <pre className="bg-black/50 rounded-lg p-4 text-xs font-mono text-green-400 overflow-x-auto max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
                  <span className="ml-2 text-dark-400">
                    Chargement des logs...
                  </span>
                </div>
              ) : logs ? (
                logs
              ) : (
                <div className="text-center text-dark-500 py-8">
                  Aucun log disponible
                </div>
              )}
            </pre>
          </div>
        </motion.div>

        {/* Informations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">💡 Astuce</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li>
                  Activez le rafraîchissement automatique pour surveiller en
                  temps réel
                </li>
                <li>
                  Filtrez par niveau pour ne voir que les erreurs ou warnings
                </li>
                <li>Téléchargez les logs pour analyse hors ligne</li>
                <li>
                  Les logs Nginx nécessitent des permissions sudo sur le serveur
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        </DashboardLayout>
      }
    >
      <LogsContent />
    </Suspense>
  );
}
