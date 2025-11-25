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

export interface TopicNode {
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
// 서브 트리를 위한 새 토픽 생성
export interface SeparateQuestionRequest {
  sourceQuestionIds: string[];
}

export interface SeparateQuestionResponse {
  newTopicId: string;
  newQuestionIds: string[];
}

export interface TopicTreeResponse {
  topic: string; // root node id
  nodes: {
    [id: string]: TopicNode | QuestionNode;
  };
}

// 서브트리 공유
export interface ShareQuestionsRequest {
  sourceQuestionIds: string[];
  targetUserId: string;
}

export interface ShareQuestionsResponse {
  success: boolean;
  message?: string;
}

// 질문 전송 (새 질문 or 후속 질문)
export const askQuestion = async (
  data: QuestionRequest
): Promise<TopicTreeResponse> => {
  const response = await api.post<TopicTreeResponse>("/api/questions", data);
  return response.data;
};

// 토픽 ID로 질문 트리 불러오기 후 평탄화
export const getTopicById = async (
  topicId: string
): Promise<TopicTreeResponse> => {
  const response = await api.get<TopicTreeResponse>(
    `/api/topics/${topicId}/tree`
  );
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
export const deleteQuestion = async (questionId: string): Promise<void> => {
  await api.delete(`/api/questions/${questionId}`);
};

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
  const response = await api.get<SearchQuestionsResponse>(
    "/api/questions/search",
    {
      params: { keyword },
    }
  );
  return response.data;
};

// 관계 수정(복사)
// Request body 타입 정의
export interface CopyQuestionRequest {
  sourceQuestionIds: string[]; // 복사할 노드 ID 배열
  targetParentId: string; // 붙여넣을 새 부모 노드 ID
}

// Response body 타입 정의
export interface CopyQuestionResponse {
  newQuestionIds: string[]; // 복사되어 새로 생성된 노드들의 ID 배열
}

// 선택한 질문 노드 및 하위 노드를 특정 질문 노드의 하위로 복사
export const copyQuestions = async (
  data: CopyQuestionRequest
): Promise<CopyQuestionResponse> => {
  const response = await api.post<CopyQuestionResponse>(
    "/api/questions/partial-copy",
    data
  );
  return response.data;
};

// 복수 노드 삭제
// Request body에 ID 배열을 담아 여러 개의 질문 노드 한번에 삭제
export const deleteQuestionBatch = async (
  questionIds: string[]
): Promise<void> => {
  await api.delete("/api/questions/batch", {
    data: questionIds,
  });
};

// 선택한 질문들을 위한 새로운 토픽을 생성하고 ID를 반환
export const separateQuestions = async (
  data: SeparateQuestionRequest
): Promise<SeparateQuestionResponse> => {
  const response = await api.post<SeparateQuestionResponse>(
    "/api/questions/separations",
    data
  );
  return response.data;
};

// 선택한 질문 노드 줄기를 다른 사용자에게 공유(복제)
export const ShareQuestions = async (
  data: ShareQuestionsRequest
): Promise<ShareQuestionsResponse> => {
  const response = await api.post<ShareQuestionsResponse>(
    "/api/questions/share",
    data
  );
  return response.data;
};

// 질문 즐겨찾기 (POST /api/questions/{questionId}/favorite)
// 특정 질문의 즐겨찾기 상태를 토글합니다.
export const toggleFavoriteQuestion = async (
  questionId: string
): Promise<void> => {
  await api.post(`/api/questions/${questionId}/favorite`);
};
