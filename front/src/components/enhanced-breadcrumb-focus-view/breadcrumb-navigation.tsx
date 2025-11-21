import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewData } from "@/lib/data-transformer";

interface BreadcrumbNavigationProps {
  currentPath: ViewData[];
  navigateToQuestion: (question: ViewData, index: number) => void;
}

export const BreadcrumbNavigation = ({ currentPath, navigateToQuestion }: BreadcrumbNavigationProps) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mask-linear-fade">
      {currentPath.map((item, index) => (
        <React.Fragment key={item.id}>
          {/* 1. 구분자 (Chevron): 첫 번째 항목이 아닐 때만, 항목 '앞'에 표시 */}
          {index > 0 && (
            <ChevronRight className="w-3 h-3 mx-1 text-gray-400 opacity-50 flex-shrink-0" />
          )}

          {/* 2. 실제 항목 (Clickable Item): 호버 및 클릭 이벤트는 여기에만 적용 */}
          <div 
            className={cn(
              "flex items-center p-1.5 rounded-md transition-all duration-200 cursor-pointer m-1",
              // 호버 시 배경색 변경 (화살표에는 영향 없음)
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "animate-in fade-in slide-in-from-left-1 duration-300"
            )}
            onClick={() => navigateToQuestion(item, index)}
          >
            <span 
              className={cn(
                "transition-colors duration-200",
                // 마지막 항목이 아니면 호버 시 텍스트 진하게
                index !== currentPath.length - 1 && "hover:text-gray-900 dark:hover:text-gray-100 hover:font-medium",
                // 마지막 항목(현재 위치) 스타일
                index === currentPath.length - 1 && "font-semibold text-black dark:text-white"
              )}
            >
              {item.questionText.length > 15 ? item.questionText.substring(0, 15) + "..." : item.questionText}
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};