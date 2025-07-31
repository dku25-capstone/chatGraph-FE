
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTopicById } from '@/api/questions';
import { EnhancedBreadcrumbFocusView } from '@/components/enhanced-breadcrumb-focus-view';

// API 응답 타입 (questions.ts에서 가져오거나 여기에 정의)
interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
}
interface QuestionNode {
  questionId: string;
  question: string;
  answer: string;
  level: number;
  createdAt: string;
  children: string[];
}
interface TopicTreeResponse {
  topic: string;
  nodes: { [id: string]: TopicNode | QuestionNode };
}

// EnhancedBreadcrumbFocusView가 요구하는 데이터 타입
interface ViewData {
  id: string;
  question: string;
  answer: string;
  children: ViewData[];
}

/**
 * API 응답 (TopicTreeResponse)을 EnhancedBreadcrumbFocusView가 사용하는
 * 재귀적인 ViewData 형태로 변환하는 함수.
 */
const transformApiDataToViewData = (apiData: TopicTreeResponse): ViewData => {
  const { topic: rootId, nodes } = apiData;

  const buildTree = (nodeId: string): ViewData => {
    const node = nodes[nodeId];
    let questionText = '';
    let answerText = '';

    if ('topicName' in node) { // TopicNode
      questionText = node.topicName;
      answerText = `This is the root of the topic: ${node.topicName}`;
    } else { // QuestionNode
      questionText = node.question;
      answerText = node.answer;
    }

    const children = ('children' in node && node.children) ? node.children.map(buildTree) : [];

    return {
      id: nodeId,
      question: questionText,
      answer: answerText,
      children: children,
    };
  };

  return buildTree(rootId);
};

export default function ChatPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const apiResponse = await getTopicById(topicId);
          const transformedData = transformApiDataToViewData(apiResponse);
          setViewData(transformedData);
        } catch (error) {
          console.error("Failed to fetch and transform topic data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [topicId]);

  const handleDataChange = (newData: ViewData) => {
    setViewData(newData);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!viewData) {
    return <div className="flex items-center justify-center h-screen">Topic not found.</div>;
  }

  return (
    <EnhancedBreadcrumbFocusView 
      data={viewData} 
      onDataChange={handleDataChange} 
    />
  );
}
