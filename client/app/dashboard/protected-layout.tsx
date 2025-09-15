"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";

// ========================== INTERFACES ==========================

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// ========================== COMPOSANT ==========================

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isInitializing } = useAuth();

  // ✅ Affichage de chargement pendant l'initialisation
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirection si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // ✅ Affichage du contenu protégé
  return <>{children}</>;
}
