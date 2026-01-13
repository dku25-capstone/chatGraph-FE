"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InteractiveD3Graph } from "../interactive-d3-graph"; // D3 그래프 재사용
// 토픽 목록 API 경로
// 토픽 목록 API 경로 제거 (Hooks에서 사용)
import { ViewData } from "@/lib/data-transformer";
import { useQuestionTreeContext } from "./question-tree-context";
import { useTopicSelector } from "@/features/graph/hooks/use-topic-selector"; // Import the custom hook

// API 응답 타입
interface TopicHistoryItem {
  topicId: string;
  topicName: string;
  createdAt: string;
}

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodeToMove: ViewData | null;
  onNodeSelected: (
    targetTopic: TopicHistoryItem,
    targetParentNode: { id: string; name: string }
  ) => void;
}

export function TopicSelectorModal({
  isOpen,
  onClose,
  onNodeSelected,
}: TopicSelectorModalProps) {
  const { viewData } = useQuestionTreeContext();
  const currentTopicId = viewData ? viewData.id : null;

  // Custom Hook으로 로직 분리 (React Query 사용)
  const {
    step,
    topics,
    selectedTopic,
    targetTopicGraph,
    isLoading,
    handleTopicSelect,
    resetSelection,
  } = useTopicSelector(isOpen);

  // 모달이 닫히거나 열릴 때 초기화 로직은 훅 내부 상태나 useEffect로 처리할 수도 있지만,
  // 여기서는 isOpen 변경 시 훅의 상태를 리셋하는 방식을 사용하거나, 
  // 훅 내부에서 isOpen 의존성을 처리하도록 위임했습니다.
  // 다만, 모달을 닫았다 열었을 때 초기 화면으로 돌아가게 하려면:
  useEffect(() => {
    if (isOpen) {
      resetSelection();
    }
  }, [isOpen, resetSelection]);


  // 미니 그래프에서 부모 노드를 선택했을 때
  const handleNodeSelect = (node: ViewData) => {
    if (!selectedTopic) return;
    // 최종 선택 완료. 부모에게 알림
    onNodeSelected(selectedTopic, { id: node.id, name: node.questionText });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>이동할 토픽 및 노드 선택</DialogTitle>
          <DialogDescription>
            {step === "SELECT_TOPIC"
              ? "이동할 대상 토픽을 선택하세요."
              : `[${selectedTopic?.topicName}] 토픽에서 새로 연결할 부모 노드를 클릭하세요.`}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <div>로딩 중...</div>}

        {/* 토픽 목록 보여주기 */}
        {!isLoading && step === "SELECT_TOPIC" && (
          <ScrollArea className="flex-1">
            <Command>
              <CommandInput placeholder="토픽 검색..." />
              <CommandList>
                <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                <CommandGroup>
                  {topics.map((topic) => (
                    <CommandItem
                      key={topic.topicId}
                      // 현재 토픽은 비활성화
                      disabled={topic.topicId === currentTopicId}
                      onSelect={() => handleTopicSelect(topic)}
                    >
                      {topic.topicName}
                      {topic.topicId === currentTopicId && " (현재 토픽)"}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </ScrollArea>
        )}

        {/* 선택한 토픽의 그래프 보여주기 */}
        {!isLoading && step === "SELECT_NODE" && targetTopicGraph && (
          <div className="flex-1 border rounded-md overflow-hidden ">
            {/* D3 그래프 컴포넌트 재사용 */}
            <InteractiveD3Graph
              data={targetTopicGraph}
              onNodeClick={handleNodeSelect} // 클릭 시 handleNodeSelect 호출
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
