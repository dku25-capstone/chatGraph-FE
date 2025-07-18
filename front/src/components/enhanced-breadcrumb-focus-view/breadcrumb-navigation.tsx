import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { Question } from "@/lib/data";

interface BreadcrumbNavigationProps {
  currentPath: Question[];
  navigateToQuestion: (question: Question, index: number) => void;
}

export const BreadcrumbNavigation = ({ currentPath, navigateToQuestion }: BreadcrumbNavigationProps) => (
  <div className="px-4 py-3 bg-gray-50 border-b">
    <ScrollArea className="w-full">
      <div className="flex items-center gap-2 min-w-max">
        {currentPath.map((question, index) => (
          <div key={question.id} className="flex items-center gap-2">
            <Button
              variant={index === currentPath.length - 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateToQuestion(question, index)}
              className="max-w-[200px] truncate text-xs"
            >
              {question.question.length > 10 ? `${question.question.substring(0, 10)}...` : question.question}
            </Button>
            {index < currentPath.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);