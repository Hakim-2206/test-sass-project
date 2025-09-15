"use client";

import React, { useState, useCallback } from "react";
import { useComments } from "../hooks/useComments";
import { useTexts } from "../hooks/useTexts";
import { CommentForm } from "../components/comment/CommentForm";
import { CommentThread } from "../components/comment/CommentThread";
import { CreateCommentRequest, CommentStatus } from "../../shared/types";
import { ModuleProps, createModule } from "./core/BaseModule";

const CommentModuleComponent: React.FC<ModuleProps> = ({
  employee,
  onModuleChange,
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const {
    texts,
    isLoading: textsLoading,
    isError: textsError,
    error: textsErrorData,
  } = useTexts();

  const {
    comments,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsErrorData,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
    refresh,
  } = useComments(selectedTextId || undefined);

  const handleCreateComment = useCallback(
    (data: CreateCommentRequest) => {
      if (selectedTextId) {
        createComment({
          ...data,
          text_id: selectedTextId,
        });
      }
    },
    [selectedTextId, createComment]
  );

  const handleUpdateComment = useCallback(
    (commentId: string, data: { content: string; status?: CommentStatus }) => {
      updateComment(commentId, data);
    },
    [updateComment]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      deleteComment(commentId);
    },
    [deleteComment]
  );

  const handleCreateReply = useCallback(
    (parentId: string, data: CreateCommentRequest) => {
      createComment({
        ...data,
        text_id: selectedTextId!,
        parent_id: parentId,
      });
    },
    [selectedTextId, createComment]
  );

  const handleTextSelect = useCallback((textId: string) => {
    setSelectedTextId(textId);
  }, []);

  if (textsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">
            Erreur de chargement des textes
          </h3>
          <p className="text-red-600 text-sm">
            {textsErrorData?.message ||
              "Une erreur est survenue lors du chargement des textes."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Recharger la page
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
            Gestion des Commentaires - {employee.name}
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          Gérez les commentaires sur vos textes
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche - Liste des textes */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Textes disponibles ({texts.length})
                </h2>

                {textsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-16 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : texts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Aucun texte disponible</div>
                    <div className="text-gray-400 text-sm mt-1">
                      Créez d'abord des textes pour pouvoir les commenter
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {texts.map((text) => (
                      <div
                        key={text.id}
                        onClick={() => handleTextSelect(text.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTextId === text.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 truncate">
                          {text.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {text.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              text.status === "published"
                                ? "bg-green-100 text-green-800"
                                : text.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {text.status === "published"
                              ? "Publié"
                              : text.status === "draft"
                              ? "Brouillon"
                              : "Archivé"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(text.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Commentaires */}
            <div className="lg:col-span-2">
              {!selectedTextId ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="text-gray-500 text-lg mb-2">
                    Sélectionnez un texte
                  </div>
                  <div className="text-gray-400">
                    Choisissez un texte dans la liste pour voir et gérer ses
                    commentaires
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Formulaire de création */}
                  <CommentForm
                    textId={selectedTextId}
                    onSubmit={handleCreateComment}
                    isLoading={isCreating}
                  />

                  {/* Liste des commentaires */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Commentaires ({comments.length})
                      </h2>
                      <button
                        onClick={refresh}
                        disabled={commentsLoading}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        {commentsLoading ? "Chargement..." : "Actualiser"}
                      </button>
                    </div>

                    {commentsError ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-red-800 font-medium mb-2">
                          Erreur de chargement
                        </h3>
                        <p className="text-red-600 text-sm">
                          {commentsErrorData?.message ||
                            "Une erreur est survenue lors du chargement des commentaires."}
                        </p>
                      </div>
                    ) : (
                      <CommentThread
                        comments={comments}
                        textId={selectedTextId}
                        onDelete={handleDeleteComment}
                        onEdit={handleUpdateComment}
                        onCreateReply={handleCreateReply}
                        isLoading={commentsLoading || isUpdating || isDeleting}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Export du module avec l'interface standardisée
export default createModule(CommentModuleComponent, "comments");
