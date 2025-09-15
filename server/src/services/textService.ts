import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import {
  validateAuth,
  verifyWorkspaceToken,
  isValidWorkspaceToken,
} from "../utils/authWorkspace.js";
import {
  validateRequiredFields,
  isSuccess,
  handleError,
} from "../utils/validation.js";
import { createResponseWithTokens } from "../../shared/responses.js";
import { getTextRepository } from "../../db/repositories/index.js";
import { WORKSPACE_ROLES } from "../../../shared/types.js";
import { validateTextData } from "../utils/validation/textValidation.js";
import { databaseUrlProd, jwtWorkspaceSecret } from "../main.js";

/**
 * Service de gestion des textes
 * 🔧 VERSION DEMO - Service de test pour enregistrer et récupérer des textes
 */

/**
 * Créer un nouveau texte
 */
export const createText = onCall(
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
      const { workspaceToken, content, title } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "content",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken,
        uid,
        WORKSPACE_ROLES.EDITOR // Rôle requis pour créer des textes
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Validation métier séparée
      const textValidation = validateTextData({
        title: title?.trim(),
        content: content.trim(),
        created_by: uid,
      });
      if (!textValidation.valid) {
        return response.error({
          code: "INVALID_INPUT",
          message: textValidation.errors.join(", "),
          details: {
            errors: textValidation.errors,
            warnings: textValidation.warnings,
          },
        });
      }

      // 5️⃣ Logique métier via repository
      const textData = {
        content: content.trim(),
        title: title?.trim() || "Sans titre",
        created_by: uid,
      };

      const newText = await getTextRepository().create(workspace_id, textData);

      // 6️⃣ Logging succès
      logger.info("Texte créé avec succès", {
        workspace_id,
        user_id: uid,
        action: "create_text",
        text_id: newText.id,
      });

      // 7️⃣ Réponse standardisée
      return response.success({ text: newText });
    } catch (error) {
      logger.error("Erreur dans createText", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);

/**
 * Récupérer tous les textes d'un workspace
 */
export const getTexts = onCall(
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
      const { workspaceToken } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken,
        uid,
        WORKSPACE_ROLES.EDITOR // Rôle requis pour lire les textes
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Logique métier via repository
      const texts = await getTextRepository().getByWorkspace(workspace_id);

      // 5️⃣ Logging succès
      logger.info("Textes récupérés avec succès", {
        workspace_id,
        user_id: uid,
        action: "get_texts",
        count: texts.length,
      });

      // 6️⃣ Réponse standardisée
      return response.success({ texts });
    } catch (error) {
      logger.error("Erreur dans getTexts", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);

/**
 * Supprimer un texte
 */
export const deleteText = onCall(
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
      const { workspaceToken, textId } = request.data;
      const validationResponse = validateRequiredFields(request.data, [
        "workspaceToken",
        "textId",
      ]);
      if (!isSuccess(validationResponse)) return validationResponse;

      // 3️⃣ Validation workspace + rôles
      const tokenValidation = await verifyWorkspaceToken(
        workspaceToken,
        uid,
        WORKSPACE_ROLES.ADMIN // Rôle requis pour supprimer des textes
      );
      const validationResult = isValidWorkspaceToken(tokenValidation);
      if (!isSuccess(validationResult)) return validationResult;
      const { workspace_id, workspace_tokens } = validationResult;
      const response = createResponseWithTokens(workspace_tokens);

      // 4️⃣ Logique métier via repository
      const deleted = await getTextRepository().delete(textId, workspace_id);

      if (!deleted) {
        return response.error({
          code: "NOT_FOUND",
          message: "Texte non trouvé",
        });
      }

      // 5️⃣ Logging succès
      logger.info("Texte supprimé avec succès", {
        workspace_id,
        user_id: uid,
        action: "delete_text",
        text_id: textId,
      });

      // 6️⃣ Réponse standardisée
      return response.success({ deleted: true });
    } catch (error) {
      logger.error("Erreur dans deleteText", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { user_id: request.auth?.uid },
      });
      return handleError(error);
    }
  }
);
