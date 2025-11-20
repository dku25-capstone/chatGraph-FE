import { useEffect, useRef } from "react"; // useEffect, useRef 추가
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useQuestionTreeContext } from "./QuestionTreeContext";

// follow-up 질문 입력하고 전송하는 입력 UI 컴포넌트
export const NewQuestionForm = () => {
  const { currentQuestion, prompt, setPrompt, handleAddQuestion, isLoading } =
    useQuestionTreeContext();

  // 1. Textarea 제어를 위한 Ref 생성
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 2. prompt 내용이 바뀔 때마다 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 높이 초기화 (줄어들 때를 대비)
      textarea.style.height = `${textarea.scrollHeight}px`; // 내용만큼 늘림
    }
  }, [prompt]);

  const placeholderText = currentQuestion
    ? `"${currentQuestion.questionText.substring(0, 50)}${
        currentQuestion.questionText.length > 50 ? "..." : ""
      }" 의 하위 질문을 입력해주세요`
    : "Ask a question...";

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* items-start를 items-end로 변경하여 입력창이 커질 때 버튼이 하단에 유지되도록 함 (취향에 따라 start 유지 가능) */}
          <div className="flex items-end gap-3 p-3 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
            <div className="flex-1">
              <Textarea
                ref={textareaRef} // Ref 연결
                placeholder={placeholderText}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                // max-h-[120px]: text-sm 기준으로 약 5~6줄 높이
                // min-h-[24px]: 최소 높이 보장
                className="border-0 bg-transparent focus-visible:ring-0 text-sm resize-none min-h-[24px] max-h-[120px] overflow-y-auto py-2"
                disabled={isLoading || !currentQuestion}
                rows={1}
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={!prompt.trim() || isLoading || !currentQuestion}
              size="sm"
              className="flex-shrink-0 mb-1" // mb-1으로 하단 정렬 미세 조정
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};