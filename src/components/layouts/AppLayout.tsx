"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

// Pages qui n'ont pas besoin de navigation
const NO_NAVIGATION_PAGES = [
  "/sign-in",
  "/sign-up",
  "/",
  "/pricing",
  "/legal",
  "/privacy",
  "/terms",
];

// Pages qui nécessitent une navigation (pour les utilisateurs connectés)
const NAVIGATION_PAGES = [
  "/dashboard",
  "/books",
  "/books-modern",
  "/blog",
  "/create",
  "/jobs",
  "/generate-images",
  "/generate-videos",
  "/profile",
  "/settings",
  "/admin",
];

export default function AppLayout({
  children,
  showNavigation,
}: AppLayoutProps) {
  const pathname = usePathname();

  // Détermination automatique si la navigation doit être affichée
  const shouldShowNavigation =
    showNavigation !== undefined
      ? showNavigation
      : NAVIGATION_PAGES.some((page) => pathname.startsWith(page)) &&
        !NO_NAVIGATION_PAGES.includes(pathname);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {shouldShowNavigation && <Navigation />}
      <main className={shouldShowNavigation ? "pt-16" : ""}>{children}</main>
    </div>
  );
}
