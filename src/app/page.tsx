import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenue sur <span className="text-blue-600">sorami</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Créez des livres complets en quelques minutes grâce à l'intelligence
            artificielle. Définissez simplement votre sujet et votre objectif,
            l'IA s'occupe du reste.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Créer mon premier livre
            </Link>
            <Link
              href="/jobs"
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-lg font-medium"
            >
              Voir mes livres
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">IA Avancée</h3>
            <p className="text-gray-600">
              Notre IA génère un contenu de qualité adapté à vos besoins
              spécifiques
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Rapide</h3>
            <p className="text-gray-600">
              Obtenez votre livre complet en quelques minutes seulement
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Personnalisé</h3>
            <p className="text-gray-600">
              Chaque livre est unique et adapté à votre sujet et objectif
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Définissez votre projet</h4>
              <p className="text-sm text-gray-600">
                Titre, sujet et objectif de votre livre
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">L'IA génère le plan</h4>
              <p className="text-sm text-gray-600">
                Création automatique de la structure
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Rédaction des chapitres</h4>
              <p className="text-sm text-gray-600">
                Contenu détaillé pour chaque section
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Téléchargez votre livre</h4>
              <p className="text-sm text-gray-600">
                Format Markdown prêt à utiliser
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-gray-600 mb-6">
            Rejoignez des milliers d'auteurs qui utilisent sorami pour créer
            leurs livres
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Commencer maintenant →
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
