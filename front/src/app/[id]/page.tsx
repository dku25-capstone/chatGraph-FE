"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTopicById } from '@/api/questions'; // 수정된 API 함수 임포트

// Node 타입을 명시적으로 정의
interface QuestionNode {
  questionId: string;
  question: string;
  answer: string;
  children: string[];
}

interface TopicNode {
  topicId: string;
  topicName: string;
  children: string[];
}

interface Nodes {
  [id: string]: TopicNode | QuestionNode;
}

// 질문과 답변을 재귀적으로 렌더링하는 컴포넌트
const QuestionAnswer = ({ questionId, nodes }: { questionId: string, nodes: Nodes }) => {
  const node = nodes[questionId] as QuestionNode;
  if (!node) return null;

  return (
    <div className="ml-6 mt-4 p-4 border-l-2 border-gray-200">
      <div className="mb-2">
        <p className="font-semibold text-lg">Q: {node.question}</p>
        <p className="text-gray-700">A: {node.answer}</p>
      </div>
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map(childId => (
            <QuestionAnswer key={childId} questionId={childId} nodes={nodes} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChatPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [topicNode, setTopicNode] = useState<TopicNode | null>(null);
  const [nodes, setNodes] = useState<Nodes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await getTopicById(topicId);
          setTopicNode(response.nodes[response.topic] as TopicNode);
          setNodes(response.nodes);
        } catch (error) {
          console.error("Failed to fetch topic data:", error);
          // 에러 처리 (예: 404 페이지로 리디렉션)
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [topicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!topicNode || !nodes) {
    return <div>Topic not found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{topicNode.topicName}</h1>
      <div>
        {topicNode.children.map(questionId => (
          <QuestionAnswer key={questionId} questionId={questionId} nodes={nodes} />
        ))}
      </div>
    </div>
  );
}