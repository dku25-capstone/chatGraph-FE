import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useQuestionTreeContext } from "./QuestionTreeContext";

// follow-up 질문 입력하고 전송하는 입력 UI 컴포넌트
export const NewQuestionForm = () => {
  const { currentQuestion, prompt, setPrompt, handleAddQuestion, isLoading } = useQuestionTreeContext();

  const placeholderText = currentQuestion
    ? `"${currentQuestion.questionText.substring(0, 50)}${
        currentQuestion.questionText.length > 50 ? "..." : ""
      }" 의 하위 질문을 입력해주세요`
    : "Ask a question...";

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <Input
                placeholder={placeholderText}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleAddQuestion();
                  }
                }}
                className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                disabled={isLoading || !currentQuestion} // currentQuestion이 없으면 비활성화
              />
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={!prompt.trim() || isLoading || !currentQuestion} // currentQuestion이 없으면 비활성화
              size="sm"
              className="flex-shrink-0"
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
