import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Network, List } from "lucide-react";

interface FocusViewHeaderProps {
  viewMode: 'chat' | 'graph';
  setViewMode: (mode: 'chat' | 'graph') => void;
  goHome: () => void;
  pathLength: number;
}

export const FocusViewHeader = ({ viewMode, setViewMode, goHome, pathLength }: FocusViewHeaderProps) => {
  if (viewMode === 'graph') {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('chat')}>
            <List className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-xl font-semibold">Question Tree Graph</h1>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {pathLength} levels deep
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={goHome}>
          <Home className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => setViewMode('graph')}>
          <Network className="h-4 w-4 mr-2" />
          View as Graph
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