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
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
    enabled: !!currentWorkspaceId && !!textId, // ✅ Seulement si on a les IDs requis
  });

  // ✅ Mutation création avec gestion cache
  const createMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      CommentService.createComment(currentWorkspaceId, data),
    onSuccess: (newData) => {
      // ✅ Invalidation forcée pour recharger les données depuis le serveur
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byText(
          currentWorkspaceId,
          newData.comment.text_id
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.all(currentWorkspaceId),
      });
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
      // ✅ Invalidation forcée pour recharger les données depuis le serveur
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byText(
          currentWorkspaceId,
          updatedData.comment.text_id
        ),
      });
    },
  });

  // ✅ Mutation suppression avec gestion cache
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      CommentService.deleteComment(currentWorkspaceId, commentId),
    onSuccess: (_, commentId) => {
      // ✅ Invalidation forcée pour recharger les données depuis le serveur
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byText(currentWorkspaceId, textId || ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.all(currentWorkspaceId),
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
