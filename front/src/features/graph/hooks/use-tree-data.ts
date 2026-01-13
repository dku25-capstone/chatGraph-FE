import { useState, useEffect, useMemo, useCallback } from "react";
import {
    ViewData,
    TopicTreeResponse,
    transformApiDataToViewData,
} from "@/lib/data-transformer";
import { findPathToNode } from "@/lib/utils";
import { useTopicStore } from "@/lib/topic-store";
import { getTopicById } from "@/api/questions";

export const useTreeData = (
    initialResponse: TopicTreeResponse,
    topicId: string,
    initialQuestionId?: string | null
) => {
    const initialViewData = useMemo(
        () => transformApiDataToViewData(initialResponse),
        [initialResponse]
    );

    const [viewData, setViewData] = useState<ViewData | null>(initialViewData);
    const [currentPath, setCurrentPath] = useState<ViewData[]>([initialViewData]);
    const [viewMode, setViewMode] = useState<"chat" | "graph">("chat");
    const [isLoading, setIsLoading] = useState(false);

    // Sync with TopicStore
    useEffect(() => {
        if (viewData && topicId) {
            useTopicStore.getState().setTopic(topicId, viewData.questionText);
        }
    }, [viewData, topicId]);

    const currentTopicNameFromStore = useTopicStore(
        (state) => state.currentTopicName
    );
    const currentTopicIdFromStore = useTopicStore(
        (state) => state.currentTopicId
    );

    // Update root name from store if changed
    useEffect(() => {
        setViewData((prevViewData) => {
            if (
                prevViewData &&
                currentTopicIdFromStore === topicId &&
                currentTopicNameFromStore !== prevViewData.questionText
            ) {
                const newRoot = {
                    ...prevViewData,
                    questionText: currentTopicNameFromStore || "",
                };
                setCurrentPath((prevPath) => [newRoot, ...prevPath.slice(1)]);
                return newRoot;
            }
            return prevViewData;
        });
    }, [
        currentTopicNameFromStore,
        currentTopicIdFromStore,
        topicId,
    ]);

    // Initial deep link navigation
    useEffect(() => {
        if (initialQuestionId && viewData) {
            const path = findPathToNode(viewData, initialQuestionId);
            if (path) {
                setCurrentPath(path);
            }
        }
    }, [initialQuestionId, viewData]);

    // Reset path when switching to graph mode
    useEffect(() => {
        if (viewMode === "graph") {
            if (viewData && currentPath.length > 1) {
                setCurrentPath([viewData]);
            }
        }
    }, [viewMode, viewData, currentPath.length]);

    const currentQuestion = useMemo(
        () => (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null),
        [currentPath]
    );

    const navigateToQuestion = useCallback(
        (question: ViewData, index: number) => {
            setCurrentPath((prevPath) => prevPath.slice(0, index + 1));
        },
        []
    );

    const addToPath = useCallback((question: ViewData) => {
        setCurrentPath((prevPath) => [...prevPath, question]);
    }, []);

    const goHome = useCallback(() => {
        if (viewData) {
            setCurrentPath([viewData]);
        }
    }, [viewData]);

    const refreshViewData = useCallback(async () => {
        if (!topicId) return;
        setIsLoading(true);
        try {
            const updatedResponse = await getTopicById(topicId);
            const newViewData = transformApiDataToViewData(updatedResponse);
            setViewData(newViewData);
            // Refresh usually implies we want to see the latest state, 
            // but resetting navigation might annoy user. 
            // Original logic reset path to root: setCurrentPath([newViewData]);
            // Let's keep original behavior for now or try to preserve path if possible.
            // Rule 1.3 refactor kept it simple:
            setCurrentPath([newViewData]);
        } catch (error) {
            console.error("Failed to refresh topic data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [topicId]);

    return {
        viewData,
        setViewData,
        currentPath,
        setCurrentPath,
        viewMode,
        setViewMode,
        isLoading,
        setIsLoading,
        currentQuestion,
        navigateToQuestion,
        addToPath,
        goHome,
        refreshViewData,
    };
};
