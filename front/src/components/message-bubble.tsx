"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X, Trash2, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalMarkdown } from "@/components/GlobalMarkDown"; // 경로에 맞게 수정
import { toast } from "sonner"; // [추가] sonner toast import

interface MessageBubbleProps {
  questionText: string;
  answer?: string;
  isUser?: boolean;
  isToggleable?: boolean;
  isAnswerVisible?: boolean;
  onToggleAnswer?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
}

export function MessageBubble({
  questionText,
  answer,
  isUser = false,
  isToggleable = false,
  isAnswerVisible = true,
  onToggleAnswer,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(questionText);
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
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
      // 기본 sonner 스타일의 액션 버튼
      action: {
        label: "삭제",
        onClick: () => onDelete(), // 삭제 클릭 시 실제 동작 수행
      },
      duration: 5000, // 5초 후 자동 닫힘
    });
  };
  // AI 응답용 글래스모피즘 스타일 (유지)
  const glassmorphismClasses = "p-4 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-sm";

  // 사용자 질문용 새 스타일 (bg-gray-100 적용)
  const userBubbleClasses = "p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700";

  if (isUser) {
    return (
      <div className="flex flex-col items-end space-y-3 w-full group/bubble">
        {/* --- 사용자 질문 영역 --- */}
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
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
                      "text-sm font-medium leading-relaxed break-all whitespace-pre-wrap pr-8", // 편집 버튼 공간 확보
                      !isQuestionExpanded ? "line-clamp-[7]" : ""
                    )}
                  >
                    {questionText}
                  </p>

                  {/* '더 보기' 버튼 */}
                  {showExpandButton && (
                    <div className="w-full flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsQuestionExpanded(!isQuestionExpanded)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                      >
                        {isQuestionExpanded ? (
                          <>접기 <ChevronUp className="h-3 w-3" /></>
                        ) : (
                          <>더 보기 <ChevronDown className="h-3 w-3" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 편집/삭제 버튼 (hover 시 표시) */}
                {onEdit && !isEditing && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity pl-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={confirmDelete} // [수정] onDelete 대신 confirmDelete 호출
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

        {/* '답변 보기/숨기기' 버튼 */}
        {isToggleable && (
          <div className="pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAnswer}
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors h-8 px-3 font-normal flex items-center gap-1.5 rounded-full"
            >
              {isAnswerVisible ? (
                <><ChevronDown className="h-4 w-4" /> 답변 숨기기</>
              ) : (
                <><MoreHorizontal className="h-4 w-4" /> 답변 보기</>
              )}
            </Button>
          </div>
        )}

        {/* AI 답변 영역 */}
        {isAnswerVisible && answer && (
          <div className="flex items-start w-full justify-end pl-8"> {/* 왼쪽 여백 추가 */}
            <div className={cn("flex-1 min-w-0 max-w-full transition-all", glassmorphismClasses)}>
              <div className="max-w-none break-all prose prose-sm dark:prose-invert">
                <GlobalMarkdown>{answer}</GlobalMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AI 응답 (변경 없음)
  return (
    <div className={cn("flex items-start max-w-[90%]", glassmorphismClasses)}>
      <div className="flex-1 min-w-0 overflow-hidden relative group">
        <div className="max-w-none break-all prose prose-sm dark:prose-invert">
          {questionText}
        </div>
      </div>
    </div>
  );
}