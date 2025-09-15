"use client";

import React, { useState, useCallback } from "react";
import { CommentType, CommentStatus } from "../../../shared/types";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  comments: CommentType[];
  textId: string;
  onDelete: (commentId: string) => void;
  onEdit: (
    commentId: string,
    data: { content: string; status?: CommentStatus }
  ) => void;
  onCreateReply: (parentId: string, data: any) => void;
  isLoading?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  textId,
  onDelete,
  onEdit,
  onCreateReply,
  isLoading = false,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
  }, []);

  const handleCreateReply = useCallback(
    (data: any) => {
      if (replyingTo) {
        onCreateReply(replyingTo, data);
        setReplyingTo(null);
      }
    },
    [replyingTo, onCreateReply]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // ✅ Organiser les commentaires par parent
  const topLevelComments = comments.filter((comment) => !comment.parent_id);
  const replies = comments.filter((comment) => comment.parent_id);

  return (
    <div className="space-y-6">
      {/* Commentaires principaux */}
      {topLevelComments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <CommentItem
            comment={comment}
            onDelete={onDelete}
            onEdit={onEdit}
            onReply={handleReply}
          />

          {/* Réponses à ce commentaire */}
          {replies
            .filter((reply) => reply.parent_id === comment.id)
            .map((reply) => (
              <div
                key={reply.id}
                className="ml-8 border-l-2 border-gray-200 pl-4"
              >
                <CommentItem
                  comment={reply}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </div>
            ))}

          {/* Formulaire de réponse */}
          {replyingTo === comment.id && (
            <div className="ml-8 border-l-2 border-blue-200 pl-4">
              <CommentForm
                textId={textId}
                parentId={comment.id}
                onSubmit={handleCreateReply}
                isLoading={isLoading}
              />
              <button
                onClick={handleCancelReply}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      ))}

      {topLevelComments.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">Aucun commentaire</div>
          <div className="text-gray-400">
            Soyez le premier à commenter ce texte
          </div>
        </div>
      )}
    </div>
  );
};
