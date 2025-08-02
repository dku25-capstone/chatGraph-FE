import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Network, List } from "lucide-react";

interface FocusViewHeaderProps {
  viewMode: "chat" | "graph";
  setViewMode: (mode: "chat" | "graph") => void;
  goHome: () => void;
  pathLength: number;
  onGraphViewClick?: () => void;
}

export const FocusViewHeader = ({
  viewMode,
  setViewMode,
  goHome,
  pathLength,
  onGraphViewClick,
}: FocusViewHeaderProps) => {
  if (viewMode === "graph") {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode("chat")}>
            <List className="h-4 w-4 mr-2" />
            채팅으로 이동
          </Button>
          <h1 className="text-xl font-semibold">질문 그래프</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={goHome}>
          <Home className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (onGraphViewClick) onGraphViewClick();
            setViewMode("graph");
          }}
        >
          <Network className="h-4 w-4 mr-2" />
          그래프로 보기
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          Level {pathLength}
        </Badge>
      </div>
    </div>
  );
};
