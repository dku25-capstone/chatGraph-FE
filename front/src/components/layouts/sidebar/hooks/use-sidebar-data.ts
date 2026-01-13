import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTopicsHistory, TopicHistoryItem } from "@/api/topics-history";
import { searchQuestions, QuestionNode } from "@/api/questions";
import { patchTopic, deleteTopic, toggleFavoriteTopic } from "@/api/topics";
import { toast } from "sonner";

// 검색 결과 노드 인터페이스 (토픽 ID 포함)
export interface SearchResultNode extends QuestionNode {
    topicId: string;
}

export function useSidebarData(isLoggedIn: boolean) {
    const queryClient = useQueryClient();

    // 1. 토픽 목록 조회 (Query)
    const {
        data: topics = [],
        isLoading: loadingTopics,
        error,
    } = useQuery({
        queryKey: ["topics"],
        queryFn: async () => {
            const fetchedTopics = await getTopicsHistory();
            // CreatedAt 기준 내림차순 정렬
            return fetchedTopics.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        },
        enabled: isLoggedIn, // 로그인 상태일 때만 실행
        staleTime: 60 * 1000, // 1분간 신선함 유지
    });

    // 2. 토픽 이름 수정 (Mutation)
    const updateTopicMutation = useMutation({
        mutationFn: ({ topicId, newName }: { topicId: string; newName: string }) =>
            patchTopic(topicId, { newNodeName: newName }),
        onMutate: async ({ topicId, newName }) => {
            // 낙관적 업데이트: 쿼리 취소 -> 스냅샷 저장 -> 캐시 수정
            await queryClient.cancelQueries({ queryKey: ["topics"] });
            const previousTopics = queryClient.getQueryData<TopicHistoryItem[]>(["topics"]);

            if (previousTopics) {
                queryClient.setQueryData<TopicHistoryItem[]>(["topics"], (old) =>
                    old?.map((t) => (t.topicId === topicId ? { ...t, topicName: newName } : t))
                );
            }
            return { previousTopics };
        },
        onError: (err, newTodo, context) => {
            // 에러 발생 시 롤백
            if (context?.previousTopics) {
                queryClient.setQueryData(["topics"], context.previousTopics);
            }
            toast.error("수정에 실패했습니다.");
        },
        onSuccess: () => {
            toast.success("토픽명이 수정되었습니다.");
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });

    // 3. 토픽 삭제 (Mutation)
    const deleteTopicMutation = useMutation({
        mutationFn: deleteTopic,
        onMutate: async (topicId) => {
            await queryClient.cancelQueries({ queryKey: ["topics"] });
            const previousTopics = queryClient.getQueryData<TopicHistoryItem[]>(["topics"]);

            if (previousTopics) {
                queryClient.setQueryData<TopicHistoryItem[]>(["topics"], (old) =>
                    old?.filter((t) => t.topicId !== topicId)
                );
            }
            return { previousTopics };
        },
        onError: (err, topicId, context) => {
            if (context?.previousTopics) {
                queryClient.setQueryData(["topics"], context.previousTopics);
            }
            toast.error("삭제에 실패했습니다.");
        },
        onSuccess: () => {
            toast.success("대화가 삭제되었습니다.");
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });

    // 4. 즐겨찾기 토글 (Mutation)
    const toggleFavoriteMutation = useMutation({
        mutationFn: toggleFavoriteTopic,
        onMutate: async (topicId) => {
            await queryClient.cancelQueries({ queryKey: ["topics"] });
            const previousTopics = queryClient.getQueryData<TopicHistoryItem[]>(["topics"]);

            if (previousTopics) {
                queryClient.setQueryData<TopicHistoryItem[]>(["topics"], (old) =>
                    old?.map((t) => (t.topicId === topicId ? { ...t, favorite: !t.favorite } : t))
                );
            }
            return { previousTopics };
        },
        onError: (err, topicId, context) => {
            if (context?.previousTopics) {
                queryClient.setQueryData(["topics"], context.previousTopics);
            }
            // 토스트 메시지 생략 (인터랙션이 빈번하므로)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        }
    });

    // 5. 검색 로직 (Hooks는 아니지만 관련성이 높으므로 함께 배치하거나 별도 훅으로 분리 가능)
    // 여기서는 단순히 API 래퍼로 제공하고 상태는 컴포넌트에서 관리하도록 함 (복잡도 감소)
    const search = async (term: string): Promise<SearchResultNode[]> => {
        const response = await searchQuestions(term);
        if (response && Array.isArray(response)) {
            const allNodes: SearchResultNode[] = [];

            response.forEach((item) => {
                if (item && item.nodes) {
                    const nodes = Object.keys(item.nodes).map((nodeId) => {
                        const node = item.nodes[nodeId];
                        return {
                            ...node,
                            topicId: item.topic,
                        }
                    });
                    allNodes.push(...nodes);
                }
            });
            return allNodes;
        }
        return [];
    };

    return {
        topics,
        loadingTopics,
        updateTopic: updateTopicMutation.mutate,
        removeTopic: deleteTopicMutation.mutate,
        toggleFavorite: toggleFavoriteMutation.mutate,
        searchQuestions: search,
        error // Return error to suppress unused var warning (and allow handling it)
    };
}
