import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  questionText?: string;
  answer?: string;
  isUser?: boolean;
  isToggleable?: boolean;
  isAnswerVisible?: boolean;
  onToggleAnswer?: () => void;
}

export function MessageBubble({
  questionText,
  answer,
  isUser = false,
  isToggleable = false,
  isAnswerVisible = true,
  onToggleAnswer,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex gap-3 p-4 ${isUser ? "bg-transparent" : "bg-gray-50"}`}
    >
      {isToggleable && onToggleAnswer && (
        <div className="flex-shrink-0 pt-1">
          <Button variant="ghost" size="sm" onClick={onToggleAnswer}>
            {isAnswerVisible ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <div className="flex-1 space-y-2">
        {questionText && (
          <div className="font-medium text-gray-900">{questionText}</div>
        )}
        {isAnswerVisible && answer && (
          <div className="text-gray-700 leading-relaxed">
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
