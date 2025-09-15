"use client";

import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import { CommentStatus } from "../../../shared/types";
import {
  RiMessage3Line,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

interface TextWithCommentsProps {
  text: {
    id: string;
    title?: string;
    content: string;
    created_at: Date;
  };
  onDelete: (textId: string) => void;
  isDeleting: boolean;
}

export const TextWithComments: React.FC<TextWithCommentsProps> = ({
  text,
  onDelete,
  isDeleting,
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState({ content: "" });
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const {
    comments,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting: isDeletingComment,
    isLoading,
  } = useComments(text.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentData.content.trim()) {
      createComment({
        text_id: text.id,
        content: commentData.content.trim(),
        status: CommentStatus.PUBLISHED,
      });
      setCommentData({ content: "" });
      setShowCommentForm(false);
    }
  };

  const handleCommentCancel = () => {
    setCommentData({ content: "" });
    setShowCommentForm(false);
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      updateComment(commentId, { content: editContent.trim() });
      setEditingComment(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">
          {text.title || "Sans titre"}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Commenter"
          >
            <RiMessage3Line className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(text.id)}
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
        Créé le {new Date(text.created_at).toLocaleDateString("fr-FR")} à{" "}
        {new Date(text.created_at).toLocaleTimeString("fr-FR")}
      </p>

      {/* Formulaire de commentaire rapide */}
      {showCommentForm && (
        <form
          onSubmit={handleCommentSubmit}
          className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajouter un commentaire
            </label>
            <textarea
              value={commentData.content}
              onChange={(e) =>
                setCommentData({ ...commentData, content: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              placeholder="Votre commentaire..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!commentData.content.trim() || isCreating}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating && <RiLoader4Line className="w-3 h-3 animate-spin" />}
              {isCreating ? "Publication..." : "Commenter"}
            </button>
            <button
              type="button"
              onClick={handleCommentCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Affichage des commentaires existants */}
      {isLoading ? (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-center py-4">
            <RiLoader4Line className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">
              Chargement des commentaires...
            </span>
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Commentaires ({comments.length})
          </h4>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                {editingComment === comment.id ? (
                  // Mode édition
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editContent.trim() || isUpdating}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isUpdating ? (
                          <RiLoader4Line className="w-3 h-3 animate-spin" />
                        ) : (
                          <RiCheckLine className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
                      >
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-800">{comment.content}</p>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() =>
                            handleEditComment(comment.id, comment.content)
                          }
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Modifier"
                        >
                          <RiEditLine className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isDeletingComment}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title={
                            isDeletingComment ? "Suppression..." : "Supprimer"
                          }
                        >
                          {isDeletingComment ? (
                            <RiLoader4Line className="w-3 h-3 animate-spin" />
                          ) : (
                            <RiDeleteBinLine className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Par {comment.author_name}</span>
                      <span>
                        {new Date(comment.created_at).toLocaleDateString(
                          "fr-FR"
                        )}{" "}
                        à{" "}
                        {new Date(comment.created_at).toLocaleTimeString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
