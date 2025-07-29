import { api } from "@/lib/api";

export interface TopicHistoryItem {
  topicId: string;
  topicName: string;
  createdAt: string;
}

export const getTopicsHistory = async (): Promise<TopicHistoryItem[]> => {
  const response = await api.get<TopicHistoryItem[]>('/api/topics/history');
  return response.data;
};
