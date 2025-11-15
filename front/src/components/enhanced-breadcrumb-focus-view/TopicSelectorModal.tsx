"use client";

import { useState, useEffect } from "react";
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
import { getTopicById } from "@/api/questions";
import { getTopicsHistory } from "@/api/topics-history";
import { ViewData, transformApiDataToViewData } from "@/lib/data-transformer";
import { useQuestionTreeContext } from "./QuestionTreeContext";

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

  const [step, setStep] = useState<"SELECT_TOPIC" | "SELECT_NODE">(
    "SELECT_TOPIC"
  );

  // 토픽 목록
  const [topics, setTopics] = useState<TopicHistoryItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicHistoryItem | null>(
    null
  );

  // 선택한 토픽의 그래프 데이터
  const [targetTopicGraph, setTargetTopicGraph] = useState<ViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 토픽 목록(history)을 불러옴
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때마다 초기화
      setStep("SELECT_TOPIC");
      setSelectedTopic(null);
      setTargetTopicGraph(null);

      const fetchTopics = async () => {
        setIsLoading(true);
        try {
          // 'getTopicsHistory' API가 토픽 목록을 반환
          const topicList = await getTopicsHistory();
          setTopics(topicList);
        } catch (error) {
          console.error("토픽 목록을 불러오는 데 실패했습니다.", error);
        }
        setIsLoading(false);
      };
      fetchTopics();
    }
  }, [isOpen]);

  // 사용자가 토픽을 선택했을 때 해당 토픽의 그래프 데이터를 불러옴
  const handleTopicSelect = async (topic: TopicHistoryItem) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    try {
      // 'getTopicById' API가 해당 토픽의 전체 트리를 반환
      const topicTree = await getTopicById(topic.topicId);
      setTargetTopicGraph(transformApiDataToViewData(topicTree));
      setStep("SELECT_NODE");
    } catch (error) {
      console.error("토픽 그래프를 불러오는 데 실패했습니다.", error);
    }
    setIsLoading(false);
  };

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
