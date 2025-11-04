import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  Gift,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "promo";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationCenterProps {
  className?: string;
}

// Notifications de démonstration
const demoNotifications: Notification[] = [
  {
    id: "1",
    type: "promo",
    title: "Nouvelle fonctionnalité !",
    message: "Découvrez la génération de vidéos custom avec l'IA",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    action: {
      label: "Essayer",
      href: "/generate-videos",
    },
  },
  {
    id: "2",
    type: "success",
    title: "Ebook généré",
    message: 'Votre ebook "Guide IA 2025" est prêt !',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
    read: false,
    action: {
      label: "Télécharger",
      href: "/books",
    },
  },
  {
    id: "3",
    type: "info",
    title: "Crédits utilisés",
    message: "Vous avez utilisé 50 crédits ce mois-ci",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(demoNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "promo":
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "from-green-500/10 to-green-600/10 border-green-500/20";
      case "warning":
        return "from-yellow-500/10 to-yellow-600/10 border-yellow-500/20";
      case "error":
        return "from-red-500/10 to-red-600/10 border-red-500/20";
      case "promo":
        return "from-purple-500/10 to-pink-500/10 border-purple-500/20";
      default:
        return "from-blue-500/10 to-blue-600/10 border-blue-500/20";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}j`;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bouton notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-dark-800/50 text-dark-300 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Panel de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 sm:w-96 bg-dark-900/95 backdrop-blur-xl border border-dark-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-dark-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des notifications */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                    <p className="text-dark-400">Aucune notification</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          "p-4 m-2 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                          getNotificationBgColor(notification.type),
                          !notification.read && "ring-1 ring-primary-500/30"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-white">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className="text-xs text-dark-400 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="text-dark-500 hover:text-dark-300 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-dark-300 mt-1">
                              {notification.message}
                            </p>

                            {notification.action && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 border-primary-500/50 text-primary-400 hover:bg-primary-500 hover:text-white text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href =
                                    notification.action!.href;
                                }}
                              >
                                {notification.action.label}
                                <Zap className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>

                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-dark-800/50 text-center">
                  <button className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
