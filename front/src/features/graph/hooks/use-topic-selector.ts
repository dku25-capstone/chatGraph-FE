import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopicsHistory, TopicHistoryItem } from "@/api/topics-history";
import { getTopicById } from "@/api/questions";
import { transformApiDataToViewData } from "@/lib/data-transformer";

export function useTopicSelector(isOpen: boolean) {
    const [selectedTopic, setSelectedTopic] = useState<TopicHistoryItem | null>(null);
    const [step, setStep] = useState<"SELECT_TOPIC" | "SELECT_NODE">("SELECT_TOPIC");

    // 1. 토픽 목록 조회
    const {
        data: topics = [],
        isLoading: isLoadingTopics
    } = useQuery({
        queryKey: ["topics"],
        queryFn: getTopicsHistory,
        enabled: isOpen && step === "SELECT_TOPIC", // 모달이 열려있고 토픽 선택 단계일 때만
    });

    // 2. 선택된 토픽의 상세 그래프 데이터 조회
    const {
        data: targetTopicGraph,
        isLoading: isLoadingGraph
    } = useQuery({
        queryKey: ["topic", selectedTopic?.topicId],
        queryFn: async () => {
            if (!selectedTopic) return null;
            const apiResponse = await getTopicById(selectedTopic.topicId);
            return transformApiDataToViewData(apiResponse);
        },
        enabled: !!selectedTopic && isOpen, // 토픽이 선택되었을 때만
    });

    const handleTopicSelect = (topic: TopicHistoryItem) => {
        setSelectedTopic(topic);
        setStep("SELECT_NODE");
    };

    const resetSelection = () => {
        setStep("SELECT_TOPIC");
        setSelectedTopic(null);
    };

    return {
        step,
        topics,
        selectedTopic,
        targetTopicGraph,
        isLoading: isLoadingTopics || isLoadingGraph,
        handleTopicSelect,
        resetSelection,
        setStep
    };
}
