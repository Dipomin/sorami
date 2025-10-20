"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
}) => {
  const { unreadCount } = useNotifications();

  return (
    <div className={`relative ${className}`}>
      {/* Icône de cloche */}
      <svg
        className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Badge de compteur */}
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
};

interface NotificationListProps {
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  className = "",
}) => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAsUnread,
    refreshNotifications,
  } = useNotifications();

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          {error}
          <button
            onClick={refreshNotifications}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        Aucune notification
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              !notification.isRead ? "bg-blue-50" : ""
            }`}
            onClick={() => !notification.isRead && markAsRead(notification.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4
                    className={`text-sm font-medium ${
                      !notification.isRead ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>

              <div className="ml-2">
                {notification.type === "BOOK_COMPLETED" && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    ✅ Terminé
                  </span>
                )}
                {notification.type === "BOOK_FAILED" && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    ❌ Échec
                  </span>
                )}
                {notification.type === "BOOK_PROGRESS" && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    🔄 En cours
                  </span>
                )}
              </div>
            </div>

            {notification.metadata?.bookId && (
              <div className="mt-2">
                <a
                  href={`/books/${notification.metadata.bookId}`}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir le livre →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
