import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sorami - Rédacteur de livres assisté par IA",
  description:
    "Créez et gérez des livres numériques avec l'intelligence artificielle",
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
        variables: {
          colorPrimary: "#3b82f6",
          colorText: "#1f2937",
        },
      }}
    >
      <html lang="fr">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white p-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link
                  href="/"
                  className="text-2xl font-bold hover:text-blue-300"
                >
                  Sorami
                </Link>
                <nav className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="hover:text-blue-300 transition-colors"
                  >
                    Accueil
                  </Link>
                  <SignedIn>
                    <Link
                      href="/create"
                      className="hover:text-blue-300 transition-colors"
                    >
                      Créer un livre
                    </Link>
                    <Link
                      href="/jobs"
                      className="hover:text-blue-300 transition-colors"
                    >
                      Mes livres
                    </Link>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                        },
                      }}
                    />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                        Se connecter
                      </button>
                    </SignInButton>
                  </SignedOut>
                </nav>
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-800 text-white p-4 text-center">
              <div className="max-w-6xl mx-auto">
                <p>
                  &copy; {new Date().getFullYear()} Sorami. Tous droits réservés.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Créez des livres avec l'intelligence artificielle
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
