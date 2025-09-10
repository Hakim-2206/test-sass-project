"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ========================== INTERFACES ==========================

export interface Workspace {
  id: string;
  name: string;
  color: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

interface WorkspaceProviderState {
  currentWorkspaceId: string;
  currentWorkspace: Workspace;
  setCurrentWorkspaceId: (id: string) => void;
  refetchWorkspaces: () => Promise<any>;
}

// ========================== CONTEXT ==========================

const WorkspaceProviderContext = createContext<WorkspaceProviderState | null>(null);

// Clé pour le localStorage
const WORKSPACE_CACHE_KEY = 'agentova_selected_workspace';

// ========================== DONNÉES FANTÔMES ==========================

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'demo-workspace-123',
    name: 'Workspace Demo',
    color: '#3B82F6',
    owner_id: 'demo-user-123',
    created_at: new Date('2024-01-01'),
    updated_at: new Date()
  },
  {
    id: 'demo-workspace-456',
    name: 'Test Workspace',
    color: '#10B981',
    owner_id: 'demo-user-123',
    created_at: new Date('2024-01-15'),
    updated_at: new Date()
  }
];

// ========================== PROVIDER ==========================

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // ✅ FONCTION FANTÔME - Sauvegarder workspace en cache
  const saveWorkspaceIdToCache = (workspaceId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORKSPACE_CACHE_KEY, workspaceId);
      console.log('🔧 [DEMO] Workspace sauvegardé en cache:', workspaceId);
    }
  };

  // ✅ FONCTION FANTÔME - Récupérer workspace depuis cache
  const getWorkspaceIdFromCache = (): string | null => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(WORKSPACE_CACHE_KEY);
      console.log('🔧 [DEMO] Workspace récupéré du cache:', cached);
      return cached;
    }
    return null;
  };

  // ✅ FONCTION FANTÔME - Changer de workspace
  const handleSetCurrentWorkspaceId = (id: string) => {
    console.log('🔧 [DEMO] Changement de workspace:', id);
    setCurrentWorkspaceId(id);
    saveWorkspaceIdToCache(id);
  };

  // ✅ FONCTION FANTÔME - Refetch workspaces
  const refetchWorkspaces = async () => {
    console.log('🔧 [DEMO] Simulation refetch workspaces');
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_WORKSPACES;
  };

  // ✅ INITIALISATION AUTOMATIQUE
  useEffect(() => {
    if (isAuthenticated && !currentWorkspaceId) {
      console.log('🔄 [DEMO] Initialisation workspace automatique...');
      
      // Essayer de récupérer depuis le cache
      const cachedWorkspaceId = getWorkspaceIdFromCache();
      
      if (cachedWorkspaceId && MOCK_WORKSPACES.find(w => w.id === cachedWorkspaceId)) {
        setCurrentWorkspaceId(cachedWorkspaceId);
        console.log('✅ [DEMO] Workspace restauré depuis cache:', cachedWorkspaceId);
      } else {
        // Utiliser le premier workspace par défaut
        const defaultWorkspace = MOCK_WORKSPACES[0];
        setCurrentWorkspaceId(defaultWorkspace.id);
        saveWorkspaceIdToCache(defaultWorkspace.id);
        console.log('✅ [DEMO] Workspace par défaut sélectionné:', defaultWorkspace.id);
      }
    }
  }, [isAuthenticated, currentWorkspaceId]);

  // ✅ CALCUL DU WORKSPACE ACTUEL
  const currentWorkspace = currentWorkspaceId 
    ? MOCK_WORKSPACES.find(w => w.id === currentWorkspaceId) || MOCK_WORKSPACES[0]
    : MOCK_WORKSPACES[0];

  // ✅ VALEUR DU CONTEXTE
  const contextValue: WorkspaceProviderState = {
    currentWorkspaceId: currentWorkspace.id,
    currentWorkspace,
    setCurrentWorkspaceId: handleSetCurrentWorkspaceId,
    refetchWorkspaces
  };

  return (
    <WorkspaceProviderContext.Provider value={contextValue}>
      {children}
    </WorkspaceProviderContext.Provider>
  );
}

// ========================== HOOK ==========================

export function useWorkspaceContext(): WorkspaceProviderState {
  const context = useContext(WorkspaceProviderContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}

// ========================== UTILS FANTÔMES ==========================

/**
 * Hook pour les workspaces avec données fantômes
 * 🔧 VERSION DEMO - Retourne toujours les mêmes données
 */
export function useWorkspaces() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const refetch = async () => {
    setIsRefetching(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefetching(false);
    return { data: MOCK_WORKSPACES };
  };

  return {
    workspaces: MOCK_WORKSPACES,
    isLoading,
    isRefetching,
    isError: false,
    refetch
  };
}

/**
 * Hook pour un workspace spécifique
 * 🔧 VERSION DEMO - Retourne toujours des données fictives
 */
export function useWorkspace(workspaceId: string) {
  const workspace = MOCK_WORKSPACES.find(w => w.id === workspaceId) || MOCK_WORKSPACES[0];

  const refreshWorkspaceOnly = async () => {
    console.log('🔧 [DEMO] Refresh workspace:', workspaceId);
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  return {
    workspace,
    isLoading: false,
    isError: false,
    refreshWorkspaceOnly
  };
}