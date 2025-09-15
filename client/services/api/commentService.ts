import { callSecuredFunction } from "../index";
import {
  CommentType,
  CreateCommentType,
  CommentStatus,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsResponse,
  CommentResponse,
} from "../../../shared/types";

// ✅ Ré-export des types pour compatibilité
export type {
  CommentType,
  CreateCommentType,
  CommentStatus,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsResponse,
  CommentResponse,
};

/**
 * Service de gestion des commentaires côté client
 * ✅ Conforme aux règles Agentova - Méthodes statiques uniquement
 */
export class CommentService {
  /**
   * Créer un nouveau commentaire
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async createComment(
    workspaceId: string,
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    try {
      return await callSecuredFunction<CommentResponse>(
        "createComment",
        workspaceId,
        data
      );
    } catch (error) {
      throw error; // ✅ Rethrow pour gestion niveau hook
    }
  }

  /**
   * Récupérer les commentaires d'un texte
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async getComments(
    workspaceId: string,
    textId: string
  ): Promise<CommentsResponse> {
    try {
      return await callSecuredFunction<CommentsResponse>(
        "getComments",
        workspaceId,
        { text_id: textId }
      );
    } catch (error) {
      throw error; // ✅ Rethrow pour gestion niveau hook
    }
  }

  /**
   * Mettre à jour un commentaire
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async updateComment(
    workspaceId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> {
    try {
      return await callSecuredFunction<CommentResponse>(
        "updateComment",
        workspaceId,
        {
          comment_id: commentId,
          ...data,
        }
      );
    } catch (error) {
      throw error; // ✅ Rethrow pour gestion niveau hook
    }
  }

  /**
   * Supprimer un commentaire
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async deleteComment(
    workspaceId: string,
    commentId: string
  ): Promise<{ deleted: boolean }> {
    try {
      return await callSecuredFunction<{ deleted: boolean }>(
        "deleteComment",
        workspaceId,
        { comment_id: commentId }
      );
    } catch (error) {
      throw error; // ✅ Rethrow pour gestion niveau hook
    }
  }
}
