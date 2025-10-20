import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationBell, NotificationList } from "@/components/Notifications";

export default async function TestWebhookPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Test du Webhook de Complétion de Livre
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <NotificationBell />
          </div>
          <NotificationList />
        </div>

        {/* Section Test Webhook */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Tester le Webhook</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du Webhook
              </label>
              <input
                type="text"
                defaultValue="/api/webhooks/book-completion"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID (pour test)
              </label>
              <input
                type="text"
                value={user.id}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">
                Exemple de payload JSON :
              </h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    jobId: "job_123",
                    userId: user.id,
                    title: "Guide de l'Intelligence Artificielle",
                    description: "Un livre complet sur l'IA",
                    chapters: [
                      {
                        title: "Introduction",
                        content: "Contenu du chapitre...",
                        order: 1,
                      },
                    ],
                    status: "completed",
                    metadata: {
                      topic: "IA",
                      goal: "Expliquer l'IA",
                      totalChapters: 3,
                      generationTime: 120,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Pour tester :</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Copiez l'URL du webhook</li>
                <li>
                  Utilisez curl ou Postman pour envoyer un POST avec le payload
                  JSON
                </li>
                <li>Vérifiez que la notification apparaît ci-dessus</li>
                <li>Vérifiez que le livre est créé dans la base de données</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Commande curl de test :</strong>
              </p>
              <code className="text-xs block mt-1 break-all">
                {`curl -X POST http://localhost:3000/api/webhooks/book-completion \\
  -H "Content-Type: application/json" \\
  -H "Origin: http://localhost:9006" \\
  -d '${JSON.stringify({
    jobId: "test_job_123",
    userId: user.id,
    title: "Livre de Test",
    status: "completed",
    chapters: [{ title: "Chapitre 1", content: "Contenu...", order: 1 }],
  })}'`}
              </code>
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
        // Rafraîchir automatiquement les notifications toutes les 10 secondes
        setInterval(() => {
          window.location.reload();
        }, 10000);
      `,
        }}
      />
    </div>
  );
}
