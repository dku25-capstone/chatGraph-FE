import { api } from "@/lib/api";

export interface QuestionRequest {
  questionText: string;
  parentQuestionId?: string; // 없으면 첫 질문
}

// 응답 타입 정의
export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  level: number;
  answerId: string;
  answerText: string;
  createdAt: string;
  topicId: string; // Add topicId
}

interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
}

export interface QuestionNode {
  questionId: string;
  questionText: string;
  level: number;
  answerId: string;
  answerText: string;
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




//질문 수정 
export interface PatchQuestionRequest {
  newNodeName: string;
}

export interface PatchQuestionResponse {
  nodeId: string;
  nodeType: string;
  nodeData: string;
}
export const patchQuestion = async (
  questionId: string,
  data: PatchQuestionRequest
): Promise<PatchQuestionResponse> => {
  const response = await api.patch<PatchQuestionResponse>(
    `/api/questions/${questionId}`,
    data
  );
  return response.data;
};


//질문 삭제
export const deleteQuestion = async (questionId:string): Promise<void> =>{
  await api.delete(`/api/questions/${questionId}`);
}

//질문 검색
export interface SearchQuestionsResponse {
  topic: string;
  nodes: {
    [id: string]: QuestionNode;
  };
}
export const searchQuestions = async (
  keyword: string
): Promise<SearchQuestionsResponse> => {
  const response = await api.get<SearchQuestionsResponse>("/api/questions/search", {
    params: { keyword },
  });
  return response.data;
};
