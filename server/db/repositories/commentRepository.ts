import { Pool } from "pg";
import { getPool } from "../config";
import {
  CommentType,
  CreateCommentType,
  CommentStatus,
} from "../../../shared/types";

// ✅ Données de démonstration pour le mode simulation
const MOCK_COMMENTS: CommentType[] = [
  {
    id: "demo-comment-1",
    workspace_id: "demo-workspace-123",
    text_id: "demo-text-1",
    content: "Excellent texte ! Très bien structuré et informatif.",
    status: CommentStatus.PUBLISHED,
    author_id: "demo-user-123",
    author_name: "Élisa",
    created_at: new Date("2024-01-01T11:00:00Z"),
    updated_at: new Date("2024-01-01T11:00:00Z"),
  },
  {
    id: "demo-comment-2",
    workspace_id: "demo-workspace-123",
    text_id: "demo-text-1",
    content: "Je suggère d'ajouter une section sur les bonnes pratiques.",
    status: CommentStatus.DRAFT,
    author_id: "demo-user-456",
    author_name: "Benoît",
    created_at: new Date("2024-01-01T12:30:00Z"),
    updated_at: new Date("2024-01-01T12:30:00Z"),
  },
  {
    id: "demo-comment-3",
    workspace_id: "demo-workspace-123",
    text_id: "demo-text-2",
    content: "Parfait pour notre documentation interne.",
    status: CommentStatus.PUBLISHED,
    author_id: "demo-user-123",
    author_name: "Élisa",
    created_at: new Date("2024-01-02T15:45:00Z"),
    updated_at: new Date("2024-01-02T15:45:00Z"),
  },
];

/**
 * Repository pour la gestion des commentaires
 * ✅ Pattern singleton avec lazy initialization
 * ✅ Isolation workspace obligatoire
 * ✅ Mode démo avec données simulées
 */
export class CommentRepository {
  private pool: Pool | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    this.pool = getPool(); // ✅ Tentative de connexion PostgreSQL
    if (this.pool === null) {
      console.log(
        "🔧 [DEMO] Mode simulation activé pour les commentaires - Pas de base de données"
      );
      this.isDemoMode = true;
    } else {
      console.log(
        "✅ [DEMO] Connexion PostgreSQL établie pour les commentaires"
      );
    }
  }

  // ✅ Méthodes avec isolation workspace
  async getByWorkspace(workspaceId: string): Promise<CommentType[]> {
    if (this.isDemoMode) {
      // Mode simulation
      return MOCK_COMMENTS.filter(
        (comment) => comment.workspace_id === workspaceId
      );
    }

    const result = await this.pool!.query<CommentType>(
      `SELECT id, workspace_id, text_id, content, status, author_id, author_name, created_at, updated_at, parent_id
       FROM comments
       WHERE workspace_id = $1
       ORDER BY created_at DESC`,
      [workspaceId] // ✅ Paramètres préparés
    );
    return result.rows;
  }

  async getByText(workspaceId: string, textId: string): Promise<CommentType[]> {
    if (this.isDemoMode) {
      // Mode simulation
      return MOCK_COMMENTS.filter(
        (comment) =>
          comment.workspace_id === workspaceId && comment.text_id === textId
      );
    }

    const result = await this.pool!.query<CommentType>(
      `SELECT id, workspace_id, text_id, content, status, author_id, author_name, created_at, updated_at, parent_id
       FROM comments
       WHERE workspace_id = $1 AND text_id = $2
       ORDER BY created_at ASC`,
      [workspaceId, textId] // ✅ Paramètres préparés
    );
    return result.rows;
  }

  // ✅ TOUJOURS récupérer avec workspace pour sécurité
  async getById(id: string, workspaceId: string): Promise<CommentType | null> {
    if (this.isDemoMode) {
      // Mode simulation
      return (
        MOCK_COMMENTS.find(
          (comment) => comment.id === id && comment.workspace_id === workspaceId
        ) || null
      );
    }

    const result = await this.pool!.query<CommentType>(
      `SELECT id, workspace_id, text_id, content, status, author_id, author_name, created_at, updated_at, parent_id
       FROM comments
       WHERE id = $1 AND workspace_id = $2`,
      [id, workspaceId]
    );
    return result.rows[0] || null;
  }

  async create(
    workspaceId: string,
    data: CreateCommentType
  ): Promise<CommentType> {
    if (this.isDemoMode) {
      // Mode simulation
      const newComment: CommentType = {
        id: `demo-comment-${Date.now()}`,
        workspace_id: workspaceId,
        text_id: data.text_id,
        content: data.content,
        status: data.status || CommentStatus.DRAFT,
        author_id: data.author_id,
        author_name: data.author_name,
        created_at: new Date(),
        updated_at: new Date(),
        parent_id: data.parent_id,
      };
      MOCK_COMMENTS.push(newComment);
      return newComment;
    }

    const result = await this.pool!.query<CommentType>(
      `INSERT INTO comments (workspace_id, text_id, content, status, author_id, author_name, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, workspace_id, text_id, content, status, author_id, author_name, created_at, updated_at, parent_id`,
      [
        workspaceId,
        data.text_id,
        data.content,
        data.status || CommentStatus.DRAFT,
        data.author_id,
        data.author_name,
        data.parent_id || null,
      ]
    );
    return result.rows[0];
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<CreateCommentType>
  ): Promise<CommentType | null> {
    if (this.isDemoMode) {
      // Mode simulation
      const commentIndex = MOCK_COMMENTS.findIndex(
        (comment) => comment.id === id && comment.workspace_id === workspaceId
      );
      if (commentIndex === -1) return null;

      MOCK_COMMENTS[commentIndex] = {
        ...MOCK_COMMENTS[commentIndex],
        ...data,
        updated_at: new Date(),
      };
      return MOCK_COMMENTS[commentIndex];
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updateFields.length === 0) {
      return this.getById(id, workspaceId);
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id, workspaceId);

    const result = await this.pool!.query<CommentType>(
      `UPDATE comments
       SET ${updateFields.join(", ")}
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex++}
       RETURNING id, workspace_id, text_id, content, status, author_id, author_name, created_at, updated_at, parent_id`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    if (this.isDemoMode) {
      // Mode simulation
      const commentIndex = MOCK_COMMENTS.findIndex(
        (comment) => comment.id === id && comment.workspace_id === workspaceId
      );
      if (commentIndex === -1) return false;

      MOCK_COMMENTS.splice(commentIndex, 1);
      return true;
    }

    const result = await this.pool!.query(
      `DELETE FROM comments
       WHERE id = $1 AND workspace_id = $2`,
      [id, workspaceId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

// ✅ Singleton avec lazy initialization
let commentRepo: CommentRepository | undefined;

export function getCommentRepository(): CommentRepository {
  if (!commentRepo) {
    commentRepo = new CommentRepository();
  }
  return commentRepo;
}
