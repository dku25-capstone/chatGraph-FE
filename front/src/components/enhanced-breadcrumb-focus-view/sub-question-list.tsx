import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import { ViewData } from "@/lib/data-transformer";
import ReactMarkdown from "react-markdown";
import { Input } from "../ui/input";

interface SubQuestionListProps {
  questions: ViewData[];
  addToPath: (question: ViewData) => void;
  onSave: (questionId: string, newText: string) => void;
  onDelete: (questionId: string) => void;
  showTitle: boolean;
}

export const SubQuestionList = ({
  questions,
  addToPath,
  onSave,
  onDelete,
  showTitle,
}: SubQuestionListProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const initialExpandedState = questions.reduce(
      (acc, q) => ({ ...acc, [q.id]: true }),
      {}
    );
    setExpanded(initialExpandedState);
  }, [questions]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditClick = (e: React.MouseEvent, question: ViewData) => {
    e.stopPropagation();
    setEditingId(question.id);
    setEditText(question.questionText);
  };

  const handleSaveClick = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    onSave(questionId, editText);
    setEditingId(null);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    onDelete(questionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, questionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(questionId, editText);
      setEditingId(null);
    }
  };

  return (
    <div className="p-4">
      {showTitle && (
        <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Related Questions ({questions.length})
        </h3>
      )}
      <div className="grid gap-3">
        {questions.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-md transition-all duration-200 border-l cursor-pointer"
            onClick={() => (editingId !== child.id ? addToPath(child) : null)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === child.id ? (
                    <div className="space-y-2">
                      <Input 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, child.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={(e) => handleSaveClick(e, child.id)}>저장</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelClick}>취소</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleExpand(e, child.id)}
                          className="mr-2"
                        >
                          {expanded[child.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <h4 className="font-medium text-black-800 hover:text-black-1000">
                          {child.questionText}
                        </h4>
                      </div>
                      {expanded[child.id] && (
                        <div className="text-sm text-gray-600 mb-3 pl-10">
                          <ReactMarkdown>{child.answerText}</ReactMarkdown>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pl-10">
                        {child.children.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {child.children.length} sub-questions
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {editingId !== child.id && (
                  <div className="flex items-center gap-1 ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => handleEditClick(e, child)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, child.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
