import React from "react";
import { ChevronRight, Home } from "lucide-react";
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
        <div key={item.id} className="flex items-center animate-in fade-in slide-in-from-left-1 duration-300">
          <span
            className={cn(
              "cursor-pointer transition-colors hover:text-black dark:hover:text-white hover:underline underline-offset-2",
              index === currentPath.length - 1 && "font-semibold text-black dark:text-white"
            )}
            onClick={() => navigateToQuestion(item, index)}
          >
            {item.questionText.length > 15 ? item.questionText.substring(0, 15) + "..." : item.questionText}

          </span>

          <ChevronRight className="w-3 h-3 mx-1 opacity-50" />

        </div>
      ))}
    </nav>
  );
};