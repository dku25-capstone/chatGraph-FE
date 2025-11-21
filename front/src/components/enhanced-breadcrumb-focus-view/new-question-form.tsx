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
    // [수정 포인트]
    // 1. sticky bottom-0: 화면 하단에 고정되어 스크롤 시에도 따라옴
    // 2. z-50: 레이어 순서를 높여서 다른 컨텐츠에 가려지지 않음
    // 3. bg-gradient-to-t: 입력창 뒤로 지나가는 텍스트가 겹쳐 보이지 않도록 자연스러운 배경 처리
    <div className="p-4 sticky bottom-0  w-full bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90 pt-10">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* items-start를 items-end로 변경하여 입력창이 커질 때 버튼이 하단에 유지되도록 함 (취향에 따라 start 유지 가능) */}
          <div className="flex items-end gap-3 p-3 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg transition-all duration-200 hover:shadow-xl hover:bg-white/70 dark:hover:bg-black/70">
            <div className="flex-1">
              <Textarea
                ref={textareaRef} // Ref 연결
                placeholder={placeholderText}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                // 엔터 키 전송 기능 추가 (선택 사항)
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && !isLoading && currentQuestion) {
                      handleAddQuestion();
                    }
                  }
                }}
                // max-h-[120px]: text-sm 기준으로 약 5~6줄 높이
                // min-h-[24px]: 최소 높이 보장
                className="border-0 bg-transparent focus-visible:ring-0 text-sm resize-none min-h-[24px] max-h-[120px] overflow-y-auto py-2 placeholder:text-gray-500"
                disabled={isLoading || !currentQuestion}
                rows={1}
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={!prompt.trim() || isLoading || !currentQuestion}
              size="sm"
              className="flex-shrink-0 mb-1 rounded-xl h-8 w-8 p-0" 
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
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