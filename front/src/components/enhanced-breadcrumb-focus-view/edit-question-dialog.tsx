import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ViewData } from "@/lib/data-transformer";

interface EditQuestionDialogProps {
  editingQuestion: ViewData | null;
  newQuestion: string;
  newAnswer: string;
  setNewQuestion: (question: string) => void;
  setNewAnswer: (answer: string) => void;
  handleSaveEdit: () => void;
  setEditingQuestion: (question: ViewData | null) => void;
}

// 질문 수정 모달
export const EditQuestionDialog = ({
  editingQuestion,
  newQuestion,
  newAnswer,
  setNewQuestion,
  setNewAnswer,
  handleSaveEdit,
  setEditingQuestion,
}: EditQuestionDialogProps) => (
  <Dialog
    open={!!editingQuestion}
    onOpenChange={() => setEditingQuestion(null)}
  >
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>질문 수정</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">질문</label>
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="질문을 입력하세요"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">답변</label>
          <Textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="답변을 입력하세요"
            rows={6}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingQuestion(null)}>
            취소
          </Button>
          <Button onClick={handleSaveEdit}>저장</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
