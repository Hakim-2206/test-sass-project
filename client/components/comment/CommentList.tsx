"use client";

import React from "react";
import { CommentType } from "../../../shared/types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentType[];
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, data: { content: string; status?: any }) => void;
  onReply?: (commentId: string) => void;
  isLoading?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onDelete,
  onEdit,
  onReply,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">Aucun commentaire</div>
        <div className="text-gray-400">
          Soyez le premier à commenter ce texte
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={onDelete}
          onEdit={onEdit}
          onReply={onReply}
        />
      ))}
    </div>
  );
};
