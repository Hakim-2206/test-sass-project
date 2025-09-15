"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test SaaS Project
          </h1>
          <p className="text-gray-600 mb-8">
            Application de test avec architecture Agentova
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Accéder au Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
