import { api } from "@/lib/api";

export interface TopicHistoryItem {
  topicId: string;
  topicName: string;
  createdAt: string;
}

// 서버에서 토픽 리스트를 배열 형태로 응답
export const getTopicsHistory = async (): Promise<TopicHistoryItem[]> => {
  const response = await api.get<TopicHistoryItem[]>("/api/topics/history");
  return response.data;
};
