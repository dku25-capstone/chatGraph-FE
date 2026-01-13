import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTopicById, askQuestion, TopicTreeResponse, TopicNode } from "@/api/questions";
import { useTopicStore } from "@/lib/topic-store";
import { toast } from "sonner";

interface UseTopicDataProps {
    topicId: string;
    isOptimistic: boolean;
}

export function useTopicData({ topicId, isOptimistic }: UseTopicDataProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { prefetchedResponse, setPrefetchedResponse, addTopic } = useTopicStore();

    // 낙관적 UI 표시를 위한 로컬 상태
    // React Query의 캐시와 별도로 관리되는 "생성 중인 임시 상태"입니다.
    const [optimisticStepData, setOptimisticStepData] = useState<TopicTreeResponse | null>(null);
    const apiCallStarted = useRef(false);

    // 1. 일반적인 토픽 조회 (리액트 쿼리)
    const {
        data: fetchedData,
        isLoading: isFetching,
        error
    } = useQuery({
        queryKey: ["topic", topicId],
        queryFn: () => getTopicById(topicId),
        // 낙관적 모드가 아닐 때만 실행
        enabled: !!topicId && !isOptimistic,
        // 스토어에 있는 프리패치 데이터를 초기 데이터로 사용
        initialData: () => {
            if (prefetchedResponse?.topic === topicId) {
                return prefetchedResponse;
            }
            return undefined;
        },
        // 초기 데이터가 있으면 staleTime을 지나도 즉시 refetch 하지 않음 (옵션)
        initialDataUpdatedAt: () => {
            return prefetchedResponse?.topic === topicId ? Date.now() : 0
        }
    });

    // 스토어의 프리패치 데이터 사용 후 정리
    useEffect(() => {
        if (prefetchedResponse?.topic === topicId && !isOptimistic) {
            // 쿼리 데이터로 들어갔으므로 스토어는 비워줌 (중복 방지)
            setPrefetchedResponse(null);
        }
    }, [topicId, prefetchedResponse, setPrefetchedResponse, isOptimistic]);


    // 2. 낙관적 토픽 생성 (뮤테이션)
    const createTopicMutation = useMutation({
        mutationFn: askQuestion,
        onSuccess: (realResponse) => {
            const topicNode = realResponse.nodes[realResponse.topic] as TopicNode;

            // 사이드바 목록에 추가
            addTopic({
                topicId: realResponse.topic,
                topicName: topicNode.topicName,
                createdAt: topicNode.createdAt,
                favorite: false,
            });

            // 프리패치 스토어에 저장 (리다이렉트 후 즉시 표시 위함)
            setPrefetchedResponse(realResponse);

            // React Query 캐시에도 미리 넣어둘 수 있음 (선택 사항)
            queryClient.setQueryData(["topic", realResponse.topic], realResponse);

            // 사이드바 목록 갱신 (Invalidate 'topics' query)
            queryClient.invalidateQueries({ queryKey: ["topics"] });

            // 실제 URL로 교체
            router.replace(`/${realResponse.topic}`);
        },
        onError: (error) => {
            console.error("Optimistic question asking failed:", error);
            toast.error("대화를 생성하지 못했습니다. 다시 시도해주세요.");
            router.replace("/");
        },
    });

    // 3. 낙관적 모드 초기화 로직 (Effect)
    useEffect(() => {
        if (!isOptimistic || !topicId) return;
        if (apiCallStarted.current) return;

        apiCallStarted.current = true;

        const optimisticDataString = sessionStorage.getItem(topicId);
        if (!optimisticDataString) {
            router.replace("/");
            return;
        }

        try {
            const { prompt, timestamp } = JSON.parse(optimisticDataString);

            // 가짜 응답 생성 (UI 즉시 표시용)
            const fakeResponse: TopicTreeResponse = {
                topic: topicId,
                nodes: {
                    [topicId]: {
                        topicId: topicId,
                        topicName: prompt,
                        createdAt: timestamp,
                        children: [`question-${topicId}`],
                    },
                    [`question-${topicId}`]: {
                        questionId: `question-${topicId}`,
                        questionText: prompt,
                        level: 1,
                        answerId: `answer-${topicId}`,
                        answerText: "",
                        createdAt: timestamp,
                        children: [],
                    },
                },
            };

            setOptimisticStepData(fakeResponse);

            // 백그라운드에서 실제 생성 요청
            createTopicMutation.mutate({ questionText: prompt });

        } catch (e) {
            console.error("Failed to parse optimistic data", e);
            router.replace("/");
        }
    }, [topicId, isOptimistic, router, createTopicMutation]);

    // View에서 사용할 최종 데이터와 상태 계산
    const data = isOptimistic ? optimisticStepData : fetchedData;
    const isLoading = isOptimistic ? !optimisticStepData : isFetching;

    return { data, isLoading, error };
}
