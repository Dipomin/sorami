"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

// Pages qui n'ont pas besoin de navigation (pages d'authentification uniquement)
const NO_NAVIGATION_PAGES = ["/sign-in", "/sign-up"];

export default function AppLayout({
  children,
  showNavigation,
}: AppLayoutProps) {
  const pathname = usePathname();

  // Détermination automatique si la navigation doit être affichée
  // La navigation s'affiche partout SAUF sur les pages d'authentification
  const shouldShowNavigation =
    showNavigation !== undefined
      ? showNavigation
      : !NO_NAVIGATION_PAGES.some((page) => pathname.startsWith(page));

  return (
    <div className="min-h-screen bg-gradient-dark">
      {shouldShowNavigation && <Navigation />}
      <main className={shouldShowNavigation ? "pt-16" : ""}>{children}</main>
    </div>
  );
}
