import React, { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = "",
  showNavigation = true,
}) => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {showNavigation && <Navigation />}

      <main
        className={cn(
          "min-h-screen",
          showNavigation ? "pt-16" : "pt-0", // Compenser la navigation fixe
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
