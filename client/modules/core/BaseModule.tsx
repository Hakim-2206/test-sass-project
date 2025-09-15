import React from "react";

// ========================== INTERFACES ==========================

export interface ModuleComponent {
  moduleId: string;
  component: React.ComponentType<ModuleProps>;
}

export interface ModuleProps {
  employee: {
    id: string;
    name: string;
    hexColor: string;
    description: string;
  };
  onModuleChange?: (moduleId: string) => void;
}

// ========================== UTILITAIRES ==========================

/**
 * Crée un module avec l'interface standardisée
 * ✅ Pattern obligatoire pour tous les modules
 */
export function createModule(
  component: React.ComponentType<ModuleProps>,
  moduleId: string
): ModuleComponent {
  return {
    moduleId,
    component,
  };
}

// ========================== TYPES PARTAGÉS ==========================

export interface ModuleState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface ModuleAction {
  type: "SET_LOADING" | "SET_ERROR" | "SET_DATA";
  payload?: any;
}

// ========================== HOOKS MODULES ==========================

/**
 * Hook de base pour la gestion d'état des modules
 * ✅ Pattern standardisé pour tous les modules
 */
export function useModuleState<T = any>(initialData?: T) {
  const [state, setState] = React.useState<ModuleState>({
    isLoading: false,
    error: null,
    data: initialData || null,
  });

  const setLoading = React.useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = React.useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = React.useCallback((data: T) => {
    setState((prev) => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  return {
    state,
    setLoading,
    setError,
    setData,
  };
}
