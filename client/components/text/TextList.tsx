"use client";

import React from "react";
import { TextType } from "../../../shared/types";
import { TextItem } from "./TextItem";

interface TextListProps {
  texts: TextType[];
  onDelete: (textId: string) => void;
  onEdit: (textId: string, data: Partial<TextType>) => void;
  isLoading?: boolean;
}

export const TextList: React.FC<TextListProps> = ({
  texts,
  onDelete,
  onEdit,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (texts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Aucun texte trouvé</div>
        <div className="text-gray-400">
          Créez votre premier texte pour commencer
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {texts.map((text) => (
        <TextItem
          key={text.id}
          text={text}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
