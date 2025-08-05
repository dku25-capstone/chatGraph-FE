import { useState, useEffect, useRef } from "react";
import { askQuestion, getTopicById, QuestionNode, deleteQuestion, patchQuestion } from "@/api/questions";
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
  const [viewData, setViewData] = useState<ViewData | null>(() =>
    transformApiDataToViewData(initialResponse)
  );
  const [currentPath, setCurrentPath] = useState<ViewData[]>(() => {
    const root = transformApiDataToViewData(initialResponse);
    return [root];
  }); // 현재 선택된 질문까지의 경로
  const [viewMode, setViewMode] = useState<"chat" | "graph">("chat");
  const [prompt, setPrompt] = useState(""); // follow-up 입력값
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ViewData | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ViewData | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Update topic store when viewData changes (initial load or refresh)
  useEffect(() => {
    if (viewData && topicId) {
      useTopicStore.getState().setTopic(topicId, viewData.questionText);
    }
  }, [viewData, topicId]);

  // Listen for changes in the topic store (from app-sidebar)
  useEffect(() => {
    const currentTopicNameFromStore = useTopicStore.getState().currentTopicName;
    if (viewData && useTopicStore.getState().currentTopicId === topicId && currentTopicNameFromStore !== viewData.questionText) {
      setViewData((prevViewData) => {
        if (!prevViewData) return null;
        return { ...prevViewData, questionText: currentTopicNameFromStore || "" };
      });
    }
  }, [useTopicStore.getState().currentTopicName, viewData, topicId]);

  // 시작 질문 노드를 currentPath의 첫 요소로 등록
  // useEffect(() => {
  //   const initialViewData = transformApiDataToViewData(initialResponse);
  //   setViewData(initialViewData);
  //   setCurrentPath([initialViewData]);
  // }, [initialResponse]);

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

  const currentQuestion =
    currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  const navigateToQuestion = (question: ViewData, index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const addToPath = (question: ViewData) => {
    setCurrentPath([...currentPath, question]);
  };

  const goHome = () => {
    if (viewData) {
      setCurrentPath([viewData]);
    }
  };

  const handleGraphNodeClick = (node: ViewData) => {
    // D3 그래프 노드 클릭 시 해당 경로로 이동하는 로직 (구현 필요)
    console.log("Graph node clicked:", node);
    setSelectedNode(node);
  };

  const refreshViewData = async () => {
    if (!topicId) return;
    setIsLoading(true);
    try {
      const updatedResponse = await getTopicById(topicId);
      const newViewData = transformApiDataToViewData(updatedResponse);
      setViewData(newViewData);
      // Optionally, reset currentPath or adjust it based on the new viewData
      // For now, let's keep it simple and assume initial path is sufficient or will be re-calculated
      setCurrentPath([newViewData]); // Reset to root of the new data
    } catch (error) {
      console.error("Failed to refresh topic data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!prompt.trim() || !currentQuestion || !viewData) return;
    setIsLoading(true);

    try {
      const parentId = currentQuestion.id;

      const response = await askQuestion({
        questionText: prompt,
        parentQuestionId: parentId,
      });

      // 백엔드가 생성한 새로운 질문 노드의 id 찾기
      const newQuestionId = Object.keys(response.nodes).find((id) =>
        id.startsWith("question-")
      );
      if (!newQuestionId) {
        throw new Error("New question not found in the API response.");
      }
      const newQuestionNode = response.nodes[newQuestionId] as QuestionNode; // 새 질문 노드를 변수에 저장

      // follow-up 질문을 즉시 UI에 반영하기 위한 낙관적 업데이트
      const newViewDataNode: ViewData = {
        id: newQuestionNode.questionId,
        questionText: newQuestionNode.questionText,
        answerText: newQuestionNode.answerText,
        children: [],
      };

      // 전체 viewData를 업데이트
      const updateData = (node: ViewData): ViewData => {
        if (node.id === parentId) {
          return { ...node, children: [...node.children, newViewDataNode] };
        }
        return { ...node, children: node.children.map(updateData) };
      };
      const newViewData = updateData(viewData);
      setViewData(newViewData);

      // 새로운 경로를 찾아서 업데이트
      const newPath = findPathToNode(newViewData, parentId);
      if (newPath) {
        setCurrentPath([...newPath, newViewDataNode]);
      }

      console.log("New question added:", newQuestionNode);
    } catch (error) {
      console.error("Failed to add question:", error);
    } finally {
      setPrompt("");
      setIsLoading(false);
    }
  };

  // 질문 수정 함수(현재 UI만 변경)
  const handleEditQuestion = (question: ViewData) => {
    setEditingQuestion(question);
    setNewQuestion(question.questionText);
  };

  // 질문 저장 함수
  // 현재 트리 상태 (currentPath 또는 TopicTreeResponse)에서 editingQuestion.id에 해당하는 노드를 찾아 질문/답변을 변경하는 코드가 아직 구현되지 않음.
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    const originalViewData = viewData; // Store original data for rollback

    // Optimistically update the UI
    const updatedViewData = (node: ViewData): ViewData => {
      if (node.id === editingQuestion.id) {
        return { ...node, questionText: newQuestion };
      }
      return {
        ...node,
        children: node.children.map((child) => updatedViewData(child)),
      };
    };

    if (viewData) {
      setViewData(updatedViewData(viewData));
    }

    try {
      await patchQuestion(editingQuestion.id, { newNodeName: newQuestion });
      toast.success("질문이 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("Failed to save edit:", error);
      toast.error("질문 수정에 실패했습니다.");
      setViewData(originalViewData); // Rollback on error
    } finally {
      setEditingQuestion(null);
    }
  };

  // 질문 삭제 함수
  // currentPath나 전체 트리에서 해당 질문 노드를 찾아 제거하고, 상태 업데이트 로직 필요
  const handleDeleteQuestion = async (questionId: string) => {
    const originalViewData = viewData; // Store original data for rollback
    const originalCurrentPath = currentPath; // Store original path for rollback

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
        const deletedIsCurrent = currentQuestion && currentQuestion.id === questionId;
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
  };

  return {
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
    handleDeleteQuestion,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
    refreshViewData,
  };
};
