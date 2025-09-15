import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useWorkspaceContext } from "../contexts/WorkspaceContext";
import { queryKeys } from "../query/queryKeys";
import {
  CommentService,
  CommentType,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../services/api/commentService";

/**
 * Hook pour la gestion des commentaires
 * ✅ Conforme aux règles Agentova - React Query + useCallback + Return organisé
 */
export function useComments(textId?: string) {
  // ✅ Context workspace obligatoire
  const { currentWorkspaceId } = useWorkspaceContext();
  const queryClient = useQueryClient();

  // ✅ React Query avec clés standardisées
  const commentsQuery = useQuery({
    queryKey: textId
      ? queryKeys.comments.byText(currentWorkspaceId, textId)
      : queryKeys.comments.all(currentWorkspaceId),
    queryFn: () =>
      textId
        ? CommentService.getComments(currentWorkspaceId, textId)
        : CommentService.getComments(currentWorkspaceId, ""), // TODO: Implémenter getAllComments
    staleTime: 5 * 60 * 1000, // 5 minutes - évite les rechargements inutiles
    refetchOnMount: false, // Pas de rechargement automatique
    placeholderData: (previousData) => previousData,
    enabled: !!currentWorkspaceId && !!textId, // ✅ Seulement si on a les IDs requis
  });

  // ✅ Mutation création avec gestion cache
  const createMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      CommentService.createComment(currentWorkspaceId, data),
    onMutate: async (newComment) => {
      // ✅ Mise à jour optimiste immédiate (avant l'appel API)
      const queryKey = queryKeys.comments.byText(
        currentWorkspaceId,
        newComment.text_id
      );

      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey });

      // Sauvegarder l'état précédent pour rollback
      const previousComments = queryClient.getQueryData(queryKey);

      // Créer un commentaire temporaire avec ID unique
      const tempComment = {
        id: `temp-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        text_id: newComment.text_id,
        content: newComment.content,
        status: newComment.status || "published",
        author_id: "demo-user-123",
        author_name: "Utilisateur Demo",
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mise à jour optimiste immédiate
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) {
          return { comments: [tempComment] };
        }
        return {
          ...old,
          comments: [tempComment, ...old.comments],
        };
      });

      return { previousComments, tempComment };
    },
    onSuccess: (newData, variables, context) => {
      // ✅ Remplacer le commentaire temporaire par le vrai
      const queryKey = queryKeys.comments.byText(
        currentWorkspaceId,
        newData.comment.text_id
      );
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment: any) =>
            comment.id === context?.tempComment.id ? newData.comment : comment
          ),
        };
      });
    },
    onError: (err, variables, context) => {
      // ✅ Rollback en cas d'erreur
      if (context?.previousComments) {
        const queryKey = queryKeys.comments.byText(
          currentWorkspaceId,
          variables.text_id
        );
        queryClient.setQueryData(queryKey, context.previousComments);
      }
    },
  });

  // ✅ Mutation mise à jour avec gestion cache
  const updateMutation = useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequest;
    }) => CommentService.updateComment(currentWorkspaceId, commentId, data),
    onSuccess: (updatedData) => {
      // ✅ Mise à jour optimiste du cache (plus rapide)
      const queryKey = queryKeys.comments.byText(
        currentWorkspaceId,
        updatedData.comment.text_id
      );
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment: CommentType) =>
            comment.id === updatedData.comment.id
              ? updatedData.comment
              : comment
          ),
        };
      });
    },
  });

  // ✅ Mutation suppression avec gestion cache
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      CommentService.deleteComment(currentWorkspaceId, commentId),
    onSuccess: (_, commentId) => {
      // ✅ Mise à jour optimiste du cache (plus rapide)
      const queryKey = queryKeys.comments.byText(
        currentWorkspaceId,
        textId || ""
      );
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.filter(
            (comment: CommentType) => comment.id !== commentId
          ),
        };
      });
    },
  });

  // ✅ Fonctions utilitaires avec useCallback
  const createComment = useCallback(
    (data: CreateCommentRequest) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const updateComment = useCallback(
    (commentId: string, data: UpdateCommentRequest) => {
      updateMutation.mutate({ commentId, data });
    },
    [updateMutation]
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      deleteMutation.mutate(commentId);
    },
    [deleteMutation]
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: textId
        ? queryKeys.comments.byText(currentWorkspaceId, textId)
        : queryKeys.comments.all(currentWorkspaceId),
    });
  }, [currentWorkspaceId, textId, queryClient]);

  // ✅ Return organisé par catégorie selon pattern Agentova
  return {
    // Data
    comments: commentsQuery.data?.comments || [],
    // Loading states
    isLoading: commentsQuery.isLoading,
    isRefetching: commentsQuery.isRefetching,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    // Actions
    createComment,
    updateComment,
    deleteComment,
    // Action states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    // Utils
    refresh,
  };
}
