import { create } from 'zustand';

interface TopicState {
  currentTopicId: string | null;
  currentTopicName: string | null;
  setTopic: (id: string, name: string) => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  currentTopicId: null,
  currentTopicName: null,
  setTopic: (id, name) => set({ currentTopicId: id, currentTopicName: name }),
}));