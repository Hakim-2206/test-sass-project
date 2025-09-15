import { Pool } from "pg";
import { getPool } from "../config.js";
import { TextType, CreateTextType, TextStatus } from "../../../shared/types.js";

/**
 * Repository pour la gestion des textes
 * ✅ Conforme aux règles Agentova - Pattern singleton avec isolation workspace
 * 🔧 Version démo avec simulation en mémoire
 */

// ✅ Données simulées en mémoire pour le mode démo
const MOCK_TEXTS: TextType[] = [
  {
    id: "demo-text-1",
    workspace_id: "demo-workspace-123",
    title: "Texte de démonstration",
    content: "Ceci est un texte de démonstration pour tester l'application.",
    status: TextStatus.DRAFT,
    created_by: "demo-user-123",
    created_at: new Date("2024-01-01T10:00:00Z"),
    updated_at: new Date("2024-01-01T10:00:00Z"),
  },
  {
    id: "demo-text-2",
    workspace_id: "demo-workspace-123",
    title: "Autre texte",
    content: "Un autre texte pour tester la liste des textes.",
    status: TextStatus.PUBLISHED,
    created_by: "demo-user-123",
    created_at: new Date("2024-01-02T14:30:00Z"),
    updated_at: new Date("2024-01-02T14:30:00Z"),
  },
];

export class TextRepository {
  private pool: Pool | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    this.pool = getPool(); // ✅ Tentative de connexion PostgreSQL
    if (this.pool === null) {
      console.log("🔧 [DEMO] Mode simulation activé - Pas de base de données");
      this.isDemoMode = true;
    } else {
      console.log("✅ [DEMO] Connexion PostgreSQL établie");
    }
  }

  // ✅ Méthodes avec isolation workspace
  async getByWorkspace(workspaceId: string): Promise<TextType[]> {
    if (this.isDemoMode) {
      // Mode simulation
      return MOCK_TEXTS.filter((text) => text.workspace_id === workspaceId);
    }

    const result = await this.pool!.query<TextType>(
      `SELECT id, workspace_id, title, content, status, created_by, created_at, updated_at 
       FROM texts 
       WHERE workspace_id = $1 
       ORDER BY created_at DESC`,
      [workspaceId] // ✅ Paramètres préparés
    );
    return result.rows;
  }

  // ✅ TOUJOURS récupérer avec workspace pour sécurité
  async getById(id: string, workspaceId: string): Promise<TextType | null> {
    if (this.isDemoMode) {
      // Mode simulation
      return (
        MOCK_TEXTS.find(
          (text) => text.id === id && text.workspace_id === workspaceId
        ) || null
      );
    }

    const result = await this.pool!.query<TextType>(
      `SELECT id, workspace_id, title, content, status, created_by, created_at, updated_at 
       FROM texts 
       WHERE id = $1 AND workspace_id = $2`,
      [id, workspaceId]
    );
    return result.rows[0] || null;
  }

  async create(workspaceId: string, data: CreateTextType): Promise<TextType> {
    if (this.isDemoMode) {
      // Mode simulation
      const newText: TextType = {
        id: `demo-text-${Date.now()}`,
        workspace_id: workspaceId,
        title: data.title || "Sans titre",
        content: data.content,
        status: data.status || TextStatus.DRAFT,
        created_by: data.created_by,
        created_at: new Date(),
        updated_at: new Date(),
      };
      MOCK_TEXTS.push(newText);
      return newText;
    }

    const result = await this.pool!.query<TextType>(
      `INSERT INTO texts (workspace_id, title, content, status, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, workspace_id, title, content, status, created_by, created_at, updated_at`,
      [
        workspaceId,
        data.title,
        data.content,
        data.status || TextStatus.DRAFT,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<CreateTextType>
  ): Promise<TextType | null> {
    if (this.isDemoMode) {
      // Mode simulation
      const textIndex = MOCK_TEXTS.findIndex(
        (text) => text.id === id && text.workspace_id === workspaceId
      );
      if (textIndex === -1) return null;

      MOCK_TEXTS[textIndex] = {
        ...MOCK_TEXTS[textIndex],
        ...data,
        updated_at: new Date(),
      };
      return MOCK_TEXTS[textIndex];
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }

    if (fields.length === 0) {
      return this.getById(id, workspaceId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, workspaceId);

    const result = await this.pool!.query<TextType>(
      `UPDATE texts 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex++}
       RETURNING id, workspace_id, title, content, created_by, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    if (this.isDemoMode) {
      // Mode simulation
      const textIndex = MOCK_TEXTS.findIndex(
        (text) => text.id === id && text.workspace_id === workspaceId
      );
      if (textIndex === -1) return false;

      MOCK_TEXTS.splice(textIndex, 1);
      return true;
    }

    const result = await this.pool!.query(
      "DELETE FROM texts WHERE id = $1 AND workspace_id = $2",
      [id, workspaceId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async count(workspaceId: string): Promise<number> {
    if (this.isDemoMode) {
      // Mode simulation
      return MOCK_TEXTS.filter((text) => text.workspace_id === workspaceId)
        .length;
    }

    const result = await this.pool!.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM texts WHERE workspace_id = $1",
      [workspaceId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

// ✅ Singleton avec lazy initialization
let textRepo: TextRepository | undefined;

export function getTextRepository(): TextRepository {
  if (!textRepo) {
    textRepo = new TextRepository();
  }
  return textRepo;
}
