import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Edit, Trash2, Eye } from "lucide-react";
import { Question } from "@/lib/data";

interface SubQuestionListProps {
  questions: Question[];
  addToPath: (question: Question) => void;
  handleEditQuestion: (question: Question) => void;
  handleDeleteQuestion: (id: string) => void;
}

export const SubQuestionList = ({ questions, addToPath, handleEditQuestion, handleDeleteQuestion }: SubQuestionListProps) => (
  <div className="p-4">
    <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
      <MessageSquare className="h-4 w-4" />
      Related Questions ({questions.length})
    </h3>
    <div className="grid gap-3">
      {questions.map((child) => (
        <Card
          key={child.id}
          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => addToPath(child)}>
                <h4 className="font-medium text-blue-600 hover:text-blue-800 mb-2">{child.question}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{child.answer}</p>
                <div className="flex items-center gap-2">
                  {child.children.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {child.children.length} sub-questions
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {new Date(child.timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuestion(child);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(child.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addToPath(child)}>
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);