import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { ViewData } from "@/lib/data-transformer";

interface QuestionDetailModalProps {
  question: ViewData | null;
  onClose: () => void;
  onJumpToChat: () => void;
}

export default function QuestionDetailModal({
  question,
  onClose,
  onJumpToChat,
}: QuestionDetailModalProps) {
  return (
    <Dialog open={!!question} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {question?.questionText}
          </DialogTitle>
        </DialogHeader>
        <div className="prose max-h-[60vh] overflow-y-auto">
          <ReactMarkdown>{question?.answerText || ""}</ReactMarkdown>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onJumpToChat}>질문 페이지로 이동</Button>
          <Button onClick={onClose} variant="secondary">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
