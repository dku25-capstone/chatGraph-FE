import { api } from "@/lib/api";

interface AskContextRequest {
  prompt: string;
  previousQuestionId?: string;
}

interface AskContextResponse {
  answer: string;
  questionId: string;
  topicId: string;
}

export const askContext = async (data: AskContextRequest): Promise<AskContextResponse> => {
  const response = await api.post<AskContextResponse>('/ask-context', data);
  return response.data;
};