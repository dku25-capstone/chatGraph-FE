"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { EnhancedBreadcrumbFocusView } from "@/features/graph/components/breadcrumb-view";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTopicData } from "@/features/chat/hooks/use-topic-data";

function ChatPageContentInner() {
  const params = useParams();
  const searchParams = useSearchParams();

  const topicId = params.id as string;
  const isOptimistic = searchParams.get("optimistic") === "true";
  const questionIdFromSearch = searchParams.get("question");

  // Rule 1.3: 분리된 로직(Hook)을 사용하여 데이터 가져오기
  const { data: apiResponse, isLoading } = useTopicData({
    topicId,
    isOptimistic
  });

  if (isLoading) {
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

export default function ChatPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <ChatPageContentInner />
    </Suspense>
  );
}
