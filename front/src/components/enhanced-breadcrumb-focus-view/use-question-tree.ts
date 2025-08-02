import { useState, useEffect, useRef } from "react";
import { askQuestion, QuestionNode } from "@/api/questions";
import {
  ViewData,
  TopicTreeResponse,
  transformApiDataToViewData,
} from "@/lib/data-transformer";
import { findPathToNode } from "@/lib/utils";

// 상태 및 동작 커스텀 훅
export const useQuestionTree = (initialResponse: TopicTreeResponse) => {
  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [currentPath, setCurrentPath] = useState<ViewData[]>([]); // 현재 선택된 질문까지의 경로
  const [viewMode, setViewMode] = useState<"chat" | "graph">("chat");
  const [prompt, setPrompt] = useState(""); // follow-up 입력값
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ViewData | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ViewData | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // 시작 질문 노드를 currentPath의 첫 요소로 등록
  useEffect(() => {
    const initialViewData = transformApiDataToViewData(initialResponse);
    setViewData(initialViewData);
    setCurrentPath([initialViewData]);
  }, [initialResponse]);

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
    setNewAnswer(question.answerText);
  };

  // 질문 저장 함수
  // 현재 트리 상태 (currentPath 또는 TopicTreeResponse)에서 editingQuestion.id에 해당하는 노드를 찾아 질문/답변을 변경하는 코드가 아직 구현되지 않음.
  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    console.log("Save edit is not implemented for TopicTreeResponse yet.");
    setEditingQuestion(null);
  };

  // 질문 삭제 함수
  // currentPath나 전체 트리에서 해당 질문 노드를 찾아 제거하고, 상태 업데이트 로직 필요
  const handleDeleteQuestion = () => {
    console.log(
      "Delete question is not implemented for TopicTreeResponse yet."
    );
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
    newAnswer,
    scrollAreaRef,
    currentQuestion,
    setViewMode,
    setPrompt,
    setEditingQuestion,
    setNewQuestion,
    setNewAnswer,
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
  };
};
