"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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

  // --- 1. State를 'loading' 또는 'null'로 단순하게 초기화합니다 ---
  const [apiResponse, setApiResponse] = useState<TopicTreeResponse | null>(null);
  const [loading, setLoading] = useState(true); // 항상 true로 시작
  const apiCallStarted = useRef(false);
  // -----------------------------------------------------------

  const { setPrefetchedResponse } = useTopicStore();

  useEffect(() => {
    // --- 2. topicId가 확정될 때까지 아무것도 하지 않습니다 ---
    if (!topicId) {
      console.log("Waiting for topicId...");
      return;
    }

    console.log("--- useEffect triggered ---");
    console.log(`topicId: ${topicId}, isOptimistic: ${isOptimistic}`);

    // --- 3. 낙관적(Optimistic) 경로 ---
    if (isOptimistic) {
      console.log("-> Running OPTIMISTIC path");
      if (apiCallStarted.current) {
        console.log("-> API call already started, exiting.");
        return;
      }
      apiCallStarted.current = true;

      const optimisticDataString = sessionStorage.getItem(topicId);
      if (optimisticDataString) {
        // ... (기존 낙관적 로직 동일) ...
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
        setLoading(false); // 로딩 종료

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
            // TODO: 실패 처리 (예: 에러 페이지로 리디렉션 또는 UI 롤백)
            // router.replace("/error");
          });
      } else {
        console.log("-> Prompt NOT found in sessionStorage, redirecting to home.");
        router.replace("/");
      }
    
    // --- 4. 비-낙관적(Non-Optimistic) 경로 ---
    } else {
      console.log("-> Running NON-OPTIMISTIC path");

      // --- 5. Prefetched 데이터가 있는지 확인 ---
      const store = useTopicStore.getState();
      const prefetched = store.prefetchedResponse;
      const hasPrefetched = prefetched?.topic === topicId;

      if (hasPrefetched) {
        console.log("-> Running PREFETCHED path. Cleaning up store.");
        setApiResponse(prefetched);
        setLoading(false); // 로딩 종료
        setPrefetchedResponse(null); // 스토어 비우기
      
      // --- 6. Prefetched 데이터가 없으면, 서버에서 직접 Fetch ---
      } else {
        console.log("-> Running NORMAL fetch path. Calling fetchData...");
        
        const fetchData = async () => {
          try {
            // setLoading(true); // 이미 true 상태임
            const response = await getTopicById(topicId);
            setApiResponse(response);
          } catch (error) {
            console.error("Failed to fetch topic data:", error);
            setApiResponse(null);
          } finally {
            setLoading(false); // 로딩 종료
          }
        };

        fetchData();
      }
    }
    
    // topicId나 isOptimistic 플래그가 변경될 때마다 이 로직을 다시 실행합니다.
  }, [topicId, isOptimistic, router, setPrefetchedResponse]);

  // --- 7. 렌더링 로직은 동일 ---
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