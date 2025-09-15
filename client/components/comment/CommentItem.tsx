"use client";

import React, { useState, useCallback } from "react";
import { CommentType, CommentStatus } from "../../../shared/types";
import {
  RiEditLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiCloseLine,
  RiReplyLine,
} from "react-icons/ri";

interface CommentItemProps {
  comment: CommentType;
  onDelete: (commentId: string) => void;
  onEdit: (
    commentId: string,
    data: { content: string; status?: CommentStatus }
  ) => void;
  onReply?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  onEdit,
  onReply,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    content: comment.content,
    status: comment.status,
  });

  const handleSave = useCallback(() => {
    onEdit(comment.id, editData);
    setIsEditing(false);
  }, [comment.id, editData, onEdit]);

  const handleCancel = useCallback(() => {
    setEditData({
      content: comment.content,
      status: comment.status,
    });
    setIsEditing(false);
  }, [comment.content, comment.status]);

  const handleDelete = useCallback(() => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      onDelete(comment.id);
    }
  }, [comment.id, onDelete]);

  const handleReply = useCallback(() => {
    if (onReply) {
      onReply(comment.id);
    }
  }, [comment.id, onReply]);

  const getStatusColor = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800";
      case CommentStatus.PUBLISHED:
        return "bg-green-100 text-green-800";
      case CommentStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.DRAFT:
        return "Brouillon";
      case CommentStatus.PUBLISHED:
        return "Publié";
      case CommentStatus.ARCHIVED:
        return "Archivé";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={editData.status}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  status: e.target.value as CommentStatus,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={CommentStatus.DRAFT}>Brouillon</option>
              <option value={CommentStatus.PUBLISHED}>Publié</option>
              <option value={CommentStatus.ARCHIVED}>Archivé</option>
            </select>
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {comment.author_name}
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      comment.status
                    )}`}
                  >
                    {getStatusLabel(comment.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(comment.created_at).toLocaleTimeString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onReply && (
                <button
                  onClick={handleReply}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Répondre"
                >
                  <RiReplyLine className="w-4 h-4" />
                </button>
              )}
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
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          {comment.updated_at.getTime() !== comment.created_at.getTime() && (
            <div className="text-xs text-gray-500 mt-2">
              Modifié le{" "}
              {new Date(comment.updated_at).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
