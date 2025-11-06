"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { TopicTreeResponse, askQuestion } from "@/api/questions";
import { getTopicById } from "@/api/questions";
import { EnhancedBreadcrumbFocusView } from "@/components/enhanced-breadcrumb-focus-view";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTopicStore } from "@/lib/topic-store";

function ChatPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const topicId = params.id as string;
  const isOptimistic = searchParams.get("optimistic") === "true";
  const questionIdFromSearch = searchParams.get("question");

  // --- Synchronous state initialization from store ---
  const store = useTopicStore.getState();
  const prefetched = store.prefetchedResponse;
  const hasPrefetched = prefetched?.topic === topicId;

  const [apiResponse, setApiResponse] = useState<TopicTreeResponse | null>(
    hasPrefetched ? prefetched : null
  );
  const [loading, setLoading] = useState(!hasPrefetched);
  const apiCallStarted = useRef(false);
  // --------------------------------------------------

  const { setPrefetchedResponse } = useTopicStore();

  const fetchData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await getTopicById(id);
      setApiResponse(response);
    } catch (error) {
      console.error("Failed to fetch topic data:", error);
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("--- useEffect triggered ---");
    console.log(`topicId: ${topicId}, isOptimistic: ${isOptimistic}, hasPrefetched: ${hasPrefetched}`);

    if (isOptimistic) {
      console.log("-> Running OPTIMISTIC path");
      if (apiCallStarted.current) {
        console.log("-> API call already started, exiting.");
        return;
      }
      apiCallStarted.current = true;

      const optimisticDataString = sessionStorage.getItem(topicId);
      if (optimisticDataString) {
        const { prompt, timestamp } = JSON.parse(optimisticDataString);
        console.log("-> Found prompt in sessionStorage, creating fake response.");
        const tempTopicId = topicId;
        const fakeResponse: TopicTreeResponse = {
          topic: tempTopicId,
          nodes: {
            [tempTopicId]: {
              topicId: tempTopicId,
              topicName: prompt,
              createdAt: timestamp,
              children: [`question-${tempTopicId}`],
            },
            [`question-${tempTopicId}`]: {
              questionId: `question-${tempTopicId}`,
              questionText: prompt,
              level: 1,
              answerId: `answer-${tempTopicId}`,
              answerText: "",
              createdAt: timestamp,
              children: [],
            },
          },
        };
        setApiResponse(fakeResponse);
        setLoading(false);

        console.log("-> Calling askQuestion in background...");
        askQuestion({ questionText: prompt })
          .then(realResponse => {
            console.log("-> askQuestion SUCCESS. Saving to store and replacing URL.");
            const topicNode = realResponse.nodes[realResponse.topic] as any;
            useTopicStore.getState().addTopic({
              topicId: realResponse.topic,
              topicName: topicNode.topicName,
              createdAt: topicNode.createdAt,
            });
            setPrefetchedResponse(realResponse);
            router.replace(`/${realResponse.topic}`);
          })
          .catch(error => {
            console.error("Optimistic question asking failed:", error);
          });
      } else {
        console.log("-> Prompt NOT found in sessionStorage, redirecting to home.");
        router.replace("/");
      }
    } else {
      if (hasPrefetched) {
        console.log("-> Running PREFETCHED path. Cleaning up store.");
        setPrefetchedResponse(null);
      } else {
        console.log("-> Running NORMAL fetch path. Calling fetchData...");
        fetchData(topicId);
      }
    }
  }, [topicId, isOptimistic, fetchData, router, hasPrefetched, setPrefetchedResponse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!apiResponse) {
    return (
      <div className="flex items-center justify-center h-screen">
        Topic not found.
      </div>
    );
  }

  return (
    <EnhancedBreadcrumbFocusView
      initialResponse={apiResponse}
      initialQuestionId={questionIdFromSearch}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
