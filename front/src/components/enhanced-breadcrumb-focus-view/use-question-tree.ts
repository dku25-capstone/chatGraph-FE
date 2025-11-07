import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  askQuestion,
  getTopicById,
  QuestionNode,
  deleteQuestion,
  patchQuestion,
} from "@/api/questions";
import {
  ViewData,
  TopicTreeResponse,
  transformApiDataToViewData,
} from "@/lib/data-transformer";
import { findPathToNode } from "@/lib/utils";
import { toast } from "sonner";
import { useTopicStore } from "@/lib/topic-store";

// 상태 및 동작 커스텀 훅
export const useQuestionTree = (
  initialResponse: TopicTreeResponse,
  topicId: string,
  initialQuestionId?: string | null
) => {
  const initialViewData = useMemo(
    () => transformApiDataToViewData(initialResponse),
    [initialResponse]
  );

  const [viewData, setViewData] = useState<ViewData | null>(initialViewData);
  const [currentPath, setCurrentPath] = useState<ViewData[]>([initialViewData]); // 현재 선택된 질문까지의 경로
  const [viewMode, setViewMode] = useState<"chat" | "graph">("chat");
  const [prompt, setPrompt] = useState(""); // follow-up 입력값
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ViewData | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ViewData | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (viewData && topicId) {
      useTopicStore.getState().setTopic(topicId, viewData.questionText);
    }
  }, [viewData, topicId]);

  // 스토어의 해당 값이 실제로 변경될 때만 리렌더링 일어남
  const currentTopicNameFromStore = useTopicStore(
    (state) => state.currentTopicName
  );
  const currentTopicIdFromStore = useTopicStore(
    (state) => state.currentTopicId
  );

  // 의존성을 스토어에서 온 값으로 분리
  useEffect(() => {
    setViewData((prevViewData) => {
      if (
        prevViewData &&
        currentTopicIdFromStore === topicId &&
        currentTopicNameFromStore !== prevViewData.questionText
      ) {
        const newRoot = {
          ...prevViewData,
          questionText: currentTopicNameFromStore || "",
        };
        setCurrentPath((prevPath) => [newRoot, ...prevPath.slice(1)]);
        return newRoot;
      }
      return prevViewData;
    });
  }, [currentTopicNameFromStore, currentTopicIdFromStore, topicId, setCurrentPath]);

  useEffect(() => {
    if (initialQuestionId && viewData) {
      const path = findPathToNode(viewData, initialQuestionId);
      if (path) {
        setCurrentPath(path);
      }
    }
  }, [initialQuestionId, viewData]);

  // viewMode가 graph로 변경될 때 currentPath를 초기화
  useEffect(() => {
    if (viewMode === "graph") {
      if (viewData && currentPath.length > 1) {
        setCurrentPath([viewData]);
      }
    }
  }, [viewMode, viewData, currentPath.length, setCurrentPath]);

  const currentQuestion = useMemo(
    () => (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null),
    [currentPath]
  );

  const navigateToQuestion = useCallback(
    (question: ViewData, index: number) => {
      setCurrentPath((prevPath) => prevPath.slice(0, index + 1));
    },
    [] // setCurrentPath는 안정적이므로 의존성 필요 없음
  );

  const addToPath = useCallback((question: ViewData) => {
    setCurrentPath((prevPath) => [...prevPath, question]);
  }, []);

  const goHome = useCallback(() => {
    if (viewData) {
      setCurrentPath([viewData]);
    }
  }, [viewData]);

  const handleGraphNodeClick = useCallback((node: ViewData) => {
    setSelectedNode(node);
  }, []);

  const refreshViewData = useCallback(async () => {
    if (!topicId) return;
    setIsLoading(true);
    try {
      const updatedResponse = await getTopicById(topicId);
      const newViewData = transformApiDataToViewData(updatedResponse);
      setViewData(newViewData);
      setCurrentPath([newViewData]);
    } catch (error) {
      console.error("Failed to refresh topic data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  const handleAddQuestion = useCallback(async () => {
    if (!prompt.trim() || !currentQuestion || !viewData) return;

    const parentId = currentQuestion.id;
    const tempId = `temp-question-${Date.now()}`;
    const optimisticPrompt = prompt;

    // 1. Create the optimistic node
    const optimisticNode: ViewData = {
      id: tempId,
      questionText: optimisticPrompt,
      answerText: "", // Empty answer for now
      children: [],
    };

    // 2. Optimistically update the UI
    const originalViewData = viewData;
    const updateData = (node: ViewData): ViewData => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, optimisticNode] };
      }
      return { ...node, children: node.children.map(updateData) };
    };
    const newViewData = updateData(viewData);
    setViewData(newViewData);

    // 3. Optimistically update the path
    const newPath = findPathToNode(newViewData, parentId);
    if (newPath) {
      setCurrentPath([...newPath, optimisticNode]);
    }

    // 4. Clear the prompt and set loading state
    setPrompt("");
    setIsLoading(true);

    try {
      // 5. Make the API call in the background
      const response = await askQuestion({
        questionText: optimisticPrompt,
        parentQuestionId: parentId,
      });

      const newQuestionId = Object.keys(response.nodes).find((id) => {
        const node = response.nodes[id];
        return id.startsWith("question-") && "questionText" in node && node.questionText === optimisticPrompt;
      });

      if (!newQuestionId) {
        throw new Error("New question not found in the API response.");
      }
      const newQuestionNode = response.nodes[newQuestionId] as QuestionNode;

      // 6. Update the optimistic node with the real data
      const finalUpdate = (node: ViewData): ViewData => {
        if (node.id === tempId) {
          return {
            ...node,
            id: newQuestionNode.questionId,
            answerText: newQuestionNode.answerText,
            // Children will be updated if the response contains them
          };
        }
        return { ...node, children: node.children.map(finalUpdate) };
      };

      setViewData((currentViewData) => {
        if (!currentViewData) return null;
        const finalViewData = finalUpdate(currentViewData);
        
        // Update path with the real ID
        const finalPath = findPathToNode(finalViewData, newQuestionNode.questionId);
        if (finalPath) {
          setCurrentPath(finalPath);
        }
        
        return finalViewData;
      });

    } catch (error) {
      console.error("Failed to add question:", error);
      toast.error("질문 추가에 실패했습니다. 이전 상태로 되돌립니다.");
      // Rollback on error
      setViewData(originalViewData);
      const oldPath = findPathToNode(originalViewData, parentId);
      if(oldPath) setCurrentPath(oldPath);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, currentQuestion, viewData, setViewData, setCurrentPath, setPrompt, setIsLoading]);

  // 질문 수정 함수(현재 UI만 변경)
  const handleEditQuestion = useCallback((question: ViewData) => {
    setEditingQuestion(question);
    setNewQuestion(question.questionText);
  }, []);

  // 질문 저장 함수
  // 현재 트리 상태 (currentPath 또는 TopicTreeResponse)에서 editingQuestion.id에 해당하는 노드를 찾아 질문/답변을 변경하는 코드가 아직 구현되지 않음.
  const handleSaveEdit = useCallback(async () => {
    if (!editingQuestion) return;
    const originalViewData = viewData;

    const updatedViewDataFn = (node: ViewData): ViewData => {
      if (node.id === editingQuestion.id) {
        return { ...node, questionText: newQuestion };
      }
      return {
        ...node,
        children: node.children.map((child) => updatedViewDataFn(child)),
      };
    };

    if (viewData) {
      setViewData(updatedViewDataFn(viewData));
    }

    try {
      await patchQuestion(editingQuestion.id, { newNodeName: newQuestion });
      toast.success("질문이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("Failed to save edit:", error);
      toast.error("질문 수정에 실패했습니다.");
      setViewData(originalViewData);
    } finally {
      setEditingQuestion(null);
    }
  }, [editingQuestion, newQuestion, viewData]);

  const handleSaveInPlaceEdit = useCallback(
    async (questionId: string, newText: string) => {
      if (!viewData || !currentQuestion) return;

      const originalViewData = viewData;
      const originalCurrentPath = currentPath;

      const updateNodeText = (node: ViewData): ViewData => {
        if (node.id === questionId) {
          return { ...node, questionText: newText };
        }
        return {
          ...node,
          children: node.children.map(updateNodeText),
        };
      };

      const newViewData = updateNodeText(viewData);
      const newPath = findPathToNode(newViewData, currentQuestion.id);

      setViewData(newViewData);
      if (newPath) {
        setCurrentPath(newPath);
      }

      try {
        await patchQuestion(questionId, { newNodeName: newText });
        toast.success("질문이 성공적으로 수정되었습니다.");
      } catch (error) {
        console.error("Failed to save in-place edit:", error);
        toast.error("질문 수정에 실패했습니다.");
        setViewData(originalViewData); // Rollback on error
        setCurrentPath(originalCurrentPath);
      }
    },
    [viewData, currentPath, currentQuestion]
  );

  // 질문 삭제 함수
  // currentPath나 전체 트리에서 해당 질문 노드를 찾아 제거하고, 상태 업데이트 로직 필요
  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      const originalViewData = viewData;
      const originalCurrentPath = currentPath;

      let newViewData: ViewData | null = null;
      let newCurrentPath: ViewData[] = [];

      // Optimistically update the UI
      const deleteNode = (node: ViewData): ViewData | null => {
        if (!node) return null;
        if (node.id === questionId) {
          return null; // This node is deleted
        }
        const newChildren = node.children
          .map((child) => deleteNode(child))
          .filter((child) => child !== null) as ViewData[];
        return { ...node, children: newChildren };
      };

      if (viewData) {
        newViewData = deleteNode(viewData);
        if (newViewData) {
          setViewData(newViewData);

          // Determine the new currentPath
          const deletedIsCurrent =
            currentQuestion && currentQuestion.id === questionId;
          if (deletedIsCurrent) {
            // If the current question is deleted, go up to its parent
            newCurrentPath = currentPath.slice(0, currentPath.length - 1);
          } else {
            // Otherwise, try to find the path to the current question in the new tree
            // This handles cases where a sibling or child of currentQuestion was deleted
            if (currentQuestion) {
              const path = findPathToNode(newViewData, currentQuestion.id);
              if (path) {
                newCurrentPath = path;
              } else {
                // If currentQuestion is no longer found (e.g., its parent was deleted),
                // revert to root or handle appropriately. For now, revert to root.
                newCurrentPath = [newViewData];
              }
            } else {
              // No current question, just set to root
              newCurrentPath = [newViewData];
            }
          }
          setCurrentPath(newCurrentPath);
        } else {
          // If the root node is deleted (unlikely for questions), handle appropriately
          setViewData(null);
          setCurrentPath([]);
        }
      }

      try {
        await deleteQuestion(questionId);
        toast.success("질문이 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("Failed to delete question:", error);
        toast.error("질문 삭제에 실패했습니다.");
        setViewData(originalViewData); // Rollback on error
        setCurrentPath(originalCurrentPath); // Rollback path
      }
    },
    [viewData, currentPath, currentQuestion]
  );

  return useMemo(
    () => ({
      viewData,
      currentPath,
      setCurrentPath,
      viewMode,
      prompt,
      isLoading,
      editingQuestion,
      newQuestion,
      scrollAreaRef,
      currentQuestion,
      setViewMode,
      setPrompt,
      setEditingQuestion,
      setNewQuestion,
      navigateToQuestion,
      addToPath,
      goHome,
      handleGraphNodeClick,
      handleAddQuestion,
      handleEditQuestion,
      handleSaveEdit,
      handleSaveInPlaceEdit,
      handleDeleteQuestion,
      selectedNode,
      setSelectedNode,
      focusedNodeId,
      setFocusedNodeId,
      refreshViewData,
    }),
    [
      viewData,
      currentPath,
      viewMode,
      prompt,
      isLoading,
      editingQuestion,
      newQuestion,
      currentQuestion,
      navigateToQuestion,
      addToPath,
      goHome,
      handleGraphNodeClick,
      handleAddQuestion,
      handleEditQuestion,
      handleSaveEdit,
      handleSaveInPlaceEdit,
      handleDeleteQuestion,
      selectedNode,
      focusedNodeId,
      refreshViewData,
    ]
  );
};
