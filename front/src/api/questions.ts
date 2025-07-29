import { api } from "@/lib/api";

export interface QuestionRequest {
  question: string;
  parentId?: string; // 없으면 첫 질문
}

// 응답 타입 정의
export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  level: number;
  answerId: string;
  answerText: string;
  createdAt: string;
}

interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
}

interface QuestionNode {
  questionId: string;
  question: string;
  level: number;
  answerId: string;
  answer: string;
  createdAt: string;
  children: string[];
  parentId?: string;
}

interface TopicTreeResponse {
  topic: string; // root node id
  nodes: {
    [id: string]: TopicNode | QuestionNode;
  };
}

// 질문 전송 (새 질문 or 후속 질문)
export const askQuestion = async (data: QuestionRequest): Promise<TopicTreeResponse> => {
  const response = await api.post<TopicTreeResponse>("/api/questions", data);
  return response.data;
};

// 토픽 ID로 질문 트리 불러오기 후 평탄화
export const getTopicById = async (topicId: string): Promise<TopicTreeResponse> => {
  const response = await api.get<TopicTreeResponse>(`/api/topics/${topicId}/tree`);
  return response.data;
};

// 트리를 평탄화해서 QuestionAnswer[] 형태로 변환
const parseTreeToQAList = (response: TopicTreeResponse): QuestionAnswer[] => {
  const { nodes } = response;
  const result: QuestionAnswer[] = [];

  Object.values(nodes).forEach((node) => {
    if ("questionId" in node) {
      result.push({
        questionId: node.questionId,
        questionText: node.question,
        level: node.level,
        answerId: node.answerId,
        answerText: node.answer,
        createdAt: node.createdAt,
      });
    }
  });

  return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};
