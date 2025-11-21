import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, List, Edit, X, MoreVertical, Layers } from "lucide-react";
import { useQuestionTreeContext } from "./QuestionTreeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  } = useQuestionTreeContext();

  // [강력한 글래스모피즘 플로팅 바 스타일]
  // w-full이 아닌 max-w를 주어 떠있는 느낌 강조
  const floatingBarClass = cn(
    "pointer-events-auto", // 클릭 가능
    "flex items-center justify-between", // 내부 요소 양끝 정렬
    "w-full max-w-[100%] lg:max-w-5xl mx-auto", // 너비 제한 및 중앙 정렬
    "mt-4 p-1.5 pr-3", // 내부 여백 (버튼과 테두리 사이 간격)
    "rounded-full", // 완전한 알약 모양
    
    // [Glassmorphism Effect - Hardcore]
    "bg-white/60 dark:bg-black/60", // 기본 배경 반투명
    "backdrop-blur-2xl", // 매우 강한 블러
    "border border-white/40 dark:border-white/10", // 뚜렷한 유리 테두리
    "shadow-2xl shadow-black/10", // 깊이감 있는 그림자
    
    // [Hover/Interaction]
    "transition-all duration-300 ease-out",
    "hover:bg-white/70 dark:hover:bg-black/70", // 호버 시 불투명도 증가
    "hover:shadow-black/15 hover:scale-[1.005]" // 미세한 확대 효과
  );

  // 뷰 모드 전환 버튼 스타일 (왼쪽 원형 버튼)
  const modeToggleBtnClass = cn(
    "rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0",
    "bg-white/50 dark:bg-white/10",
    "text-gray-700 dark:text-gray-200",
    "shadow-sm border border-white/20",
    "hover:bg-white hover:text-black dark:hover:bg-white/20",
    "transition-all duration-200"
  );

  return (
    // [외부 컨테이너] 위치 잡기 (sticky top)
    <div className="sticky top-0 z-50 w-full flex justify-center pointer-events-none pb-4">
      {/* [내부 플로팅 바] 실제 UI */}
      <div className={floatingBarClass}>
        
        {/* [Left Section] 뷰 모드 토글 + 브레드크럼 */}
        <div className="flex items-center gap-3 flex-1 px-2 min-w-0 overflow-hidden">
          {/* 1. 뷰 모드 전환 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={modeToggleBtnClass}
                onClick={() => setViewMode(viewMode === "graph" ? "chat" : "graph")}
              >
                {viewMode === "graph" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Network className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{viewMode === "graph" ? "채팅으로 보기" : "그래프로 보기"}</p>
            </TooltipContent>
          </Tooltip>

          {/* 2. 구분선 (Vertical Divider) */}
          <div className="h-4 w-px bg-gray-400/30 hidden sm:block" />

          {/* 3. 브레드크럼 네비게이션 (Chat Mode일 때만 표시하거나 항상 표시) */}
          {viewMode === "chat" ? (
            <div className="flex-1 min-w-0">
              <BreadcrumbNavigation
                currentPath={currentPath}
                navigateToQuestion={navigateToQuestion}
              />
            </div>
          ) : (
            <div className="flex-1 px-2 font-medium text-sm text-gray-600 dark:text-gray-300 animate-in fade-in">
              Graph Exploration View
            </div>
          )}
        </div>

        {/* [Right Section] 액션 버튼들 or 레벨 배지 */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {viewMode === "graph" ? (
            // 그래프 모드일 때 액션 버튼들
            modifyMode === "IDLE" ? (
              <>
                <div className="hidden lg:flex items-center gap-1">
                  {[
                    { icon: Edit, label: "분리", onClick: startSplitMode },
                    { icon: Edit, label: "이동", onClick: moveToOtherMode },
                    { icon: Edit, label: "관계", onClick: startModifyMode },
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
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-black/5">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-white/20 bg-white/80 backdrop-blur-xl">
                      <DropdownMenuItem onClick={startSplitMode}>새 토픽으로 분리</DropdownMenuItem>
                      <DropdownMenuItem onClick={moveToOtherMode}>다른 토픽으로 이동</DropdownMenuItem>
                      <DropdownMenuItem onClick={startModifyMode}>관계 수정</DropdownMenuItem>
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
            // 채팅 모드일 때 레벨 배지
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