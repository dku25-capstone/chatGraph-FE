import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    askQuestion,
    patchQuestion,
    deleteQuestion,
    copyQuestions,
    deleteQuestionBatch,
    separateQuestions,
    toggleFavoriteQuestion,
} from "@/api/questions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useGraphMutations() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // 1. 질문 생성
    const createQuestionMutation = useMutation({
        mutationFn: askQuestion,
        onSuccess: () => {
            // 성공 시 토픽 쿼리 무효화 (데이터 갱신)
            // 실제 데이터 갱신은 useTopicData 등의 쿼리가 담당
            queryClient.invalidateQueries({ queryKey: ["topic"] });
        },
        onError: (error) => {
            console.error("Failed to ask question:", error);
            toast.error("질문 생성에 실패했습니다.");
        },
    });

    // 2. 질문 수정 (이름 변경)
    const updateQuestionMutation = useMutation({
        mutationFn: ({
            questionId,
            newNodeName,
        }: {
            questionId: string;
            newNodeName: string;
        }) => patchQuestion(questionId, { newNodeName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic"] });
            toast.success("질문이 성공적으로 수정되었습니다.");
        },
        onError: (error) => {
            console.error("Failed to update question:", error);
            toast.error("질문 수정에 실패했습니다.");
        },
    });

    // 3. 질문 삭제
    const deleteQuestionMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic"] });
            toast.success("질문이 삭제되었습니다.");
        },
        onError: (error) => {
            console.error("Failed to delete question:", error);
            toast.error("질문 삭제에 실패했습니다.");
        },
    });

    // 4. 질문 이동 (Copy + Delete) -> Reparenting / Move to other topic
    const moveQuestionMutation = useMutation({
        mutationFn: async ({
            sourceQuestionIds,
            targetParentId,
        }: {
            sourceQuestionIds: string[];
            targetParentId: string;
        }) => {
            // 복사
            await copyQuestions({ sourceQuestionIds, targetParentId });
            // 원본 삭제
            await deleteQuestionBatch(sourceQuestionIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic"] }); // 현재 토픽 갱신
            toast.success("노드 이동이 완료되었습니다.");
        },
        onError: (error) => {
            console.error("Move failed:", error);
            toast.error("노드 이동에 실패했습니다.");
        },
    });

    // 5. 새 토픽으로 분리
    const splitTopicMutation = useMutation({
        mutationFn: async (sourceQuestionIds: string[]) => {
            // 분리 API 호출
            const response = await separateQuestions({ sourceQuestionIds });
            // 원본 삭제
            await deleteQuestionBatch(sourceQuestionIds);
            return response.newTopicId;
        },
        onSuccess: (newTopicId) => {
            queryClient.invalidateQueries({ queryKey: ["topic"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] }); // 사이드바 목록 갱신
            toast.success("새 토픽으로 분리가 완료되었습니다!");
            router.push(`/${newTopicId}`);
        },
        onError: (error) => {
            console.error("Split failed:", error);
            toast.error("새 토픽으로 분리하는데 실패했습니다.");
        },
    });

    // 6. 즐겨찾기 토글
    const toggleFavoriteMutation = useMutation({
        mutationFn: toggleFavoriteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topic"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] }); // 사이드바 즐겨찾기 상태 갱신 가능성 고려
            toast.success("즐겨찾기 상태가 변경되었습니다.");
        },
        onError: (error) => {
            console.error("Toggle favorite failed:", error);
            toast.error("즐겨찾기 상태 변경에 실패했습니다.");
        }
    });

    return {
        createQuestion: createQuestionMutation,
        updateQuestion: updateQuestionMutation,
        deleteQuestion: deleteQuestionMutation,
        moveQuestion: moveQuestionMutation,
        splitTopic: splitTopicMutation,
        toggleFavorite: toggleFavoriteMutation
    };
}
