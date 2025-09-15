// ========================== SERVICE URLS ==========================

export const SERVICE_URL = {
  FIREBASE: "http://localhost:5001/demo-project/us-central1",
  FASTAPI: "http://127.0.0.1:8080",
  APP: "http://localhost:3000",
};

// ========================== TYPES ==========================

export interface WorkspaceToken {
  role: string;
  token: string;
}

export type WorkspaceTokenMap = Record<string, WorkspaceToken>;

// ========================== DONNÉES FANTÔMES ==========================

const MOCK_WORKSPACE_TOKENS: WorkspaceTokenMap = {
  "demo-workspace-123": {
    role: "admin",
    token: "demo-token-workspace-123",
  },
  "demo-workspace-456": {
    role: "editor",
    token: "demo-token-workspace-456",
  },
};

// ========================== FONCTIONS FANTÔMES ==========================

/**
 * Récupère le token d'authentification Firebase
 * 🔧 VERSION DEMO - TOUJOURS MÊME TOKEN
 */
export async function getIdToken(): Promise<string> {
  // 🔧 FONCTION VIDE - Toujours même token
  return "demo-token-123456789";
}

/**
 * Stocke les tokens workspace
 * 🔧 VERSION DEMO - FONCTION VIDE
 */
export function storeTokens(tokens: WorkspaceTokenMap): void {
  // 🔧 FONCTION VIDE - Ne fait rien
}

/**
 * Récupère les tokens workspace stockés
 * 🔧 VERSION DEMO - TOUJOURS MÊMES TOKENS
 */
export function getStoredTokens(): WorkspaceTokenMap {
  // 🔧 FONCTION VIDE - Toujours retourner les mêmes tokens
  return MOCK_WORKSPACE_TOKENS;
}

/**
 * Appelle une fonction Firebase sécurisée
 * ✅ Version réelle avec Firebase Functions
 */
export async function callSecuredFunction<T>(
  functionName: string,
  workspaceId: string,
  data?: any
): Promise<T> {
  try {
    // ✅ Appel réel vers Firebase Functions
    const response = await fetch(`${SERVICE_URL.FIREBASE}/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getIdToken()}`,
        "X-Workspace-Token": getStoredTokens()[workspaceId]?.token || "",
      },
      body: JSON.stringify({
        workspaceToken: getStoredTokens()[workspaceId]?.token || "",
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erreur appel Firebase Function:", error);
    // ✅ Fallback vers simulation en cas d'erreur
    return await callFirebaseFunction<T>(functionName, data);
  }
}

/**
 * Appelle une fonction Firebase avec SSE
 * 🔧 VERSION DEMO - SIMULATION SIMPLE
 */
export async function callSecuredSSEFunction(
  functionName: string,
  workspaceId: string,
  data?: any
): Promise<Response> {
  // 🔧 FONCTION VIDE - Simuler un appel SSE simple
  return await fetch(`${SERVICE_URL.FASTAPI}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspace_id: workspaceId,
      ...data,
    }),
  });
}

/**
 * Fonction Firebase fantôme
 * 🔧 VERSION DEMO - Simulation complète des fonctions
 */
async function callFirebaseFunction<T>(
  functionName: string,
  data: any
): Promise<T> {
  console.log(`🔧 [DEMO] Simulation: ${functionName}`, data);

  // ✅ Simulation des appels Firebase Functions
  if (functionName === "getTexts") {
    // Simuler la récupération des textes
    const mockTexts = [
      {
        id: "demo-text-1",
        workspace_id: "demo-workspace-123",
        title: "Texte de démonstration",
        content:
          "Ceci est un texte de démonstration pour tester l'application.",
        status: "draft",
        created_by: "demo-user-123",
        created_at: new Date("2024-01-01T10:00:00Z"),
        updated_at: new Date("2024-01-01T10:00:00Z"),
      },
      {
        id: "demo-text-2",
        workspace_id: "demo-workspace-123",
        title: "Autre texte",
        content: "Un autre texte pour tester la liste des textes.",
        status: "published",
        created_by: "demo-user-123",
        created_at: new Date("2024-01-02T14:30:00Z"),
        updated_at: new Date("2024-01-02T14:30:00Z"),
      },
    ];
    return { texts: mockTexts } as T;
  }

  if (functionName === "createText") {
    // Simuler la création d'un texte
    const newText = {
      id: `demo-text-${Date.now()}`,
      workspace_id: "demo-workspace-123",
      title: data.title || "Sans titre",
      content: data.content,
      status: data.status || "draft",
      created_by: "demo-user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };
    return { text: newText } as T;
  }

  if (functionName === "deleteText") {
    // Simuler la suppression d'un texte
    return { deleted: true } as T;
  }

  if (functionName === "updateText") {
    // Simuler la mise à jour d'un texte
    const updatedText = {
      id: data.textId,
      workspace_id: "demo-workspace-123",
      title: data.title || "Sans titre",
      content: data.content || "Contenu mis à jour",
      status: data.status || "draft",
      created_by: "demo-user-123",
      created_at: new Date("2024-01-01T10:00:00Z"),
      updated_at: new Date(),
    };
    return { text: updatedText } as T;
  }

  // Fallback pour les autres fonctions
  return {
    success: true,
    data: null,
    workspace_tokens: MOCK_WORKSPACE_TOKENS,
  } as T;
}

/**
 * Déconnecte l'utilisateur
 * 🔧 VERSION DEMO - FONCTION VIDE
 */
export async function logoutUser(): Promise<void> {
  // 🔧 FONCTION VIDE - Ne fait rien
}

/**
 * Nettoie tout le cache de l'application
 * 🔧 VERSION DEMO - FONCTION VIDE
 */
export function clearAllCache(): void {
  // 🔧 FONCTION VIDE - Ne fait rien
}
