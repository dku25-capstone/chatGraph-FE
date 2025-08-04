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
import { ViewData } from "@/lib/data-transformer"; // ViewData 임포트
import ReactMarkdown from "react-markdown";

interface SubQuestionListProps {
  questions: ViewData[]; // 자식 질문 목록
  addToPath: (question: ViewData) => void; // 경로에 자식 질문 추가 함수
  handleEditQuestion: (question: ViewData) => void; // 질문 수정 함수
  handleDeleteQuestion: (questionId: string) => void; // 질문 삭제 함수
  showTitle: boolean;
}

// 현재 질문에 대한 하위 질문 목록 보여주는 UI
export const SubQuestionList = ({
  questions,
  addToPath,
  handleEditQuestion,
  handleDeleteQuestion,
  showTitle,
}: SubQuestionListProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 컴포넌트 처음 마운트, questions 바뀔 때, 펼친 상태로 초기화
  useEffect(() => {
    const initialExpandedState = questions.reduce(
      (acc, q) => ({ ...acc, [q.id]: true }),
      {}
    );
    setExpanded(initialExpandedState);
  }, [questions]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 이벤트 전파 중단
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <Card // 각 질문을 카드로 표시
            key={child.id}
            className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 cursor-pointer"
            onClick={() => addToPath(child)} // 카드 전체에 클릭 이벤트 부여
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Button // 답변 토글 버튼
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
                    <h4 className="font-medium text-blue-600 hover:text-blue-800">
                      {child.questionText}
                    </h4>
                  </div>
                  {expanded[child.id] && (
                    <div className="text-sm text-gray-600 mb-3 pl-10">
                      <ReactMarkdown>{child.answerText}</ReactMarkdown>
                    </div> // 답변 들여쓰기
                  )}
                  <div className="flex items-center gap-2 pl-10">
                    {child.children.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {child.children.length} sub-questions
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(child);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(child.id);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
