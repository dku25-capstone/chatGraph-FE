"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import { ViewData } from "@/lib/data-transformer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalMarkdown } from "@/utils/GlobalMarkDown";
import { OptimisticAnswer } from "./OptimisticAnswer";

interface SubQuestionListProps {
  questions: ViewData[];
  addToPath: (question: ViewData) => void;
  onSave: (questionId: string, newText: string) => void;
  showTitle: boolean;
}

// 스타일 정의
const glassmorphismClasses =
  "p-4 bg-white/60 dark:bg-black/60 backdrop-blur-2xl ";
const userBubbleClasses =
  "p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2";

// 개별 질문 카드 컴포넌트
const QuestionCard = ({
  question,
  addToPath,
}: {
  question: ViewData;
  addToPath: (question: ViewData) => void;
}) => {
  // 상태 관리: 질문 확장 여부, 답변 확장 여부, 더보기 버튼 표시 여부
  const [questionExpanded, setQuestionExpanded] = useState(false);
  const [answerExpanded, setAnswerExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);

  // 질문 텍스트 길이 측정 및 더보기 버튼 표시 여부 결정 (MessageBubble과 동일 로직)
  useEffect(() => {
    const element = questionRef.current;
    if (!element) return;
    // 1px 오차 허용
    const isOverflowing = element.scrollHeight > element.clientHeight + 1;
    setShowExpandButton(isOverflowing);
  }, [question.questionText]);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-none overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* 1. 질문 영역 (bg-gray-100 스타일 적용) */}
          <div
            className={cn("relative cursor-pointer group", userBubbleClasses)}
            onClick={() => addToPath(question)} // 카드 전체 클릭 시 경로 이동
          >
            <p
              ref={questionRef}
              className={cn(
                "text-sm font-medium leading-relaxed break-all whitespace-pre-wrap",
                !questionExpanded ? "line-clamp-[7]" : ""
              )}
            >
              {question.questionText}
            </p>

            {/* 하위 질문 뱃지 */}
            {question.children.length > 0 && (
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="text-xs pointer-events-none"
                >
                  {question.children.length} 하위 질문
                </Badge>
              </div>
            )}

            {/* 질문 더 보기/접기 버튼 */}
            {showExpandButton && (
              <div className="w-full flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                    setQuestionExpanded(!questionExpanded);
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  {questionExpanded ? (
                    <>
                      접기 <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      더 보기 <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* 2. 답변 보기/숨기기 버튼 또는 로딩 상태 */}
          <div className="flex justify-end pr-2">
            {typeof question.answerText === "string" &&
            question.answerText !== "" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnswerExpanded(!answerExpanded)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors h-8 px-3 font-normal flex items-center gap-1.5 rounded-full"
              >
                {answerExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4" /> 답변 숨기기
                  </>
                ) : (
                  <>
                    <MoreHorizontal className="h-4 w-4" /> 답변 보기
                  </>
                )}
              </Button>
            ) : question.answerText === "" ? (
              <div className="p-2">
                <OptimisticAnswer answer={null} />
              </div>
            ) : null}
          </div>

          {/* 3. 답변 영역 (글래스모피즘 적용) */}
          {answerExpanded && question.answerText && (
            <div className="flex items-start w-full justify-end pl-4">
              <div
                className={cn(
                  "flex-1 min-w-0 max-w-full transition-all",
                  glassmorphismClasses
                )}
              >
                <GlobalMarkdown>{question.answerText}</GlobalMarkdown>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
          <QuestionCard key={child.id} question={child} addToPath={addToPath} />
        ))}
      </div>
    </div>
  );
};
