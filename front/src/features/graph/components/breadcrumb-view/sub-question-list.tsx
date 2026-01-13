"use client";

import { MessageSquare } from "lucide-react";
import { ViewData } from "@/lib/data-transformer";

import { QuestionCard } from "./question-card"; // 분리한 컴포넌트 import

interface SubQuestionListProps {
  questions: ViewData[];
  addToPath: (question: ViewData) => void;
  onSave: (questionId: string, newText: string) => void;
  showTitle: boolean;
}

// 기존 QuestionCard 컴포넌트 코드 및 스타일 정의 제거

export const SubQuestionList = ({
  questions,
  addToPath,
  showTitle,
}: SubQuestionListProps) => {
  return (
    <div className="p-4">
      {showTitle && (
        <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          관련 질문 ({questions.length})
        </h3>
      )}
      <div className="grid gap-4">
        {questions.map((child) => (
          <QuestionCard
            key={child.id}
            question={child}
            addToPath={addToPath}
          // isModalMode와 defaultAnswerExpanded는 기본값(false) 사용
          />
        ))}
      </div>
    </div>
  );
};