import { callSecuredFunction } from "../index";
import { TextType, CreateTextType, TextStatus } from "../../../shared/types";

// ✅ Ré-export des types pour compatibilité
export type { TextType, CreateTextType, TextStatus };

/**
 * Service de gestion des textes côté client
 * ✅ Conforme aux règles Agentova - Méthodes statiques uniquement
 */

export interface CreateTextRequest {
  title?: string;
  content: string;
  status?: TextStatus;
}

export interface TextsResponse {
  texts: TextType[];
}

export interface TextResponse {
  text: TextType;
}

export class TextService {
  /**
   * Créer un nouveau texte
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async createText(
    workspaceId: string, // ✅ Premier paramètre TOUJOURS
    data: CreateTextRequest
  ): Promise<TextType> {
    try {
      // ✅ Utilisation de callSecuredFunction selon les règles
      const result = await callSecuredFunction<TextResponse>(
        "createText",
        workspaceId,
        data
      );

      return result.text;
    } catch (error) {
      console.error("Erreur création texte:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les textes d'un workspace
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async getTexts(workspaceId: string): Promise<TextType[]> {
    try {
      // ✅ Utilisation de callSecuredFunction selon les règles
      const result = await callSecuredFunction<TextsResponse>(
        "getTexts",
        workspaceId,
        {}
      );

      return result.texts;
    } catch (error) {
      console.error("Erreur récupération textes:", error);
      throw error;
    }
  }

  /**
   * Supprimer un texte
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async deleteText(
    workspaceId: string, // ✅ Premier paramètre TOUJOURS
    textId: string
  ): Promise<boolean> {
    try {
      // ✅ Utilisation de callSecuredFunction selon les règles
      const result = await callSecuredFunction<{ deleted: boolean }>(
        "deleteText",
        workspaceId,
        { textId }
      );

      return result.deleted;
    } catch (error) {
      console.error("Erreur suppression texte:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un texte
   * ✅ Méthode statique avec workspaceId en premier paramètre
   */
  static async updateText(
    workspaceId: string, // ✅ Premier paramètre TOUJOURS
    textId: string,
    data: Partial<CreateTextRequest>
  ): Promise<TextType> {
    try {
      // ✅ Utilisation de callSecuredFunction selon les règles
      const result = await callSecuredFunction<TextResponse>(
        "updateText",
        workspaceId,
        { textId, ...data }
      );

      return result.text;
    } catch (error) {
      console.error("Erreur mise à jour texte:", error);
      throw error;
    }
  }
}
