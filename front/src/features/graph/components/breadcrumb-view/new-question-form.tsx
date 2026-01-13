import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useQuestionTreeContext } from "./question-tree-context";
import { cn } from "@/lib/utils";

export const NewQuestionForm = () => {
  const { currentQuestion, prompt, setPrompt, handleAddQuestion, isLoading } =
    useQuestionTreeContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const placeholderText = currentQuestion
    ? `"${currentQuestion.questionText.substring(0, 30)}${currentQuestion.questionText.length > 30 ? "..." : ""
    }" 의 하위 질문 입력...`
    : "질문을 입력하세요...";

  // [FocusViewHeader와 동일한 Glassmorphism 스타일 정의]
  const floatingInputClass = cn(
    "pointer-events-auto", // 내부 요소 클릭 가능
    "flex items-end gap-2", // 내부 요소 정렬
    "w-full max-w-[100%] md:max-w-3xl mx-auto", // 너비 제한 및 중앙 정렬 (헤더보다 조금 더 좁게 설정하여 시각적 안정감 유도)
    "p-2", // 내부 여백
    "rounded-[26px]", // 완전한 원형보다는 텍스트 입력을 위해 살짝 덜 둥글게 처리하되 알약 느낌 유지

    // [Glassmorphism Effect - Hardcore (헤더와 동일)]
    "bg-white/60 dark:bg-black/60",
    "backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-2xl shadow-black/10",

    // [Hover/Focus Interaction]
    "transition-all duration-300 ease-out",
    "focus-within:bg-white/80 dark:focus-within:bg-black/80", // 입력 중일 때 좀 더 불투명하게
    "focus-within:shadow-black/20 focus-within:scale-[1.01]" // 입력 중 강조 효과
  );

  return (
    // [외부 컨테이너] sticky bottom으로 위치 잡기 + pointer-events-none으로 주변부 클릭 투과
    <div className="sticky bottom-6 z-50 w-full flex justify-center pointer-events-none px-4 pb-2">
      {/* [내부 플로팅 입력바] */}
      <div className={floatingInputClass}>
        <div className="flex-1 min-w-0 pl-2 py-0.5">
          <Textarea
            ref={textareaRef}
            placeholder={placeholderText}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim() && !isLoading && currentQuestion) {
                  handleAddQuestion();
                }
              }
            }}
            // 스타일 리셋 및 커스텀
            className={cn(
              "border-0 focus-visible:ring-0 px-0 py-2 shadow-none",
              "bg-transparent",
              "text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-500/80",
              "resize-none min-h-[24px] max-h-[200px] overflow-y-auto",
              // 스크롤바 숨기기 (선택사항)
              "scrollbar-hide"
            )}
            disabled={isLoading || !currentQuestion}
            rows={1}
          />
        </div>

        {/* 전송 버튼 */}
        <Button
          onClick={handleAddQuestion}
          disabled={!prompt.trim() || isLoading || !currentQuestion}
          size="icon"
          className={cn(
            "flex-shrink-0 rounded-full h-10 w-10 mb-0.5 mr-0.5",
            "transition-all duration-200",
            // 활성화 상태일 때 헤더의 버튼 스타일과는 다르게 '전송'의 의미를 담아 약간의 강조색 사용 가능
            // 여기서는 모던한 흑백 스타일 유지
            prompt.trim()
              ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-md"
              : "bg-gray-200/50 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 cursor-not-allowed shadow-none"
          )}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
