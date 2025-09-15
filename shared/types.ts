// ========================== ENUMS OBLIGATOIRES ==============================

// ✅ Enum obligatoire pour traçabilité (règle Agentova)
export enum WorkspaceRoles {
  ADMIN = "admin",
  EDITOR = "editor",
}

export type WorkspaceRole = WorkspaceRoles;

export const ROLE_PRIORITY: Record<WorkspaceRole, number> = {
  [WorkspaceRoles.ADMIN]: 0, // le plus fort
  [WorkspaceRoles.EDITOR]: 1, // moins fort
};

// ✅ Alias pour compatibilité (à supprimer progressivement)
export const WORKSPACE_ROLES = WorkspaceRoles;

// ========================== ENUMS MÉTIER ==============================

// ✅ Enum pour statuts des textes
export enum TextStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// ✅ Enum pour types de messages
export enum MessageType {
  TEXT = "text",
  FILE = "file",
  IMAGE = "image",
}

// ✅ Enum pour statuts des commentaires
export enum CommentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// ========================== TYPES ESSENTIELS POUR LE TEST ==============================

export interface TextType {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  status: TextStatus; // ✅ Utilisation de l'enum
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTextType {
  title: string;
  content: string;
  status?: TextStatus; // ✅ Optionnel, défaut DRAFT
  created_by: string;
}

// ✅ Types pour les requêtes client
export interface CreateTextRequest {
  title?: string;
  content: string;
  status?: TextStatus;
}

// ✅ Types pour les réponses API
export interface TextsResponse {
  texts: TextType[];
}

export interface TextResponse {
  text: TextType;
}

// ========================== TYPES COMMENTAIRES ==============================

export interface CommentType {
  id: string;
  workspace_id: string;
  text_id: string; // Relation avec le texte
  content: string;
  status: CommentStatus; // ✅ Utilisation de l'enum
  author_id: string;
  author_name: string; // Pour affichage
  created_at: Date;
  updated_at: Date;
  parent_id?: string; // Pour les réponses (futur)
}

export interface CreateCommentType {
  text_id: string;
  content: string;
  status?: CommentStatus; // Optionnel, défaut DRAFT
  author_id: string;
  author_name: string;
  parent_id?: string; // Pour les réponses
}

// ✅ Types pour les requêtes client
export interface CreateCommentRequest {
  text_id: string;
  content: string;
  status?: CommentStatus;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
  status?: CommentStatus;
}

// ✅ Types pour les réponses API commentaires
export interface CommentsResponse {
  comments: CommentType[];
}

export interface CommentResponse {
  comment: CommentType;
}

// ========================== TYPES MESSAGES (pour le chat) ==============================

export interface MessageFileInline {
  inline_data: {
    display_name?: string;
    mime_type: string;
    data: string;
  };
}

export type MessageFile = MessageFileInline;

export interface MessageText {
  text: string;
}

// ========================== TYPES WORKSPACE ==============================

export interface Workspace {
  id: string;
  name: string;
  color: string;
  hexColor: string;
}

// ========================== TYPES SESSION (pour le chat) ==============================

export interface Session {
  id: string;
  workspace_id: string;
  app_name: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

// ✅ Enum pour auteurs de messages
export enum MessageAuthor {
  USER = "user",
  AGENT = "agent",
}

export interface Message {
  id: string;
  session_id: string;
  author: MessageAuthor; // ✅ Utilisation de l'enum
  text: string;
  timestamp: Date;
  partial?: boolean;
  isError?: boolean;
}

// ========================== TYPES EMPLOYEE (pour les agents IA) ==============================

export interface Employee {
  id: string;
  name: string;
  hexColor: string;
  description: string;
}
