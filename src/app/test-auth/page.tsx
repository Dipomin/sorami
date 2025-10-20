import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test d'Authentification</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Informations utilisateur</h2>

        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Clerk ID:</strong> {user.clerkId}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Nom:</strong> {user.name}
          </p>
          <p>
            <strong>Prénom:</strong> {user.firstName}
          </p>
          <p>
            <strong>Nom de famille:</strong> {user.lastName}
          </p>
          <p>
            <strong>Rôle:</strong> {user.role}
          </p>
          <p>
            <strong>Statut:</strong> {user.status}
          </p>
          <p>
            <strong>Email vérifié:</strong>{" "}
            {user.isEmailVerified ? "Oui" : "Non"}
          </p>
          <p>
            <strong>Créé le:</strong>{" "}
            {new Date(user.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>

        {user.organizationMemberships.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Organisations</h3>
            <ul className="space-y-1">
              {user.organizationMemberships.map((membership) => (
                <li key={membership.id} className="text-sm">
                  <strong>{membership.organization.name}</strong> -{" "}
                  {membership.role}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6">
        <a
          href="/api/generate"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tester l'API Generate
        </a>
      </div>
    </div>
  );
}
