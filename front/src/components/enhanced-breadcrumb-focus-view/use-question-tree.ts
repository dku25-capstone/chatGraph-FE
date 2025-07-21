import { useState, useCallback, useRef } from 'react';
import { Question } from '@/lib/data';

export const useQuestionTree = (initialData: Question, onDataChange: (newData: Question) => void) => {
  const [currentPath, setCurrentPath] = useState<Question[]>([initialData]);
  const [viewMode, setViewMode] = useState<'chat' | 'graph'>('chat');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentQuestion = currentPath[currentPath.length - 1];

  const simulateAIResponse = useCallback(async (prompt: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const responses = [
      `Great question about "${prompt}". This is a fascinating topic that involves multiple interconnected concepts. Let me break this down for you with detailed explanations and practical examples.`,
      `Excellent inquiry regarding "${prompt}". This subject has been extensively researched and has significant implications across various domains. Here's a comprehensive overview of the key aspects.`,
      `That's a thoughtful question about "${prompt}". Understanding this concept requires examining both theoretical foundations and real-world applications. Let me provide you with a thorough explanation.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const navigateToQuestion = useCallback((question: Question, pathIndex: number) => {
    setCurrentPath(currentPath.slice(0, pathIndex + 1));
  }, [currentPath]);

  const addToPath = useCallback((question: Question) => {
    setCurrentPath([...currentPath, question]);
  }, [currentPath]);

  const goHome = useCallback(() => {
    setCurrentPath([initialData]);
  }, [initialData]);

  const findPathToQuestion = useCallback((root: Question, targetId: string, path: Question[] = []): Question[] | null => {
    const currentPath = [...path, root];
    if (root.id === targetId) return currentPath;
    for (const child of root.children) {
      const result = findPathToQuestion(child, targetId, currentPath);
      if (result) return result;
    }
    return null;
  }, []);

  const handleGraphNodeClick = useCallback((question: Question) => {
    const path = findPathToQuestion(initialData, question.id);
    if (path) {
      setCurrentPath(path);
      setViewMode('chat');
    }
  }, [initialData, findPathToQuestion]);

  const handleAddQuestion = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const answer = await simulateAIResponse(prompt);
      const newId = `${currentQuestion.id}-${Date.now()}`;
      const newQuestionObj: Question = {
        id: newId,
        question: prompt,
        answer: answer,
        timestamp: new Date().toISOString(),
        children: [],
      };

      const updateData = (root: Question): Question => {
        if (root.id === currentQuestion.id) {
          return { ...root, children: [...root.children, newQuestionObj] };
        }
        return { ...root, children: root.children.map(updateData) };
      };

      const updatedData = updateData(initialData);
      onDataChange(updatedData);

      setCurrentPath(prevPath => {
        const lastQuestion = prevPath[prevPath.length - 1];
        const updatedLastQuestion = { ...lastQuestion, children: [...lastQuestion.children, newQuestionObj] };
        return [...prevPath.slice(0, -1), updatedLastQuestion];
      });

      setPrompt('');
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, currentQuestion, initialData, onDataChange, simulateAIResponse]);

  const handleEditQuestion = useCallback((question: Question) => {
    setEditingQuestion(question);
    setNewQuestion(question.question);
    setNewAnswer(question.answer);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingQuestion) return;

    const updateData = (root: Question): Question => {
      if (root.id === editingQuestion.id) {
        return { ...root, question: newQuestion, answer: newAnswer };
      }
      return { ...root, children: root.children.map(updateData) };
    };

    const updatedData = updateData(initialData);
    onDataChange(updatedData);

    const updatedPath = currentPath.map((q) =>
      q.id === editingQuestion.id ? { ...q, question: newQuestion, answer: newAnswer } : q
    );
    setCurrentPath(updatedPath);

    setEditingQuestion(null);
    setNewQuestion('');
    setNewAnswer('');
  }, [editingQuestion, newQuestion, newAnswer, initialData, onDataChange, currentPath]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    const updateData = (root: Question): Question => {
      return { ...root, children: root.children.filter((child) => child.id !== questionId).map(updateData) };
    };

    const updatedData = updateData(initialData);
    onDataChange(updatedData);

    const deletedIndex = currentPath.findIndex((q) => q.id === questionId);
    if (deletedIndex !== -1) {
      setCurrentPath(currentPath.slice(0, deletedIndex));
    }
  }, [initialData, onDataChange, currentPath]);

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