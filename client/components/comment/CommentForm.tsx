"use client";

import React, { useState, useCallback } from "react";
import { CreateCommentRequest, CommentStatus } from "../../../shared/types";
import { RiAddLine } from "react-icons/ri";

interface CommentFormProps {
  textId: string;
  onSubmit: (data: CreateCommentRequest) => void;
  isLoading?: boolean;
  parentId?: string; // Pour les réponses
}

export const CommentForm: React.FC<CommentFormProps> = ({
  textId,
  onSubmit,
  isLoading = false,
  parentId,
}) => {
  const [formData, setFormData] = useState<CreateCommentRequest>({
    text_id: textId,
    content: "",
    status: CommentStatus.DRAFT,
    parent_id: parentId,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.content.trim()) {
        onSubmit(formData);
        setFormData({
          text_id: textId,
          content: "",
          status: CommentStatus.DRAFT,
          parent_id: parentId,
        });
      }
    },
    [formData, onSubmit, textId, parentId]
  );

  const handleInputChange = useCallback(
    (field: keyof CreateCommentRequest, value: string | CommentStatus) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {parentId ? "Répondre au commentaire" : "Ajouter un commentaire"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commentaire *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder={
              parentId
                ? "Votre réponse..."
                : "Partagez votre avis sur ce texte..."
            }
            rows={4}
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
              handleInputChange("status", e.target.value as CommentStatus)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CommentStatus.DRAFT}>Brouillon</option>
            <option value={CommentStatus.PUBLISHED}>Publié</option>
            <option value={CommentStatus.ARCHIVED}>Archivé</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          {isLoading
            ? "Envoi..."
            : parentId
            ? "Répondre"
            : "Ajouter le commentaire"}
        </button>
      </form>
    </div>
  );
};
