import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, List, Edit, X, MoreVertical } from "lucide-react";
import { useQuestionTreeContext } from "./QuestionTreeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export const FocusViewHeader = () => {
  const {
    viewMode,
    setViewMode,
    startSplitMode,
    currentPath,
    modifyMode,
    startModifyMode,
    cancelModifyMode,
    moveToOtherMode,
  } = useQuestionTreeContext();

  if (viewMode === "graph") {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4 ml-12 md:ml-0">
          <Button variant="outline" onClick={() => setViewMode("chat")}>
            <List className="h-4 w-4 mr-2" />
            채팅으로 이동
          </Button>
          {/* <h1 className="text-xl font-semibold">질문 그래프</h1> */}
        </div>
        <div className="flex items-center gap-2">
          {modifyMode === "IDLE" ? (
            <>
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="outline" onClick={startSplitMode}>
                  <Edit className="h-4 w-4 mr-2" />새 토픽으로 분리
                </Button>
                <Button variant="outline" onClick={moveToOtherMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  다른 토픽으로 이동
                </Button>
                {/* 3a. 기본 모드일 때는 "수정" 버튼 */}
                <Button variant="outline" onClick={startModifyMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  관계 수정
                </Button>
              </div>

              {/* lg 미만일때 보이는 드롭다운 메뉴 */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-popover text-popover-foreground border shadow-md rounded-md cursor-pointer"
                  >
                    <DropdownMenuItem
                      className="py-1 px-1"
                      onClick={startSplitMode}
                    >
                      새 토픽으로 분리
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="py-1 px-1"
                      onClick={moveToOtherMode}
                    >
                      다른 토픽으로 이동
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="py-1 px-1"
                      onClick={startModifyMode}
                    >
                      관계 수정
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            // 3b. 수정 모드일 때는 "취소" 버튼
            <Button variant="destructive" onClick={cancelModifyMode}>
              <X className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">수정 취소</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4 ml-12 md:ml-0">
        <Button
          variant="outline"
          onClick={() => {
            setViewMode("graph");
          }}
        >
          <Network className="h-4 w-4 mr-2" />
          그래프로 보기
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          Level {currentPath.length}
        </Badge>
      </div>
    </div>
  );
};
