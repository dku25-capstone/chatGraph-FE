import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import { ViewData } from "@/lib/data-transformer";
import { cn } from "@/lib/utils";

interface BreadcrumbNavigationProps {
  currentPath: ViewData[];
  navigateToQuestion: (question: ViewData, index: number) => void;
}

export const BreadcrumbNavigation = ({
  currentPath,
  navigateToQuestion,
}: BreadcrumbNavigationProps) => (
  // [컨테이너]
  // sticky top-6: 상단 여백을 두고 떠 있음
  // justify-start: 화면 왼쪽 정렬 (기존 justify-center에서 변경)
  <div className="sticky top-6 z-50 flex justify-start px-2 pointer-events-none">
    <div
      className={cn(
        // [Bar 스타일 - 글래스모피즘 & 흑백 테마]
        "pointer-events-auto", // 클릭 가능
        "flex items-center gap-2 px-1 py-2",
        
        // 너비 제한
        "max-w-full md:max-w-3xl overflow-hidden"
      )}
    >
      <div
        className={cn(
          "w-full overflow-x-auto no-scrollbar", 
          "mask-linear-fade"
        )}
      >
        <div className="flex items-center gap-1 min-w-max">
          {currentPath.map((question, index) => {
            const isLast = index === currentPath.length - 1;
            
            return (
              <div
                key={`${question.id}-${index}`}
                className="flex items-center animate-in fade-in slide-in-from-top-3 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToQuestion(question, index)}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium transition-all duration-200",
                    
                    // [버튼 스타일 - 반투명 검정]
                    // 글자는 항상 검정
                    "text-black",
                    
                    isLast 
                      ? "bg-black/10 font-semibold shadow-sm" // 마지막 항목: 진한 반투명 검정 배경
                      : "bg-transparent hover:bg-black/5 text-black/70 hover:text-black" // 이전 항목: 호버 시 연한 검정 배경
                  )}
                >
                  {index === 0 ? (
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3 opacity-70" /> {/* 첫 번째는 홈 아이콘 추천 */}
                      <span className="truncate max-w-[100px]">
                        {question.questionText.length > 12
                          ? `${question.questionText.substring(0, 12)}...`
                          : question.questionText}
                      </span>
                    </span>
                  ) : (
                    <span className="truncate max-w-[140px]">
                      {question.questionText.length > 15
                          ? `${question.questionText.substring(0, 15)}...`
                          : question.questionText}
                    </span>
                  )}
                </Button>
                
                {!isLast && (
                  <ChevronRight className="h-3 w-3 mx-1 text-black/30 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);