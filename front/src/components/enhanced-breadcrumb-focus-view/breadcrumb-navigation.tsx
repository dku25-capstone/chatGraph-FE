import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { ViewData } from "@/lib/data-transformer"; // ViewData 임포트

interface BreadcrumbNavigationProps {
  currentPath: ViewData[]; // 지금까지 클릭해 들어온 질문 노드 경로
  navigateToQuestion: (question: ViewData, index: number) => void; // 사용자가 중간 경로 버튼 클릭 시, 해당 질문으로 이동하는 함수
}

// 질문-답변 트리를 탐색할 때 상단에 표시되는 네비게이션 UI
export const BreadcrumbNavigation = ({
  currentPath,
  navigateToQuestion,
}: BreadcrumbNavigationProps) => (
  <div className="px-4 py-3 bg-gray-50 border-b">
    <ScrollArea className="w-full">
      <div className="flex items-center gap-2 min-w-max">
        {currentPath.map((question, index) => (
          <div
            key={`${question.id}-${index}`}
            className="flex items-center gap-2"
          >
            {" "}
            {/* 더 안전한 key 값 */}
            <Button
              variant={index === currentPath.length - 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateToQuestion(question, index)}
              className="max-w-[200px] truncate text-xs"
            >
              {/* 질문 길이 늘어나면 생략 */}
              {question.questionText.length > 10
                ? `${question.questionText.substring(0, 10)}...`
                : question.questionText}
            </Button>
            {/* 현재 렌더링 중인 노드가 마지막 노드가 아니면 구분자 넣음 */}
            {index < currentPath.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);
