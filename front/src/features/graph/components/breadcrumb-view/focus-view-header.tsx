import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  List,
  Edit,
  X,
  MoreVertical,
  Layers,
  Split,
  Move,
  Share,
} from "lucide-react";
import { useQuestionTreeContext } from "./question-tree-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { ViewData } from "@/lib/data-transformer";
import { cn } from "@/lib/utils";

interface FocusViewHeaderProps {
  currentPath: ViewData[];
  navigateToQuestion: (question: ViewData, index: number) => void;
}

export const FocusViewHeader = ({
  currentPath,
  navigateToQuestion,
}: FocusViewHeaderProps) => {
  const {
    viewMode,
    setViewMode,
    startSplitMode,
    modifyMode,
    startModifyMode,
    cancelModifyMode,
    moveToOtherMode,
    startShareMode,
  } = useQuestionTreeContext();

  const floatingBarClass = cn(
    "pointer-events-auto",
    "flex items-center justify-between",
    "w-full max-w-[100%] md:max-w-[98%] min-h-13 lg:max-w-6xl mx-auto",
    "mt-4 p-1.5 pr-3",
    "rounded-full",
    "bg-white/60 dark:bg-black/60",
    "backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-2xl shadow-black/10",
    "transition-all duration-300 ease-out",
    "hover:bg-white/70 dark:hover:bg-black/70"
  );

  const modeToggleBtnClass = cn(
    "rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0",
    "bg-white/50 dark:bg-white/10",
    "text-gray-700 dark:text-gray-200",
    "hover:bg-gray-100 hover:text-black dark:hover:bg-white/20",
    "transition-all duration-200"
  );

  const dividerClass = "h-4 w-px bg-gray-400/30 hidden sm:block flex-shrink-0";

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center pointer-events-none pb-4 px-2">
      <div className={floatingBarClass}>
        {/* [Left Section] 뷰 모드 토글 + 브레드크럼 */}
        {/* [수정] overflow-hidden 제거: 자식 요소(브레드크럼)의 스크롤을 방해할 수 있음 */}
        <div className="flex items-center gap-3 flex-1 px-2 min-w-0">
          {/* 1. 뷰 모드 전환 버튼 */}
          <SimpleTooltip
            content={
              viewMode === "graph" ? "리스트 뷰로 전환" : "그래프 뷰로 전환"
            }
          >
            <Button
              variant="ghost"
              size="icon"
              className={modeToggleBtnClass}
              onClick={() =>
                setViewMode(viewMode === "graph" ? "chat" : "graph")
              }
            >
              {viewMode === "graph" ? (
                <List className="h-4 w-4" />
              ) : (
                <Network className="h-4 w-4" />
              )}
            </Button>
          </SimpleTooltip>

          {/* 2. 구분선 */}
          <div className={dividerClass} />

          {/* 3. 브레드크럼 네비게이션 */}
          {viewMode === "chat" ? (
            // [수정] flex-1과 min-w-0를 유지하여 남은 공간을 모두 차지하게 함
            <div className="flex-1 min-w-0 overflow-hidden relative flex items-center">
              <BreadcrumbNavigation
                currentPath={currentPath}
                navigateToQuestion={navigateToQuestion}
              />
            </div>
          ) : (
            <div className="flex-1 px-2 font-medium text-sm text-gray-600 dark:text-gray-300 animate-in fade-in slide-in-from-left-2 truncate">
              Graph Exploration View
            </div>
          )}
        </div>

        {/* [Right Section] 액션 버튼들 */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {viewMode === "graph" ? (
            modifyMode === "IDLE" ? (
              <>
                <div className="hidden lg:flex items-center gap-1">
                  {[
                    {
                      icon: Share,
                      label: "공유",
                      onClick: startShareMode,
                    },
                    {
                      icon: Split,
                      label: "분리",
                      onClick: startSplitMode,
                    },
                    {
                      icon: Move,
                      label: "이동",
                      onClick: moveToOtherMode,
                    },
                    {
                      icon: Edit,
                      label: "관계",
                      onClick: startModifyMode,
                    },
                  ].map((action, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      onClick={action.onClick}
                      className="h-8 px-3 rounded-full text-xs bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent hover:border-black/5"
                    >
                      <action.icon className="h-3 w-3 mr-1.5 opacity-70" />
                      {action.label}
                    </Button>
                  ))}
                </div>

                <div className="lg:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-black/5"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-white/20 bg-white/80 backdrop-blur-xl"
                    >
                      <DropdownMenuItem onClick={startSplitMode}>
                        새 토픽으로 분리
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={moveToOtherMode}>
                        다른 토픽으로 이동
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={startModifyMode}>
                        관계 수정
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelModifyMode}
                className="rounded-full h-8 px-4 shadow-red-500/20 shadow-lg"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                취소
              </Button>
            )
          ) : (
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 bg-black/5 dark:bg-white/10 text-xs font-medium border border-black/5"
            >
              <Layers className="w-3 h-3 mr-1 opacity-50" />
              Lv.{currentPath.length}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
