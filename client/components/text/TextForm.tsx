"use client";

import React, { useState, useCallback } from "react";
import { CreateTextRequest, TextStatus } from "../../../shared/types";
import { RiAddLine } from "react-icons/ri";

interface TextFormProps {
  onSubmit: (data: CreateTextRequest) => void;
  isLoading?: boolean;
}

export const TextForm: React.FC<TextFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateTextRequest>({
    title: "",
    content: "",
    status: TextStatus.DRAFT,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.content.trim()) {
        onSubmit(formData);
        setFormData({
          title: "",
          content: "",
          status: TextStatus.DRAFT,
        });
      }
    },
    [formData, onSubmit]
  );

  const handleInputChange = useCallback(
    (field: keyof CreateTextRequest, value: string | TextStatus) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Créer un nouveau texte
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre (optionnel)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Titre du texte..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Contenu du texte..."
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              handleInputChange("status", e.target.value as TextStatus)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TextStatus.DRAFT}>Brouillon</option>
            <option value={TextStatus.PUBLISHED}>Publié</option>
            <option value={TextStatus.ARCHIVED}>Archivé</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.content.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          {isLoading ? "Création..." : "Créer le texte"}
        </button>
      </form>
    </div>
  );
};
