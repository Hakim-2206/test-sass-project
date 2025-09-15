import { CreateCommentType, CommentStatus } from "../../../../shared/types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validation métier pour les commentaires
 * ✅ Validation séparée selon les règles Agentova
 */
export function validateCommentData(data: CreateCommentType): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Validation du contenu
  if (!data.content || data.content.trim().length === 0) {
    errors.push("Le contenu du commentaire est obligatoire");
  } else if (data.content.trim().length < 3) {
    errors.push("Le contenu doit contenir au moins 3 caractères");
  } else if (data.content.length > 2000) {
    errors.push("Le contenu ne peut pas dépasser 2000 caractères");
  }

  // ✅ Validation du text_id
  if (!data.text_id || data.text_id.trim().length === 0) {
    errors.push("L'ID du texte est obligatoire");
  }

  // ✅ Validation de l'auteur
  if (!data.author_id || data.author_id.trim().length === 0) {
    errors.push("L'ID de l'auteur est obligatoire");
  }

  if (!data.author_name || data.author_name.trim().length === 0) {
    errors.push("Le nom de l'auteur est obligatoire");
  } else if (data.author_name.length > 100) {
    errors.push("Le nom de l'auteur ne peut pas dépasser 100 caractères");
  }

  // ✅ Validation du statut
  if (data.status && !Object.values(CommentStatus).includes(data.status)) {
    errors.push("Statut de commentaire invalide");
  }

  // ✅ Validation du parent_id (pour les réponses)
  if (data.parent_id && data.parent_id.trim().length === 0) {
    errors.push("L'ID du commentaire parent ne peut pas être vide");
  }

  // ✅ Warnings pour amélioration UX
  if (data.content && data.content.trim().length < 10) {
    warnings.push("Un commentaire plus détaillé serait plus utile");
  }

  if (
    data.content &&
    data.content.includes("http") &&
    !data.content.includes("https")
  ) {
    warnings.push("Utilisez HTTPS pour les liens de sécurité");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validation pour la mise à jour d'un commentaire
 */
export function validateCommentUpdateData(
  data: Partial<CreateCommentType>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Validation du contenu si fourni
  if (data.content !== undefined) {
    if (data.content.trim().length === 0) {
      errors.push("Le contenu du commentaire ne peut pas être vide");
    } else if (data.content.trim().length < 3) {
      errors.push("Le contenu doit contenir au moins 3 caractères");
    } else if (data.content.length > 2000) {
      errors.push("Le contenu ne peut pas dépasser 2000 caractères");
    }
  }

  // ✅ Validation du statut si fourni
  if (
    data.status !== undefined &&
    !Object.values(CommentStatus).includes(data.status)
  ) {
    errors.push("Statut de commentaire invalide");
  }

  // ✅ Validation de l'auteur si fourni
  if (data.author_name !== undefined) {
    if (data.author_name.trim().length === 0) {
      errors.push("Le nom de l'auteur ne peut pas être vide");
    } else if (data.author_name.length > 100) {
      errors.push("Le nom de l'auteur ne peut pas dépasser 100 caractères");
    }
  }

  // ✅ Warnings
  if (data.content && data.content.trim().length < 10) {
    warnings.push("Un commentaire plus détaillé serait plus utile");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
