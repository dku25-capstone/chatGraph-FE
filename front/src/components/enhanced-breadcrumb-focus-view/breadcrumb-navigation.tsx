import React, { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewData } from "@/lib/data-transformer";

interface BreadcrumbNavigationProps {
  currentPath: ViewData[];
  navigateToQuestion: (question: ViewData, index: number) => void;
}

export const BreadcrumbNavigation = ({
  currentPath,
  navigateToQuestion,
}: BreadcrumbNavigationProps) => {
  const scrollRef = useRef<HTMLElement>(null);

  // 마우스 휠(상하)을 가로 스크롤로 변환
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <nav
      ref={scrollRef}
      onWheel={handleWheel}
      className={cn(
        "flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-x-auto",
        // 스크롤바 숨김 처리
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        // w-full로 부모 영역 채움
        "w-full min-w-0",
        "mask-linear-fade"
      )}
    >
      {currentPath.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <ChevronRight className="w-3 h-3 mx-1 text-gray-400 opacity-50 flex-shrink-0" />
          )}

          <div
            className={cn(
              "flex items-center p-1.5 rounded-md transition-all duration-200 cursor-pointer m-1",
              "min-w-0 flex-shrink-0",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "animate-in fade-in slide-in-from-left-1 duration-300"
            )}
            onClick={() => navigateToQuestion(item, index)}
          >
            <span
              className={cn(
                "transition-colors duration-200",
                "truncate block",
                index !== currentPath.length - 1 &&
                  "hover:text-gray-900 dark:hover:text-gray-100 hover:font-medium",
                index === currentPath.length - 1 &&
                  "font-semibold text-black dark:text-white"
              )}
            >
              {item.questionText.length > 15
                ? item.questionText.substring(0, 15) + "..."
                : item.questionText}
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};
