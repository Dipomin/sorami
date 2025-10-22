import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user.firstName || user.emailAddresses[0]?.emailAddress}!
        </h1>
        <p className="text-gray-600">
          Gérez vos livres et découvrez les fonctionnalités d'sorami
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Créer un nouveau livre */}
        <Link
          href="/create"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 ml-3">
              Créer un livre
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Commencez à créer votre nouveau livre avec l'aide de l'intelligence
            artificielle
          </p>
          <span className="text-blue-600 font-medium">Commencer →</span>
        </Link>

        {/* Mes livres */}
        <Link
          href="/jobs"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 ml-3">
              Mes livres
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Consultez et gérez tous vos livres en cours de création ou terminés
          </p>
          <span className="text-green-600 font-medium">Voir mes livres →</span>
        </Link>

        {/* Génération d'images */}
        <Link
          href="/generate-images"
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md border border-purple-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 ml-3">
              Générer des images
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Créez des images uniques avec l'IA Gemini 2.0 à partir de texte ou
            d'images
          </p>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
            Créer des images →
          </span>
        </Link>

        {/* Génération de vidéos */}
        <Link
          href="/generate-videos"
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md border border-blue-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 ml-3">
              Générer des vidéos
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Créez des vidéos cinématographiques avec Gemini Veo 2.0 à partir de
            descriptions
          </p>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-medium">
            Créer des vidéos →
          </span>
        </Link>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 ml-3">
              Statistiques
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Livres créés:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En cours:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Terminés:</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aide et ressources */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Aide et ressources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🚀 Premiers pas
            </h3>
            <p className="text-gray-600 mb-4">
              Découvrez comment créer votre premier livre avec sorami en
              quelques étapes simples.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">
              Voir le guide →
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💡 Conseils d'écriture
            </h3>
            <p className="text-gray-600 mb-4">
              Obtenez des conseils pour optimiser vos prompts et créer du
              contenu de qualité.
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">
              Lire les conseils →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
