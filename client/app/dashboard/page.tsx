"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AI_EMPLOYEES } from "../../data/ai-employees";
import { useTexts } from "../../hooks/useTexts";
import { RiAddLine, RiDeleteBinLine, RiEditLine } from "react-icons/ri";

export default function DashboardPage() {
  const router = useRouter();
  const { texts, createText, deleteText, isLoading, isCreating, isDeleting } =
    useTexts();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim()) {
      createText({
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
      });
      setFormData({ title: "", content: "" });
      setShowForm(false);
    }
  };

  const handleDelete = (textId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce texte ?")) {
      deleteText(textId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard - Test Technique
          </h1>
          <p className="text-gray-600">
            Gestion des textes avec architecture du projet (Services + Hooks +
            Composants)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Agents IA */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Agents IA Disponibles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {AI_EMPLOYEES.map((employee) => (
                <div
                  key={employee.name}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity p-4 rounded-lg border border-gray-200 hover:border-gray-300"
                  onClick={() =>
                    router.push(`/dashboard/employees/${employee.id}/chat`)
                  }
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2"
                    style={{ backgroundColor: employee.hexColor }}
                  >
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {employee.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Gestion des Textes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Textes
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isCreating}
              >
                <RiAddLine className="w-4 h-4" />
                Nouveau texte
              </button>
            </div>

            {/* Formulaire de création */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du texte..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Contenu du texte..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!formData.content.trim() || isCreating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Création..." : "Créer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des textes */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des textes...</p>
                </div>
              ) : texts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun texte enregistré.</p>
                  <p className="text-sm">
                    Créez votre premier texte pour commencer !
                  </p>
                </div>
              ) : (
                texts.map((text) => (
                  <div
                    key={text.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {text.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(text.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Supprimer"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{text.content}</p>
                    <p className="text-xs text-gray-400">
                      Créé le{" "}
                      {new Date(text.created_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(text.created_at).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
