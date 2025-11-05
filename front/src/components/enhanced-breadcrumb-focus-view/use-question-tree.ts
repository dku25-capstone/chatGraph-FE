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

  // 수정 모드가 가질 수 있는 3가지 상태
  type ModifyMode = "IDLE" | "SELECT_CHILD" | "SELECT_PARENT";

  // '부모 변경 확인' 모달에 필요한 데이터 타입 정의
  interface ReparentRequest {
    movedNode: ViewData;
    newParentNode: ViewData;
  }

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
  // 현재 모드를 저장할 상태
  const [modifyMode, setModifyMode] = useState<ModifyMode>("IDLE"); // 기본값은 기본상태
  // 이동시킬 노드를 저장할 상태
  const [nodeToMove, setNodeToMove] = useState<ViewData | null>(null);
  // "부모 변경 확인" 모달을 위한 상태
  const [reparentRequest, setReparentRequest] =
    useState<ReparentRequest | null>(null);

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
        // 조건이 맞으면 새로운 상태 반환
        return {
          ...prevViewData,
          questionText: currentTopicNameFromStore || "",
        };
      }
      // 조건이 맞지 않으면 반드시 이전 상태를 그대로 반환
      return prevViewData;
    });
    // useEffect는 오직 스토어의 값이 변경될 때만 로직을 다시 실행
  }, [currentTopicNameFromStore, currentTopicIdFromStore, topicId]);

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

  const handleGraphNodeClick = useCallback(
    (clickedNode: ViewData) => {
      // 현재 수정 모드에 따라 분기
      switch (modifyMode) {
        // 기본모드(IDLE)이면 노드 상세보기
        case "IDLE":
          setSelectedNode(clickedNode);
          break;

        // 이동할 노드 선택
        case "SELECT_CHILD":
          setNodeToMove(clickedNode); // 이동할 노드 상태에 저장
          setModifyMode("SELECT_PARENT"); // 다음 단계(부모 선택)으로 변경
          toast.info(
            `'${clickedNode.questionText}' 선택됨. 새 부모 노드를 클릭하세요.`
          );
          break;

        // 새 부모 노드 선택
        case "SELECT_PARENT":
          const newParentNode = clickedNode; // 선택한 노드가 새 부모 노드

          // 이동할 노드의 현재 부모를 찾음
          const pathToMovedNode = findPathToNode(viewData!, nodeToMove!.id);

          const currentParent =
            pathToMovedNode && pathToMovedNode.length > 1
              ? pathToMovedNode[pathToMovedNode.length - 2]
              : null;

          // 유효성 검사

          // 자기 자신을 부모로 선택한 경우
          if (nodeToMove && newParentNode.id === nodeToMove.id) {
            toast.error("자기 자신을 부모로 선택할 수 없습니다.");
            return;
          }

          // 이미 현재 부모인 노드를 부모로 선택하는 경우
          if (currentParent && newParentNode.id === currentParent.id) {
            toast.error("이미 현재 부모 노드입니다.");
            return;
          }

          // 자신의 자식/손자 노드를 부모로 선택한 경우
          const path = findPathToNode(viewData!, newParentNode.id);
          if (path && path.some((p) => p.id === nodeToMove!.id)) {
            toast.error("선택한 노드의 하위노드로는 이동할 수 없습니다.");
            return;
          }

          toast.info(`'${newParentNode.questionText} 선택됨.'`);
          // 유효성 통과
          setReparentRequest({
            movedNode: nodeToMove!,
            newParentNode: newParentNode,
          });
          break;
      }
    },
    [
      modifyMode,
      nodeToMove,
      viewData,
      setModifyMode,
      setNodeToMove,
      setSelectedNode,
      setReparentRequest,
    ]
  );

  // 수정 버튼을 눌렀을 때 실행할 함수
  const startModifyMode = useCallback(() => {
    // 모드 설정
    setModifyMode("SELECT_CHILD");
    // '수정할 노드를 선택하세요' 안내 토스트 띄움
    toast.info("관계를 수정할 노드를 선택하세요.");
  }, [setModifyMode]);

  // 취소 버튼을 눌렀을 때 실행할 함수
  const cancelModifyMode = useCallback(() => {
    setModifyMode("IDLE"); // 다시 기본값으로 변경
    setNodeToMove(null); // 선택했던 노드가 있으면 초기화
    setReparentRequest(null); // 모달 닫기
    toast.dismiss(); // 띄워둔 토스트 알림 닫기
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
  }, [prompt, currentQuestion, viewData]);

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
      handleDeleteQuestion,
      selectedNode,
      setSelectedNode,
      focusedNodeId,
      setFocusedNodeId,
      refreshViewData,
      modifyMode,
      startModifyMode,
      cancelModifyMode,
      reparentRequest,
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
      handleDeleteQuestion,
      selectedNode,
      focusedNodeId,
      refreshViewData,
      modifyMode,
      startModifyMode,
      cancelModifyMode,
      reparentRequest,
    ]
  );
};
