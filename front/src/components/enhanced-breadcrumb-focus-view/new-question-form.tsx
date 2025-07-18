import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Question } from "@/lib/data";

interface NewQuestionFormProps {
  currentQuestion: Question;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleAddQuestion: () => void;
  isLoading: boolean;
}

export const NewQuestionForm = ({ currentQuestion, prompt, setPrompt, handleAddQuestion, isLoading }: NewQuestionFormProps) => (
  <div className="border-t bg-white p-4">
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
          <div className="flex-1">
            <Input
              placeholder={`Ask a follow-up question about "${currentQuestion.question.substring(0, 50)}${currentQuestion.question.length > 50 ? "..." : ""}"`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleAddQuestion();
                }
              }}
              className="border-0 bg-transparent focus-visible:ring-0 text-sm"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleAddQuestion}
            disabled={!prompt.trim() || isLoading}
            size="sm"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • This will create a sub-question under the current topic
        </p>
      </div>
    </div>
  </div>
);