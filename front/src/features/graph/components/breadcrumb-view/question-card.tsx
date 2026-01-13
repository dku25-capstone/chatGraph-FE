// components/enhanced-breadcrumb-focus-view/QuestionCard.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { ViewData } from "@/lib/data-transformer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalMarkdown } from "@/utils/GlobalMarkDown";
import { OptimisticAnswer } from "./optimistic-answer";

// 스타일 정의
const glassmorphismClasses =
  "p-4 bg-white/60 dark:bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-white/10";
const userBubbleClasses =
  "p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2";

interface QuestionCardProps {
  question: ViewData;
  addToPath?: (question: ViewData) => void;
  isModalMode?: boolean; // 모달 모드 여부 (네비게이션 방지용)
  defaultAnswerExpanded?: boolean;
}

// 개별 질문 카드 컴포넌트
export const QuestionCard = ({
  question,
  addToPath,
  isModalMode = false,
  defaultAnswerExpanded = false,
}: QuestionCardProps) => {
  // 상태 관리
  const [questionExpanded, setQuestionExpanded] = useState(false);
  const [answerExpanded, setAnswerExpanded] = useState(defaultAnswerExpanded);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);

  // 질문 텍스트 길이 측정
  useEffect(() => {
    const element = questionRef.current;
    if (!element) return;
    const isOverflowing = element.scrollHeight > element.clientHeight + 1;
    setShowExpandButton(isOverflowing);
  }, [question.questionText]);

  // 카드 클릭 핸들러 (모달 모드가 아닐 때만 네비게이션 이동)
  const handleCardClick = () => {
    if (!isModalMode && addToPath) {
      addToPath(question);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-none overflow-hidden",
        // 모달 모드가 아닐 때만 호버 효과 적용
        !isModalMode && "hover:shadow-md"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* 1. 질문 영역 */}
          <div
            className={cn(
              "relative group",
              userBubbleClasses,
              // 모달 모드가 아닐 때만 커서 포인터 표시
              !isModalMode && "cursor-pointer"
            )}
            onClick={handleCardClick}
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

            {/* 하위 질문 뱃지 (항상 표시) */}
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

            {/* 질문 더 보기/접기 버튼 (조건 충족 시 항상 표시) */}
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

          {/* 2. 답변 보기/숨기기 버튼 (항상 표시) */}
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

          {/* 3. 답변 영역 (사용자가 펼쳤을 때만 표시) */}
          {answerExpanded && question.answerText && (
            <div className="flex items-start w-full justify-end pl-4">
              <div
                className={cn(
                  "flex-1 min-w-0 max-w-full transition-all prose dark:prose-invert",
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