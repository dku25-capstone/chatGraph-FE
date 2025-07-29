import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// questions.ts에서 가져온 타입 정의
interface QuestionNode {
  questionId: string;
  question: string;
  level: number;
  answerId: string;
  answer: string;
  createdAt: string;
  children: string[];
  parentId?: string | null;
}

interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
}

// API 응답의 전체 구조를 위한 타입
interface QuestionResponse {
  topic: string;
  nodes: { [id: string]: TopicNode | QuestionNode };
}

// 이 슬라이스에서 관리할 상태의 타입
interface ChatState extends QuestionResponse {}

const initialState: ChatState = {
  topic: '',
  nodes: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setQuestionData: (state, action: PayloadAction<QuestionResponse>) => {
      state.topic = action.payload.topic;
      state.nodes = action.payload.nodes;
    },
    // 필요에 따라 질문/답변 추가 액션 등을 여기에 추가할 수 있습니다.
  },
});

export const { setQuestionData } = chatSlice.actions;
export default chatSlice.reducer;