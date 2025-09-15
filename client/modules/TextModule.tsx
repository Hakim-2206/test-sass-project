"use client";

import React, { useCallback } from "react";
import { useTexts } from "../hooks/useTexts";
import { TextList } from "../components/text/TextList";
import { TextForm } from "../components/text/TextForm";
import { CreateTextRequest } from "../../shared/types";
import { ModuleProps, createModule } from "./core/BaseModule";

const TextModuleComponent: React.FC<ModuleProps> = ({
  employee,
  onModuleChange,
}) => {
  const {
    texts,
    isLoading,
    isError,
    error,
    createText,
    updateText,
    deleteText,
    isCreating,
    isUpdating,
    isDeleting,
    refresh,
  } = useTexts();

  const handleCreateText = useCallback(
    (data: CreateTextRequest) => {
      createText(data);
    },
    [createText]
  );

  const handleUpdateText = useCallback(
    (textId: string, data: any) => {
      updateText(textId, data);
    },
    [updateText]
  );

  const handleDeleteText = useCallback(
    (textId: string) => {
      deleteText(textId);
    },
    [deleteText]
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-600 text-sm">
            {error?.message ||
              "Une erreur est survenue lors du chargement des textes."}
          </p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: employee.hexColor }}
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Textes - {employee.name}
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          Créez et gérez vos textes dans ce workspace
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Formulaire de création */}
          <TextForm onSubmit={handleCreateText} isLoading={isCreating} />

          {/* Liste des textes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Textes existants ({texts.length})
              </h2>
              <button
                onClick={refresh}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Chargement..." : "Actualiser"}
              </button>
            </div>

            <TextList
              texts={texts}
              onDelete={handleDeleteText}
              onEdit={handleUpdateText}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Export du module avec l'interface standardisée
export default createModule(TextModuleComponent, "texts");
