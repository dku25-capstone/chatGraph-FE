import React, { createContext, useContext } from "react";
import { useQuestionTree } from "./use-question-tree";
import { TopicTreeResponse } from "@/lib/data-transformer";

// useQuestionTree 훅의 반환 타입 정의
type UseQuestionTreeReturn = ReturnType<typeof useQuestionTree>;

// Context 생성
const QuestionTreeContext = createContext<UseQuestionTreeReturn | undefined>(
  undefined
);

// Provider 컴포넌트
export const QuestionTreeProvider: React.FC<{
  children: React.ReactNode;
  initialResponse: TopicTreeResponse;
  topicId: string;
}> = ({ children, initialResponse, topicId }) => {
  const questionTree = useQuestionTree(initialResponse, topicId);
  return (
    <QuestionTreeContext.Provider value={questionTree}>
      {children}
    </QuestionTreeContext.Provider>
  );
};

// Context를 쉽게 사용할 수 있는 커스텀 훅
export const useQuestionTreeContext = () => {
  const context = useContext(QuestionTreeContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionTreeContext must be used within a QuestionTreeProvider"
    );
  }
  return context;
};
