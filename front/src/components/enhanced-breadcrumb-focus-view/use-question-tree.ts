
import { useState, useEffect, useRef } from 'react';
import { askQuestion } from '@/api/questions';
import { ViewData, TopicTreeResponse, transformApiDataToViewData } from '@/lib/data-transformer';

export const useQuestionTree = (initialResponse: TopicTreeResponse, onDataChange: (newResponse: TopicTreeResponse) => void) => {
  const [currentPath, setCurrentPath] = useState<ViewData[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'graph'>('chat');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ViewData | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const scrollAreaRef = useRef<any>(null);

  useEffect(() => {
    const initialViewData = transformApiDataToViewData(initialResponse);
    setCurrentPath([initialViewData]);
  }, [initialResponse]);

  const currentQuestion = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  const navigateToQuestion = (question: ViewData, index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const addToPath = (question: ViewData) => {
    setCurrentPath([...currentPath, question]);
  };

  const goHome = () => {
    setCurrentPath(currentPath.slice(0, 1));
  };

  const handleGraphNodeClick = (node: any) => {
    // D3 그래프 노드 클릭 시 해당 경로로 이동하는 로직 (구현 필요)
    console.log("Graph node clicked:", node);
  };

  const handleAddQuestion = async () => {
    if (!prompt.trim() || !currentQuestion) return;
    setIsLoading(true);

    try {
      const parentId = currentQuestion.id;

      const response = await askQuestion({
        question: prompt,
        parentQuestionId: parentId,
      });

      // Find the new question node from the response
      const newQuestionId = Object.keys(response.nodes).find(id => id.startsWith('question-'));
      if (!newQuestionId) {
        throw new Error("New question not found in the API response.");
      }
      const newQuestionNode = response.nodes[newQuestionId] as any; // Type assertion

      // Optimistically update the UI
      const newViewDataNode: ViewData = {
        id: newQuestionNode.questionId,
        question: newQuestionNode.question,
        answer: newQuestionNode.answer,
        children: [],
      };

      // Find the parent node in the current state and add the new node
      const updateNode = (node: ViewData): ViewData => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...node.children, newViewDataNode],
          };
        }
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      };
      
      const newPath = currentPath.map(updateNode);

      // If the current question is a topic, we don't add the new question to the path
      // but we need to update the data.
      if (currentQuestion.id.startsWith("topic")) {
        setCurrentPath(newPath);
      } else {
        setCurrentPath([...newPath, newViewDataNode]);
      }

      // Notify parent of the change with the new node
      // This part might need adjustment based on how you want to handle the state update in the parent
      // For now, we'll just log it.
      console.log("New question added:", newQuestionNode);


    } catch (error) {
      console.error("Failed to add question:", error);
    } finally {
      setPrompt('');
      setIsLoading(false);
    }
  };
  

  const handleEditQuestion = (question: ViewData) => {
    setEditingQuestion(question);
    setNewQuestion(question.question);
    setNewAnswer(question.answer);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    // This part needs to be updated to work with TopicTreeResponse
    // For now, it will not work as expected.
    console.log("Save edit is not implemented for TopicTreeResponse yet.");
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    // This part needs to be updated to work with TopicTreeResponse
    // For now, it will not work as expected.
    console.log("Delete question is not implemented for TopicTreeResponse yet.");
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
