import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { dark } from "@clerk/themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sorami - Plateforme IA Tout-en-Un",
  description:
    "Créez des images, vidéos, articles de blog et ebooks avec l'intelligence artificielle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0f172a",
          colorText: "#f8fafc",
          colorInputBackground: "#1e293b",
          colorInputText: "#f8fafc",
          borderRadius: "1rem",
        },
        elements: {
          card: "bg-dark-900 border-dark-800",
          headerTitle: "text-white font-display",
          headerSubtitle: "text-dark-300",
          socialButtonsBlockButton: "border-dark-700 hover:border-primary-500",
          formButtonPrimary: "bg-gradient-violet hover:shadow-glow",
          footerActionLink: "text-primary-400 hover:text-primary-300",
        },
      }}
    >
      <html lang="fr" className="dark">
        <body
          className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-gradient-dark text-white`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
