import { create } from 'zustand';
import { TopicTreeResponse } from '@/api/questions';
import { getTopicsHistory, TopicHistoryItem } from '@/api/topics-history';

interface TopicState {
  currentTopicId: string | null;
  currentTopicName: string | null;
  setTopic: (id: string, name: string) => void;
  prefetchedResponse: TopicTreeResponse | null;
  setPrefetchedResponse: (response: TopicTreeResponse | null) => void;
  topics: TopicHistoryItem[];
  setTopics: (topics: TopicHistoryItem[]) => void;
  addTopic: (topic: TopicHistoryItem) => void;
  updateTopic: (topicId: string, newName: string) => void;
  removeTopic: (topicId: string) => void;
  fetchTopics: () => Promise<void>;
}

export const useTopicStore = create<TopicState>((set) => ({
  currentTopicId: null,
  currentTopicName: null,
  setTopic: (id, name) => set({ currentTopicId: id, currentTopicName: name }),
  prefetchedResponse: null,
  setPrefetchedResponse: (response) => set({ prefetchedResponse: response }),
  topics: [],
  setTopics: (topics) => set({ topics }),
  addTopic: (topic) => set((state) => ({ topics: [topic, ...state.topics] })),
  updateTopic: (topicId, newName) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.topicId === topicId ? { ...t, topicName: newName } : t
      ),
    })),
  removeTopic: (topicId) =>
    set((state) => ({
      topics: state.topics.filter((t) => t.topicId !== topicId),
    })),
  fetchTopics: async () => {
    try {
      const fetchedTopics = await getTopicsHistory();
      const sortedTopics = fetchedTopics.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      set({ topics: sortedTopics });
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      set({ topics: [] });
    }
  },
}));