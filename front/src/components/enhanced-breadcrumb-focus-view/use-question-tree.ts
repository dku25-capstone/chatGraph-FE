
import { useState, useEffect, useRef } from 'react';
interface ViewData {
  id: string;
  question: string;
  answer: string;
  children: ViewData[];
}

export const useQuestionTree = (initialData: ViewData, onDataChange: (newData: ViewData) => void) => {
  const [currentPath, setCurrentPath] = useState<ViewData[]>([initialData]);
  const [viewMode, setViewMode] = useState<'chat' | 'graph'>('chat');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ViewData | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const scrollAreaRef = useRef<any>(null);

  const currentQuestion = currentPath[currentPath.length - 1];

  useEffect(() => {
    setCurrentPath([initialData]);
  }, [initialData]);

  const navigateToQuestion = (question: ViewData, index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const addToPath = (question: ViewData) => {
    setCurrentPath([...currentPath, question]);
  };

  const goHome = () => {
    setCurrentPath([currentPath[0]]);
  };

  const handleGraphNodeClick = (node: any) => {
    // D3 그래프 노드 클릭 시 해당 경로로 이동하는 로직 (구현 필요)
    console.log("Graph node clicked:", node);
  };

  const handleAddQuestion = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    // TODO: API 호출로 질문을 서버에 저장해야 합니다.
    // 현재는 클라이언트 측에서만 데이터를 수정합니다.
    const newQuestionNode: ViewData = {
      id: `question-${Date.now()}`,
      question: prompt,
      answer: "This is a new answer.", // 실제로는 AI의 답변을 받아야 함
      children: [],
    };

    const updatedData = { ...initialData }; // 전체 데이터 복사
    const parentNode = findNodeById(updatedData, currentQuestion.id);
    if (parentNode) {
      parentNode.children.push(newQuestionNode);
    }

    onDataChange(updatedData);
    setPrompt('');
    setIsLoading(false);
  };

  const handleEditQuestion = (question: ViewData) => {
    setEditingQuestion(question);
    setNewQuestion(question.question);
    setNewAnswer(question.answer);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;

    const updatedData = { ...initialData };
    const nodeToUpdate = findNodeById(updatedData, editingQuestion.id);
    if (nodeToUpdate) {
      nodeToUpdate.question = newQuestion;
      nodeToUpdate.answer = newAnswer;
    }

    onDataChange(updatedData);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedData = { ...initialData };
    removeNodeById(updatedData, id);
    onDataChange(updatedData);
    // 현재 경로에 삭제된 노드가 포함되어 있다면 경로를 수정해야 합니다.
    const newPath = currentPath.filter(q => q.id !== id);
    setCurrentPath(newPath.length > 0 ? newPath : [initialData]);
  };

  // Helper functions to find and manipulate nodes in the tree
  const findNodeById = (node: ViewData, id: string): ViewData | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const removeNodeById = (node: ViewData, id: string) => {
    node.children = node.children.filter(child => child.id !== id);
    for (const child of node.children) {
      removeNodeById(child, id);
    }
  };

  return {
    currentPath,
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
  };
};
