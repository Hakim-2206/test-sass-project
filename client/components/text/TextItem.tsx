"use client";

import React, { useState, useCallback } from "react";
import { TextType, TextStatus } from "../../../shared/types";
import {
  RiEditLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiCloseLine,
} from "react-icons/ri";

interface TextItemProps {
  text: TextType;
  onDelete: (textId: string) => void;
  onEdit: (textId: string, data: Partial<TextType>) => void;
}

export const TextItem: React.FC<TextItemProps> = ({
  text,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: text.title,
    content: text.content,
  });

  const handleSave = useCallback(() => {
    onEdit(text.id, editData);
    setIsEditing(false);
  }, [text.id, editData, onEdit]);

  const handleCancel = useCallback(() => {
    setEditData({
      title: text.title,
      content: text.content,
    });
    setIsEditing(false);
  }, [text.title, text.content]);

  const handleDelete = useCallback(() => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce texte ?")) {
      onDelete(text.id);
    }
  }, [text.id, onDelete]);

  const getStatusColor = (status: TextStatus) => {
    switch (status) {
      case TextStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800";
      case TextStatus.PUBLISHED:
        return "bg-green-100 text-green-800";
      case TextStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: TextStatus) => {
    switch (status) {
      case TextStatus.DRAFT:
        return "Brouillon";
      case TextStatus.PUBLISHED:
        return "Publié";
      case TextStatus.ARCHIVED:
        return "Archivé";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <textarea
              value={editData.content}
              onChange={(e) =>
                setEditData({ ...editData, content: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RiSaveLine className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <RiCloseLine className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {text.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  text.status
                )}`}
              >
                {getStatusLabel(text.status)}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Modifier"
              >
                <RiEditLine className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
            {text.content}
          </p>
          <div className="text-sm text-gray-500">
            Créé le {new Date(text.created_at).toLocaleDateString("fr-FR")} à{" "}
            {new Date(text.created_at).toLocaleTimeString("fr-FR")}
            {text.updated_at.getTime() !== text.created_at.getTime() && (
              <span className="ml-2">
                • Modifié le{" "}
                {new Date(text.updated_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
