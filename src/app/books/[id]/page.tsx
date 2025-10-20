"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const BookDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    // Redirection vers la nouvelle page de détails des jobs
    if (id) {
      router.replace(`/jobs/${id}`);
    } else {
      router.replace("/jobs");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          Redirection vers les détails du livre...
        </p>
      </div>
    </div>
  );
};

export default BookDetailPage;
