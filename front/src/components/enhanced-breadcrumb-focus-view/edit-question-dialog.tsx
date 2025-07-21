import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Question } from "@/lib/data";

interface EditQuestionDialogProps {
  editingQuestion: Question | null;
  newQuestion: string;
  newAnswer: string;
  setNewQuestion: (question: string) => void;
  setNewAnswer: (answer: string) => void;
  handleSaveEdit: () => void;
  setEditingQuestion: (question: Question | null) => void;
}

export const EditQuestionDialog = ({ editingQuestion, newQuestion, newAnswer, setNewQuestion, setNewAnswer, handleSaveEdit, setEditingQuestion }: EditQuestionDialogProps) => (
  <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit Question & Answer</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Question</label>
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter your question"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Answer</label>
          <Textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Enter the answer"
            rows={6}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingQuestion(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);