
import { api } from "@/lib/api";

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  level: number;
  answerId: string;
  answerText: string;
  createdAt: string;
}

export const getTopicById = async (topicId: string): Promise<QuestionAnswer[]> => {
  const response = await api.get<QuestionAnswer[]>(`/topics/${topicId}`);
  return response.data;
};
