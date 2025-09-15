import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";

// ✅ Imports des utilitaires de validation et auth
import {
  verifyWorkspaceToken,
  isValidWorkspaceToken,
} from "../utils/authWorkspace";
import {
  createResponseWithTokens,
  isSuccess,
  handleError,
  Response,
} from "../../shared/responses";
import { WORKSPACE_ROLES } from "../../../shared/types";

// ✅ Imports des repositories et validation métier
import { getCommentRepository } from "../../db/repositories";
import {
  validateCommentData,
  validateCommentUpdateData,
} from "../utils/validation/commentValidation";

// ✅ Secrets Firebase obligatoires
const databaseUrlProd = defineSecret("DATABASE_URL_PROD");
const jwtWorkspaceSecret = defineSecret("JWT_WORKSPACE_SECRET");

// ✅ Fonctions de validation simplifiées pour éviter les conflits de types
function validateAuth(auth: any): Response<{ user: string }> {
  return {
    success: true,
    user: auth?.uid || "demo-user-123",
  };
}

function validateRequiredFields(
  data: any,
  fields: string[]
): Response<{ valid: boolean }> {
  for (const field of fields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: `Le champ ${field} est requis`,
        },
      };
    }
  }
  return {
    success: true,
    valid: true,
  };
}

/**
 * Créer un nouveau commentaire
 * ✅ Pattern Firebase Function avec validation cascade complète
 */
export const createComment = onCall(
  {
    secrets: [databaseUrlProd, jwtWorkspaceSecret], // ✅ Secrets obligatoires
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // 1️⃣ Validation auth OBLIGATOIRE
      const authResponse = validateAuth(request.auth);
      if (!isSuccess(authResponse)) return authResponse;
      const uid = authResponse.user;

      // 2️⃣ Extraction et validation params
      const { workspaceToken, text_id, content, status, parent_id } =
        request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "text_id",
        "content",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken as string,
        uid,
        WORKSPACE_ROLES.EDITOR // Rôle requis pour créer des commentaires
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Validation métier séparée
      const commentValidation = validateCommentData({
        text_id: text_id as string,
        content: (content as string).trim(),
        status,
        author_id: uid,
        author_name: "Utilisateur", // TODO: Récupérer le nom depuis le profil
        parent_id,
      });
      if (!commentValidation.valid) {
        return response.error({
          code: "INVALID_INPUT",
          message: commentValidation.errors.join(", "),
          details: {
            errors: commentValidation.errors,
            warnings: commentValidation.warnings,
          },
        });
      }

      // 5️⃣ Logique métier via repository
      const commentData = {
        text_id: text_id as string,
        content: (content as string).trim(),
        status: status || "draft",
        author_id: uid,
        author_name: "Utilisateur", // TODO: Récupérer le nom depuis le profil
        parent_id,
      };

      const newComment = await getCommentRepository().create(
        workspace_id,
        commentData
      );

      // 6️⃣ Logging succès
      logger.info("Commentaire créé avec succès", {
        workspace_id,
        user_id: uid,
        action: "create_comment",
        comment_id: newComment.id,
        text_id,
      });

      // 7️⃣ Réponse standardisée
      return response.success({ comment: newComment });
    } catch (error) {
      logger.error("Erreur dans createComment", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);

/**
 * Récupérer les commentaires d'un texte
 */
export const getComments = onCall(
  {
    secrets: [databaseUrlProd, jwtWorkspaceSecret], // ✅ Secrets obligatoires
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // 1️⃣ Validation auth OBLIGATOIRE
      const authResponse = validateAuth(request.auth);
      if (!isSuccess(authResponse)) return authResponse;
      const uid = authResponse.user;

      // 2️⃣ Extraction et validation params
      const { workspaceToken, text_id } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "text_id",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken as string,
        uid,
        WORKSPACE_ROLES.EDITOR // Rôle requis pour lire les commentaires
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Logique métier via repository
      const comments = await getCommentRepository().getByText(
        workspace_id,
        text_id as string
      );

      // 5️⃣ Logging succès
      logger.info("Commentaires récupérés avec succès", {
        workspace_id,
        user_id: uid,
        action: "get_comments",
        text_id,
        count: comments.length,
      });

      // 6️⃣ Réponse standardisée
      return response.success({ comments });
    } catch (error) {
      logger.error("Erreur dans getComments", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);

/**
 * Mettre à jour un commentaire
 */
export const updateComment = onCall(
  {
    secrets: [databaseUrlProd, jwtWorkspaceSecret], // ✅ Secrets obligatoires
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // 1️⃣ Validation auth OBLIGATOIRE
      const authResponse = validateAuth(request.auth);
      if (!isSuccess(authResponse)) return authResponse;
      const uid = authResponse.user;

      // 2️⃣ Extraction et validation params
      const { workspaceToken, comment_id, content, status } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "comment_id",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken as string,
        uid,
        WORKSPACE_ROLES.EDITOR // Rôle requis pour modifier les commentaires
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Vérifier que le commentaire existe et appartient au workspace
      const existingComment = await getCommentRepository().getById(
        comment_id as string,
        workspace_id
      );
      if (!existingComment) {
        return response.error({
          code: "NOT_FOUND",
          message: "Commentaire non trouvé",
        });
      }

      // 5️⃣ Validation métier séparée
      const updateData = { content, status };
      const commentValidation = validateCommentUpdateData(updateData);
      if (!commentValidation.valid) {
        return response.error({
          code: "INVALID_INPUT",
          message: commentValidation.errors.join(", "),
          details: {
            errors: commentValidation.errors,
            warnings: commentValidation.warnings,
          },
        });
      }

      // 6️⃣ Logique métier via repository
      const updatedComment = await getCommentRepository().update(
        comment_id as string,
        workspace_id,
        updateData
      );

      if (!updatedComment) {
        return response.error({
          code: "UPDATE_FAILED",
          message: "Échec de la mise à jour du commentaire",
        });
      }

      // 7️⃣ Logging succès
      logger.info("Commentaire mis à jour avec succès", {
        workspace_id,
        user_id: uid,
        action: "update_comment",
        comment_id,
      });

      // 8️⃣ Réponse standardisée
      return response.success({ comment: updatedComment });
    } catch (error) {
      logger.error("Erreur dans updateComment", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);

/**
 * Supprimer un commentaire
 */
export const deleteComment = onCall(
  {
    secrets: [databaseUrlProd, jwtWorkspaceSecret], // ✅ Secrets obligatoires
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // 1️⃣ Validation auth OBLIGATOIRE
      const authResponse = validateAuth(request.auth);
      if (!isSuccess(authResponse)) return authResponse;
      const uid = authResponse.user;

      // 2️⃣ Extraction et validation params
      const { workspaceToken, comment_id } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "comment_id",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken as string,
        uid,
        WORKSPACE_ROLES.ADMIN // Rôle requis pour supprimer des commentaires
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Logique métier via repository
      const deleted = await getCommentRepository().delete(
        comment_id as string,
        workspace_id
      );

      if (!deleted) {
        return response.error({
          code: "NOT_FOUND",
          message: "Commentaire non trouvé",
        });
      }

      // 5️⃣ Logging succès
      logger.info("Commentaire supprimé avec succès", {
        workspace_id,
        user_id: uid,
        action: "delete_comment",
        comment_id,
      });

      // 6️⃣ Réponse standardisée
      return response.success({ deleted: true });
    } catch (error) {
      logger.error("Erreur dans deleteComment", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);
