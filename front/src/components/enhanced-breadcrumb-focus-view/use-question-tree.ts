import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  askQuestion,
  getTopicById,
  QuestionNode,
  deleteQuestion,
  patchQuestion,
  type CopyQuestionRequest,
  copyQuestions,
  deleteQuestionBatch,
  separateQuestions,
  toggleFavoriteQuestion, // 별칭 없이 원래 이름으로 import
} from "@/api/questions";
import {
  ViewData,
  TopicTreeResponse,
  transformApiDataToViewData,
} from "@/lib/data-transformer";
import { findPathToNode } from "@/lib/utils";
import { toast } from "sonner";
import { useTopicStore } from "@/lib/topic-store";
import { useRouter } from "next/navigation";

/* ViewData 노드 받아서, 그 노드를 포함한 모든 하위 노드의 ID를
 재귀적으로 수집하여 1차원 배열로 반환하는 함수 */
function getAllIdsFromNode(node: ViewData): string[] {
  // 현재 노드의 ID
  const currentId = node.id;

  // 모든 자식 노드에 대해 함수 재귀 호출, 결과 ID 배열을 1차원 배열로 합침
  const descendantsIds = node.children.flatMap((child) =>
    getAllIdsFromNode(child)
  );

  // 현재 ID와 모든 하위 ID를 합쳐서 반환
  return [currentId, ...descendantsIds];
}

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
  type ModifyMode =
    | "IDLE"
    | "SELECT_CHILD"
    | "SELECT_PARENT"
    | "SELECT_NODE_TO_MOVE_OTHER"
    | "SELECT_NODE_TO_SPLIT";

  // '부모 변경 확인' 모달에 필요한 데이터 타입 정의
  interface ReparentRequest {
    movedNode: ViewData;
    newParentNode: ViewData;
  }

  // "새 토픽 분리" 확인 모달용 데이터 타입 정의
  interface SplitRequest {
    nodeToSplit: ViewData;
  }

  // 다른 토픽으로 이동 최종 확인 모달에 필요한 데이터 타입
  interface MoveToTopicRequest {
    movedNode: ViewData;
    targetTopic: { id: string; name: string };
    targetParentId: string;
    targetParentNode: { id: string; name: string };
  }

  const [viewData, setViewData] = useState<ViewData | null>(initialViewData);
  const [currentPath, setCurrentPath] = useState<ViewData[]>([initialViewData]); // 현재 선택된 질문까지의 경로
  const [viewMode, setViewMode] = useState<"chat" | "graph">("chat");
  const [prompt, setPrompt] = useState(""); // follow-up 입력값
  const [isLoading, setIsLoading] = useState(false);
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
  // 다른 토픽으로 이동 관련 상태
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
  const [moveToTopicRequest, setMoveTopicRequest] =
    useState<MoveToTopicRequest | null>(null);
  // 분리 요청 상태
  const [splitRequest, setSplitRequest] = useState<SplitRequest | null>(null);

  const router = useRouter();

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
  }, [
    currentTopicNameFromStore,
    currentTopicIdFromStore,
    topicId,
    setCurrentPath,
  ]);

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

        case "SELECT_NODE_TO_SPLIT":
          toast.info(`'${clickedNode.questionText}' 노드를 선택했습니다.`);
          setSplitRequest({
            nodeToSplit: clickedNode,
          });
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

        case "SELECT_NODE_TO_MOVE_OTHER":
          setNodeToMove(clickedNode); // 이동할 노드 저장
          setIsTopicSelectorOpen(true); // '토픽 선택 모달' 띄우기
          setModifyMode("IDLE"); // 임시로 IDLE로 돌리고, "토픽 선택 모달" 띄움
          toast.info(
            `'${clickedNode.questionText}' 선택됨. 이동할 토픽을 선택하세요.`
          );
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
      setSplitRequest,
    ]
  );

  // 다른 토픽으로 이동 버튼을 눌렀을 때 실행할 함수
  const moveToOtherMode = useCallback(() => {
    // 모드 설정
    setModifyMode("SELECT_NODE_TO_MOVE_OTHER");
    toast.info("다른 토픽으로 이동할 질문을 선택하세요.");
  }, []);

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
    setSplitRequest(null);
    setIsTopicSelectorOpen(false);
    setMoveTopicRequest(null);
    toast.dismiss(); // 띄워둔 토스트 알림 닫기
  }, []);

  // 새 토픽으로 분리 버튼 클릭 시 실행
  const startSplitMode = useCallback(() => {
    setModifyMode("SELECT_NODE_TO_SPLIT");
    toast.info("새로운 토픽으로 분리할 시작 노드를 선택하세요.");
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

  // 확인 모달에서 '이동' 눌렀을 때 실행할 함수
  const confirmReparenting = useCallback(async () => {
    if (!reparentRequest) return;
    const { movedNode, newParentNode } = reparentRequest;

    toast.loading("노드 트리를 이동하는 중...");

    try {
      // movedNode와 그 모든 하위 노드의 ID를 수집
      const allIdsToCopy = getAllIdsFromNode(movedNode);

      console.log("복사할 전체 노드 ID 목록: ", allIdsToCopy);

      const requestData: CopyQuestionRequest = {
        // 전체 ID 배열을담아서 전달
        sourceQuestionIds: allIdsToCopy,
        // newParentNode의 ID를 새 부모 ID로 전달
        targetParentId: newParentNode.id,
      };

      // copyQuestions api 호출
      await copyQuestions(requestData);

      // 원본 삭제
      await deleteQuestionBatch(allIdsToCopy);

      // 데이터가 변경되었으므로 그래프 전체 새로고침
      await refreshViewData();

      toast.success("노드 이동이 완료되었습니다.");
    } catch (error) {
      console.error("노드 복사 실패:", error);
      toast.error("노드 복사가 실패했습니다.");
    } finally {
      // 모든 상태를 초기화하고 모달 닫음
      cancelModifyMode();
    }
  }, [reparentRequest, refreshViewData, cancelModifyMode]);

  // "다른 토픽 이동"을 최종 실행하는 함수(모달의 '이동' 버튼)
  const confirmMoveToOtherTopic = useCallback(async () => {
    if (!moveToTopicRequest) return;

    const { movedNode, targetParentId } = moveToTopicRequest;

    toast.loading("다른 토픽으로 노드를 이동하는 중...");

    try {
      // 복사할 ID 전체 수집
      const allIdsToCopy = getAllIdsFromNode(movedNode);

      // 복사
      await copyQuestions({
        sourceQuestionIds: allIdsToCopy,
        targetParentId: targetParentId,
      });

      // 원본 삭제
      await deleteQuestionBatch(allIdsToCopy);

      // 갱신
      await refreshViewData(); // 현재 토픽 갱신
      toast.success("노드 이동이 완료되었습니다.");
    } catch (error) {
      console.error("다른 토픽으로 이동 실패:", error);
      toast.error("노드 이동에 실패했습니다.");
    } finally {
      cancelModifyMode();
    }
  }, [moveToTopicRequest, refreshViewData, cancelModifyMode]);

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
      favorite: false
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
        return (
          id.startsWith("question-") &&
          "questionText" in node &&
          node.questionText === optimisticPrompt
        );
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
        const finalPath = findPathToNode(
          finalViewData,
          newQuestionNode.questionId
        );
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
      if (oldPath) setCurrentPath(oldPath);
    } finally {
      setIsLoading(false);
    }
  }, [
    prompt,
    currentQuestion,
    viewData,
    setViewData,
    setCurrentPath,
    setPrompt,
    setIsLoading,
  ]);

  // 인라인 수정을 위한 저장 함수. MessageBubble과 SubQuestionList에서 사용됨.
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

  const { fetchTopics } = useTopicStore();

  // 분리 확인 모달에서 확인을 눌렀을때 실행
  const confirmSplitTopic = useCallback(async () => {
    if (!splitRequest) return;
    const { nodeToSplit } = splitRequest;

    toast.loading("새 토픽으로 분리(이동)하는 중...");

    try {
      // 이동할 전체 줄기 ID 수집
      const allIdsToMove = getAllIdsFromNode(nodeToSplit);

      // separations API 호출 -> 새 토픽 생성, ID 발급
      const separationResponse = await separateQuestions({
        sourceQuestionIds: allIdsToMove,
      });
      const newTopicId = separationResponse.newTopicId;
      console.log("새 토픽 생성됨!:", newTopicId);

      // 원본 삭제
      await deleteQuestionBatch(allIdsToMove);
      await fetchTopics();
      toast.success("새 토픽으로 분리가 완료되었습니다!");

      // 새 토픽 페이지로 이동
      router.push(`/${newTopicId}`);
    } catch (error) {
      console.error("새 토픽으로 분리 실패:", error);
      toast.error("새 토픽으로 분리하는데 실패했습니다.");
    } finally {
      cancelModifyMode();
    }
  }, [splitRequest, router, cancelModifyMode, fetchTopics]);

  // 질문 삭제 함수
  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      // 롤백을 위해 원본 상태 저장
      const originalViewData = viewData;
      const originalCurrentPath = currentPath;

      if (!viewData || !currentQuestion) return;

      // 1. 안전한 조작을 위해 데이터의 깊은 복사본 생성
      const newViewData = JSON.parse(JSON.stringify(viewData));

      // 2. 새로운 트리에서 삭제할 노드의 부모 경로 찾기
      const parentId = (findPathToNode(newViewData, questionId) || []).slice(
        -2,
        -1
      )[0]?.id;
      const parentPath = parentId
        ? findPathToNode(newViewData, parentId)
        : null;

      // 루트 노드의 직계 자식을 삭제하는 경우 처리
      if (!parentPath) {
        const nodeToDeleteIndex = newViewData.children.findIndex(
          (c: ViewData) => c.id === questionId
        );
        if (nodeToDeleteIndex !== -1) {
          const nodeToDelete = newViewData.children[nodeToDeleteIndex];
          // 자식 승계 로직: 삭제할 노드의 자식들을 부모(여기서는 루트)의 자식으로 추가
          newViewData.children.splice(
            nodeToDeleteIndex,
            1,
            ...nodeToDelete.children
          );

          // 상태 업데이트: viewData를 새 트리로, 경로는 루트로 설정
          setViewData(newViewData);
          setCurrentPath([newViewData]);
        }
      } else {
        // 일반적인 자식 노드를 삭제하는 경우
        const parentNode = parentPath[parentPath.length - 1];
        const nodeToDeleteIndex = parentNode.children.findIndex(
          (c: ViewData) => c.id === questionId
        );

        if (nodeToDeleteIndex === -1) return;

        const nodeToDelete = parentNode.children[nodeToDeleteIndex];
        const childrenToReparent = nodeToDelete.children;

        // 3. 자식 승계 및 노드 삭제 실행
        parentNode.children.splice(nodeToDeleteIndex, 1, ...childrenToReparent);

        // 4. 화면 이동을 위한 새로운 경로 계산
        let newCurrentPath;
        if (currentQuestion.id === questionId) {
          // 현재 보고 있는 질문을 삭제했다면, 계산된 부모 경로로 이동
          newCurrentPath = parentPath;
        } else {
          // 현재 질문의 자식 노드를 삭제했다면, 현재 경로는 유지하되,
          // 데이터가 변경되었으므로 findPathToNode로 경로를 다시 찾아 동기화
          newCurrentPath = findPathToNode(newViewData, currentQuestion.id) || [
            newViewData,
          ];
        }

        // 5. viewData와 currentPath 상태를 원자적으로 업데이트하여 UI 동기화
        setViewData(newViewData);
        setCurrentPath(newCurrentPath);
      }

      // 6. 백엔드 API 호출 및 실패 시 롤백
      try {
        await deleteQuestion(questionId);
        toast.success("질문이 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("Failed to delete question:", error);
        toast.error("질문 삭제에 실패했습니다.");
        setViewData(originalViewData);
        setCurrentPath(originalCurrentPath);
      }
    },
    [viewData, currentPath, currentQuestion, setViewData, setCurrentPath]
  );

  // [수정] 함수 이름 변경 및 내부에서 API 함수 호출 방식 변경
  const handleToggleFavoriteQuestion = useCallback(
    async (questionId: string) => {
      // viewData뿐만 아니라 currentPath도 체크
      if (!viewData || currentPath.length === 0) return;

      const originalViewData = viewData;
      // 롤백을 위해 현재 경로도 백업
      const originalCurrentPath = currentPath;

      // 낙관적 업데이트 (UI 먼저 변경)
      const updateFavoriteStatus = (node: ViewData): ViewData => {
        if (node.id === questionId) {
          return { ...node, favorite: !node.favorite };
        }
        return {
          ...node,
          children: node.children.map(updateFavoriteStatus),
        };
      };

      // 1. 전체 트리 데이터 업데이트
      const newViewData = updateFavoriteStatus(viewData);
      setViewData(newViewData);

      // 2. [추가됨] 현재 경로 업데이트
      // 변경된 새 트리(newViewData)에서 현재 보고 있는 마지막 질문(currentPath의 마지막 요소)까지의 경로를 다시 찾습니다.
      const currentQuestionId = currentPath[currentPath.length - 1].id;
      const newPath = findPathToNode(newViewData, currentQuestionId);

      if (newPath) {
        setCurrentPath(newPath);
      }

      try {
        // [수정 완료] import한 API 함수(toggleFavoriteQuestion)를 호출
        await toggleFavoriteQuestion(questionId);
        toast.success("즐겨찾기 상태가 변경되었습니다.");
      } catch (error) {
        console.error("Failed to toggle favorite status:", error);
        toast.error("즐겨찾기 상태 변경에 실패했습니다.");
        // 롤백
        setViewData(originalViewData);
        // [추가됨] 경로도 롤백
        setCurrentPath(originalCurrentPath);
      }
    },
    // 의존성 배열에 currentPath 추가
    [viewData, currentPath]
  );

  return useMemo(
    () => ({
      viewData,
      currentPath,
      setCurrentPath,
      viewMode,
      prompt,
      isLoading,
      scrollAreaRef,
      currentQuestion,
      setViewMode,
      setPrompt,
      navigateToQuestion,
      addToPath,
      goHome,
      handleGraphNodeClick,
      handleAddQuestion,
      handleSaveInPlaceEdit,
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
      confirmReparenting,
      moveToOtherMode,
      confirmMoveToOtherTopic,
      nodeToMove,
      isTopicSelectorOpen,
      setIsTopicSelectorOpen,
      moveToTopicRequest,
      setMoveTopicRequest,
      startSplitMode,
      splitRequest,
      confirmSplitTopic,
      // [수정] 변경된 함수 이름으로 반환
      toggleFavoriteQuestion: handleToggleFavoriteQuestion,
    }),
    [
      viewData,
      currentPath,
      viewMode,
      prompt,
      isLoading,
      currentQuestion,
      navigateToQuestion,
      addToPath,
      goHome,
      handleGraphNodeClick,
      handleAddQuestion,
      handleSaveInPlaceEdit,
      handleDeleteQuestion,
      selectedNode,
      focusedNodeId,
      refreshViewData,
      modifyMode,
      startModifyMode,
      cancelModifyMode,
      reparentRequest,
      confirmReparenting,
      moveToOtherMode,
      confirmMoveToOtherTopic,
      nodeToMove,
      isTopicSelectorOpen,
      setIsTopicSelectorOpen,
      moveToTopicRequest,
      setMoveTopicRequest,
      startSplitMode,
      splitRequest,
      confirmSplitTopic,
      // [수정] 변경된 함수 이름으로 의존성 배열에 추가
      handleToggleFavoriteQuestion,
    ]
  );
};