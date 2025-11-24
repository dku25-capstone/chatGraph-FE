"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// [수정] Copy 아이콘 추가
import {
  Pencil,
  Check,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Copy,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalMarkdown } from "@/utils/GlobalMarkDown";
import { toast } from "sonner";
import { OptimisticAnswer } from "@/components/enhanced-breadcrumb-focus-view/OptimisticAnswer";

interface MessageBubbleProps {
  questionText: string;
  answer?: string;
  isUser?: boolean;
  isToggleable?: boolean;
  isAnswerVisible?: boolean;
  isFavorite?: boolean;
  onToggleAnswer?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

export function MessageBubble({
  questionText,
  answer,
  isUser = false,
  isToggleable = false,
  isAnswerVisible = true,
  isFavorite = false,
  onToggleAnswer,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(questionText);
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  // [추가] 복사 상태 관리 state
  const [isCopied, setIsCopied] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = questionRef.current;
    if (!element) return;
    const isOverflowing = element.scrollHeight > element.clientHeight + 1;
    setShowExpandButton(isOverflowing);
  }, [questionText]);

  const handleSave = () => {
    if (onEdit && editedText.trim() !== "") {
      onEdit(editedText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedText(questionText);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    if (!onDelete) return;

    toast("정말 삭제하시겠습니까?", {
      action: {
        label: "삭제",
        onClick: () => onDelete(),
      },
      duration: 5000,
    });
  };

  // [추가] 복사 핸들러 함수
  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("클립보드에 복사되었습니다.");
      // 2초 후 아이콘 원래대로 복귀
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const glassmorphismClasses =
    "p-4 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-sm";
  const userBubbleClasses =
    "p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700";

  if (isUser) {
    return (
      <div className="flex flex-col items-end space-y-3 w-full group/bubble">
        {/* --- 사용자 질문 영역 (기존 코드 동일) --- */}
        <div className="flex items-start w-full justify-end relative">
          <div className={cn("min-w-0 relative w-[80%]", userBubbleClasses)}>
            {isEditing ? (
              <div className="flex flex-col space-y-2">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[100px] bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start relative">
                  <p
                    ref={questionRef}
                    className={cn(
                      "text-sm font-medium leading-relaxed break-all whitespace-pre-wrap pr-28",
                      !isQuestionExpanded ? "line-clamp-[7]" : ""
                    )}
                  >
                    {questionText}
                  </p>

                  {showExpandButton && (
                    <div className="w-full flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsQuestionExpanded(!isQuestionExpanded)
                        }
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                      >
                        {isQuestionExpanded ? (
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

                {onEdit && !isEditing && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity pr-4">
                    {onToggleFavorite && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onToggleFavorite}
                        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={confirmDelete}
                        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* '답변 보기/숨기기' 버튼 (기존 코드 동일) */}
        {isToggleable && (
          <div className="pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAnswer}
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors h-8 px-3 font-normal flex items-center gap-1.5 rounded-full"
            >
              {isAnswerVisible ? (
                <>
                  <ChevronDown className="h-4 w-4" /> 답변 숨기기
                </>
              ) : (
                <>
                  <MoreHorizontal className="h-4 w-4" /> 답변 보기
                </>
              )}
            </Button>
          </div>
        )}

        {/* --- AI 답변 영역 (로딩 상태 추가) --- */}
        {isAnswerVisible && typeof answer !== "undefined" && (
          <div className="flex items-start w-full justify-end pl-8">
            <div
              className={cn(
                "flex-1 min-w-0 max-w-full transition-all relative group/answer",
                glassmorphismClasses
              )}
            >
              <div className="max-w-none break-all prose prose-sm dark:prose-invert pr-8">
                {answer === "" ? (
                  <OptimisticAnswer answer={null} />
                ) : (
                  <GlobalMarkdown>{answer}</GlobalMarkdown>
                )}
              </div>

              {answer && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/answer:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(answer)}
                    className="h-7 w-7 p-0 hover:bg-white/20 dark:hover:bg-black/20 text-muted-foreground hover:text-foreground"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 단독 AI 응답 영역 (복사 버튼 추가됨) ---
  return (
    // [수정] relative 및 group/answer 클래스 추가
    <div
      className={cn(
        "flex items-start max-w-[70%] relative group/answer",
        glassmorphismClasses
      )}
    >
      <div className="flex-1 min-w-0 overflow-hidden relative">
        {/* [수정] pr-8 추가하여 버튼 공간 확보 */}
        <div className="max-w-none break-all prose prose-sm dark:prose-invert pr-8">
          {/* 이 경우 questionText가 AI의 답변 내용임 */}
          {questionText}
        </div>
      </div>
      {/* [추가] 복사 버튼 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover/answer:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleCopy(questionText)}
          className="h-7 w-7 p-0 hover:bg-white/20 dark:hover:bg-black/20 text-muted-foreground hover:text-foreground"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
