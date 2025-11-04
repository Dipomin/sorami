"use client";

import React, { useState } from "react";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import { S3Image, BlogCoverImage } from "@/components/ui/S3Image";

export default function TestS3Page() {
  const [testKey, setTestKey] = useState("blog/images/test.jpg");

  const { presignedUrl, isLoading, error } = usePresignedUrl(testKey);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Test URLs Présignées S3
        </h1>

        {/* Test Input */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <label className="block text-white mb-2">Clé S3 à tester :</label>
          <input
            type="text"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            className="w-full p-3 bg-slate-700 text-white rounded"
            placeholder="blog/images/exemple.jpg"
          />
        </div>

        {/* Hook Results */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Résultats du Hook
          </h2>
          <div className="text-white">
            <p>
              <strong>Chargement :</strong> {isLoading ? "Oui" : "Non"}
            </p>
            <p>
              <strong>Erreur :</strong> {error || "Aucune"}
            </p>
            <p>
              <strong>URL :</strong>{" "}
              {presignedUrl ? (
                <a
                  href={presignedUrl}
                  target="_blank"
                  className="text-blue-400 break-all"
                >
                  {presignedUrl}
                </a>
              ) : (
                "Aucune"
              )}
            </p>
          </div>
        </div>

        {/* S3Image Component Test */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Test Composant S3Image
          </h2>
          <div className="w-64 h-64 border border-slate-600 rounded">
            <S3Image
              s3Key={testKey}
              alt="Test Image"
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>

        {/* BlogCoverImage Component Test */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">
            Test Composant BlogCoverImage
          </h2>
          <div className="w-64 h-64 border border-slate-600 rounded">
            <BlogCoverImage
              s3Key={testKey}
              alt="Test Blog Cover"
              className="w-full h-full rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
