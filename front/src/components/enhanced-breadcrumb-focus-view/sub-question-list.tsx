import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { ViewData } from "@/lib/data-transformer";
import { OptimisticAnswer } from "./OptimisticAnswer";
import { Separator } from "@/components/ui/separator";

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
  showTitle,
}: SubQuestionListProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialExpandedState = questions.reduce(
      (acc, q) => ({ ...acc, [q.id]: true }),
      {}
    );
    setExpanded(initialExpandedState);
  }, [questions]);

  return (
    <div className="p-4">
      {showTitle && (
        <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          관련 질문 ({questions.length})
        </h3>
      )}
      <div className="grid gap-3">
        {questions.map((child) => {
          return (
            <Card
              key={child.id}
              className="hover:shadow-md transition-all duration-200 border-l cursor-pointer"
              onClick={() => addToPath(child)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-black-800 hover:text-black-1000 pl-10">
                        {child.questionText}
                      </h4>
                    </div>

                    {expanded[child.id] && (
                      <div className="text-sm text-gray-600 mb-3 pl-10">
                        <Separator className="my-4" />
                        <OptimisticAnswer answer={child.answerText} />
                      </div>
                    )}
                    <div className="flex items-center gap-2 pl-10">
                      {child.children.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {child.children.length} 하위 질문
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
