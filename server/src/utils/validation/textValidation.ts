import { TextType, CreateTextType, TextStatus } from "../../../../shared/types";

// ========================== INTERFACES ==========================

export interface TextValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ========================== VALIDATION CRÉATION ==========================

/**
 * Valide les données d'un nouveau texte
 * ✅ Validation métier séparée selon les règles Agentova
 */
export function validateTextData(data: CreateTextType): TextValidationResult {
  const result: TextValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // ✅ Validation contenu obligatoire
  if (!data.content || data.content.trim().length === 0) {
    result.errors.push("Le contenu est requis");
    result.valid = false;
  }

  // ✅ Validation longueur contenu
  if (data.content && data.content.length > 5000) {
    result.errors.push("Le contenu ne peut dépasser 5000 caractères");
    result.valid = false;
  }

  // ✅ Validation titre optionnel
  if (data.title && data.title.length > 200) {
    result.errors.push("Le titre ne peut dépasser 200 caractères");
    result.valid = false;
  }

  // ✅ Validation statut
  if (data.status && !Object.values(TextStatus).includes(data.status)) {
    result.errors.push("Le statut spécifié n'est pas valide");
    result.valid = false;
  }

  // ✅ Avertissement pour contenu court
  if (data.content && data.content.trim().length < 10) {
    result.warnings.push("Le contenu est très court");
  }

  // ✅ Avertissement pour titre manquant
  if (!data.title || data.title.trim().length === 0) {
    result.warnings.push(
      "Un titre est recommandé pour une meilleure organisation"
    );
  }

  return result;
}

// ========================== VALIDATION MISE À JOUR ==========================

/**
 * Valide les données de mise à jour d'un texte
 * ✅ Validation spécifique pour les mises à jour
 */
export function validateTextUpdate(
  existingText: TextType,
  updateData: Partial<TextType>
): TextValidationResult {
  const result: TextValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // ✅ Ne pas permettre de changer le workspace
  if (
    updateData.workspace_id &&
    updateData.workspace_id !== existingText.workspace_id
  ) {
    result.errors.push("Impossible de changer le workspace d'un texte");
    result.valid = false;
  }

  // ✅ Ne pas permettre de changer l'auteur
  if (
    updateData.created_by &&
    updateData.created_by !== existingText.created_by
  ) {
    result.errors.push("Impossible de changer l'auteur d'un texte");
    result.valid = false;
  }

  // ✅ Validation contenu si fourni
  if (updateData.content !== undefined) {
    if (!updateData.content || updateData.content.trim().length === 0) {
      result.errors.push("Le contenu ne peut pas être vide");
      result.valid = false;
    } else if (updateData.content.length > 5000) {
      result.errors.push("Le contenu ne peut dépasser 5000 caractères");
      result.valid = false;
    }
  }

  // ✅ Validation titre si fourni
  if (updateData.title !== undefined && updateData.title.length > 200) {
    result.errors.push("Le titre ne peut dépasser 200 caractères");
    result.valid = false;
  }

  // ✅ Validation statut si fourni
  if (
    updateData.status &&
    !Object.values(TextStatus).includes(updateData.status)
  ) {
    result.errors.push("Le statut spécifié n'est pas valide");
    result.valid = false;
  }

  return result;
}

// ========================== VALIDATION SUPPRESSION ==========================

/**
 * Valide si un texte peut être supprimé
 * ✅ Validation métier pour la suppression
 */
export function validateTextDeletion(text: TextType): TextValidationResult {
  const result: TextValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // ✅ Vérifier si le texte est publié
  if (text.status === TextStatus.PUBLISHED) {
    result.warnings.push(
      "Ce texte est publié, sa suppression peut affecter les utilisateurs"
    );
  }

  // ✅ Vérifier l'âge du texte
  const textAge = Date.now() - new Date(text.created_at).getTime();
  const daysOld = textAge / (1000 * 60 * 60 * 24);

  if (daysOld > 30) {
    result.warnings.push(
      "Ce texte est ancien, vérifiez qu'il n'est plus utilisé"
    );
  }

  return result;
}

// ========================== UTILITAIRES ==========================

/**
 * Valide une couleur hexadécimale pour les textes
 * ✅ Validation spécifique aux textes
 */
export function validateTextColor(color?: string | null): boolean {
  if (!color) return true;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Valide la longueur d'un texte selon son type
 * ✅ Validation contextuelle
 */
export function validateTextLength(
  content: string,
  type: "title" | "content"
): boolean {
  if (type === "title") {
    return content.length <= 200;
  }
  if (type === "content") {
    return content.length <= 5000;
  }
  return false;
}
