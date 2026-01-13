import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { ShareQuestions } from "@/api/questions";
import { ViewData, TopicTreeResponse } from "@/lib/data-transformer";
import { findPathToNode } from "@/lib/utils";
import { useGraphMutations } from "@/features/graph/hooks/use-graph-mutations";
import { useTreeData } from "./use-tree-data";
import { useTreeInteraction } from "./use-tree-interaction";

// Helper for collecting all IDs
function getAllIdsFromNode(node: ViewData): string[] {
  const currentId = node.id;
  const descendantsIds = node.children.flatMap((child) => getAllIdsFromNode(child));
  return [currentId, ...descendantsIds];
}

export const useQuestionTree = (
  initialResponse: TopicTreeResponse,
  topicId: string,
  initialQuestionId?: string | null
) => {
  // 1. Data & Path Management
  const {
    viewData,
    currentPath,
    setCurrentPath,
    viewMode,
    setViewMode,
    isLoading,
    setIsLoading,
    currentQuestion,
    navigateToQuestion,
    addToPath,
    goHome,
    refreshViewData,
  } = useTreeData(initialResponse, topicId, initialQuestionId);

  // 2. Interaction State Management
  const {
    prompt,
    setPrompt,
    scrollAreaRef,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
    modifyMode,
    setModifyMode,
    nodeToMove,
    setNodeToMove,
    reparentRequest,
    setReparentRequest,
    isTopicSelectorOpen,
    setIsTopicSelectorOpen,
    moveToTopicRequest,
    setMoveTopicRequest,
    splitRequest,
    setSplitRequest,
    shareRequest,
    setShareRequest,
    startShareMode,
    startModifyMode,
    startSplitMode,
    moveToOtherMode,
    cancelModifyMode,
  } = useTreeInteraction();

  // 3. Mutations
  const {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    splitTopic,
    toggleFavorite,
  } = useGraphMutations();


  // --- Logic Handlers ---

  const handleGraphNodeClick = useCallback(
    (clickedNode: ViewData) => {
      switch (modifyMode) {
        case "IDLE":
          setSelectedNode(clickedNode);
          break;

        case "SELECT_NODE_TO_SHARE":
          if (clickedNode.id === topicId) {
            toast.error("토픽 자체는 공유할 수 없습니다.", {
              description: "공유하고 싶은 '첫 번째 질문 노드'를 선택해주세요.",
              duration: 5000,
            });
            return;
          }
          setShareRequest({ nodeToShare: clickedNode });
          break;

        case "SELECT_NODE_TO_SPLIT":
          toast.info(`'${clickedNode.questionText}' 노드를 선택했습니다.`);
          setSplitRequest({ nodeToSplit: clickedNode });
          break;

        case "SELECT_CHILD": // Step 1 of Move: Select node to move
          setNodeToMove(clickedNode);
          setModifyMode("SELECT_PARENT");
          toast.info(`'${clickedNode.questionText}' 선택됨. 새 부모 노드를 클릭하세요.`);
          break;

        case "SELECT_PARENT": // Step 2 of Move: Select new parent
          const newParentNode = clickedNode;

          if (!viewData || !nodeToMove) return;

          // Validation
          const pathToMovedNode = findPathToNode(viewData, nodeToMove.id);
          const currentParent = pathToMovedNode && pathToMovedNode.length > 1
            ? pathToMovedNode[pathToMovedNode.length - 2]
            : null;

          if (newParentNode.id === nodeToMove.id) {
            toast.error("자기 자신을 부모로 선택할 수 없습니다.");
            return;
          }
          if (currentParent && newParentNode.id === currentParent.id) {
            toast.error("이미 현재 부모 노드입니다.");
            return;
          }
          // Check if new parent is a descendant
          const path = findPathToNode(viewData, newParentNode.id);
          if (path && path.some((p) => p.id === nodeToMove.id)) {
            toast.error("선택한 노드의 하위노드로는 이동할 수 없습니다.");
            return;
          }

          toast.info(`'${newParentNode.questionText} 선택됨.'`);
          setReparentRequest({
            movedNode: nodeToMove,
            newParentNode: newParentNode,
          });
          break;

        case "SELECT_NODE_TO_MOVE_OTHER":
          setNodeToMove(clickedNode);
          setIsTopicSelectorOpen(true);
          setModifyMode("IDLE"); // Temporarily IDLE while modal is open
          toast.info(`'${clickedNode.questionText}' 선택됨. 이동할 토픽을 선택하세요.`);
          break;
      }
    },
    [modifyMode, viewData, nodeToMove, topicId, setModifyMode, setNodeToMove, setReparentRequest, setSplitRequest, setSelectedNode, setShareRequest, setIsTopicSelectorOpen]
  );

  const confirmShare = useCallback(
    async (targetEmail: string) => {
      if (!shareRequest) return;
      const { nodeToShare } = shareRequest;
      const toastId = toast.loading(`${targetEmail}님에게 공유하는 중...`);

      try {
        const allIdsToShare = getAllIdsFromNode(nodeToShare);
        await ShareQuestions({
          sourceQuestionIds: allIdsToShare,
          targetUserId: targetEmail,
        });
        toast.success("공유가 완료되었습니다!", { id: toastId });
      } catch (error) {
        console.error("공유 실패:", error);
        toast.error("공유에 실패했습니다.", { id: toastId });
      } finally {
        setShareRequest(null);
        setModifyMode("IDLE");
      }
    },
    [shareRequest, setShareRequest, setModifyMode]
  );

  const confirmReparenting = useCallback(async () => {
    if (!reparentRequest) return;
    const { movedNode, newParentNode } = reparentRequest;
    toast.loading("노드 트리를 이동하는 중...");

    try {
      const allIdsToCopy = getAllIdsFromNode(movedNode);
      await moveQuestion.mutateAsync({
        sourceQuestionIds: allIdsToCopy,
        targetParentId: newParentNode.id
      });
      await refreshViewData();
    } catch {
      // Error handled in mutation
    } finally {
      cancelModifyMode();
    }
  }, [reparentRequest, moveQuestion, refreshViewData, cancelModifyMode]);

  const confirmMoveToOtherTopic = useCallback(async () => {
    if (!moveToTopicRequest) return;
    const { movedNode, targetParentId } = moveToTopicRequest;
    toast.loading("다른 토픽으로 노드를 이동하는 중...");

    try {
      const allIdsToCopy = getAllIdsFromNode(movedNode);
      await moveQuestion.mutateAsync({
        sourceQuestionIds: allIdsToCopy,
        targetParentId: targetParentId
      });
      await refreshViewData();
    } catch {
      // Error handled in mutation
    } finally {
      cancelModifyMode();
    }
  }, [moveToTopicRequest, moveQuestion, refreshViewData, cancelModifyMode]);

  const confirmSplitTopic = useCallback(async () => {
    if (!splitRequest) return;
    const { nodeToSplit } = splitRequest;
    toast.loading("새 토픽으로 분리(이동)하는 중...");

    try {
      const allIdsToMove = getAllIdsFromNode(nodeToSplit);
      await splitTopic.mutateAsync(allIdsToMove);
    } catch {
      // Error handled in mutation
    } finally {
      cancelModifyMode();
    }
  }, [splitRequest, splitTopic, cancelModifyMode]);

  const handleAddQuestion = useCallback(async () => {
    if (!prompt.trim() || !currentQuestion || !viewData) return;

    const parentId = currentQuestion.id;
    const optimisticPrompt = prompt;

    setPrompt("");
    setIsLoading(true);

    try {
      await createQuestion.mutateAsync({
        questionText: optimisticPrompt,
        parentQuestionId: parentId,
      });
      await refreshViewData();
    } catch {
      setPrompt(optimisticPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, currentQuestion, viewData, createQuestion, refreshViewData, setPrompt, setIsLoading]);

  const handleSaveInPlaceEdit = useCallback(
    async (questionId: string, newText: string) => {
      try {
        await updateQuestion.mutateAsync({
          questionId,
          newNodeName: newText
        });
        await refreshViewData();
      } catch {
        // Error handled
      }
    },
    [updateQuestion, refreshViewData]
  );

  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      if (!viewData || !currentQuestion) return;
      try {
        await deleteQuestion.mutateAsync(questionId);
        await refreshViewData();
        // Additional navigation logic could be added here if needed
      } catch {
        // Error handled
      }
    },
    [viewData, currentQuestion, deleteQuestion, refreshViewData]
  );

  const handleToggleFavoriteQuestion = useCallback(
    async (questionId: string) => {
      try {
        await toggleFavorite.mutateAsync(questionId);
        await refreshViewData();
      } catch {
        // Error handled
      }
    },
    [toggleFavorite, refreshViewData]
  );

  return useMemo(
    () => ({
      // Data
      viewData,
      currentPath,
      setCurrentPath,
      viewMode,
      isLoading,
      currentQuestion,

      // Interaction State
      prompt,
      scrollAreaRef,
      selectedNode,
      focusedNodeId,
      modifyMode,
      nodeToMove,
      reparentRequest,
      isTopicSelectorOpen,
      moveToTopicRequest,
      splitRequest,
      shareRequest,

      // Actions/Setters
      setViewMode,
      setPrompt,
      navigateToQuestion,
      addToPath,
      goHome,
      handleGraphNodeClick,
      handleAddQuestion,
      handleSaveInPlaceEdit,
      handleDeleteQuestion,
      setSelectedNode,
      setFocusedNodeId,
      refreshViewData,
      startModifyMode,
      cancelModifyMode,
      confirmReparenting,
      moveToOtherMode,
      confirmMoveToOtherTopic,
      setIsTopicSelectorOpen,
      setMoveTopicRequest,
      startSplitMode,
      confirmSplitTopic,
      startShareMode,
      confirmShare,
      setShareRequest,
      toggleFavoriteQuestion: handleToggleFavoriteQuestion,
    }),
    [
      viewData, currentPath, viewMode, isLoading, currentQuestion,
      prompt, selectedNode, focusedNodeId, modifyMode, nodeToMove, reparentRequest, isTopicSelectorOpen, moveToTopicRequest, splitRequest, shareRequest,
      setCurrentPath, setViewMode, setPrompt, navigateToQuestion, addToPath, goHome,
      handleGraphNodeClick, handleAddQuestion, handleSaveInPlaceEdit, handleDeleteQuestion,
      setSelectedNode, setFocusedNodeId, refreshViewData, startModifyMode, cancelModifyMode,
      confirmReparenting, moveToOtherMode, confirmMoveToOtherTopic, setIsTopicSelectorOpen, setMoveTopicRequest,
      startSplitMode, confirmSplitTopic, startShareMode, confirmShare, setShareRequest, handleToggleFavoriteQuestion, scrollAreaRef
    ]
  );
};
