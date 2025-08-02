"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopicTreeResponse } from "@/lib/data-transformer"; // API 응답 타입
import { getTopicById } from "@/api/questions"; // 특정 topicId에 해당하는 질문 트리 데이터를 가져오는 API 함수
import { EnhancedBreadcrumbFocusView } from "@/components/enhanced-breadcrumb-focus-view"; // 질문-답변 트리를 브레드크럼 형식으로 시각화하는 메인 UI 컴포넌트

export default function ChatPage() {
  const params = useParams(); // URL에서 파라미터(id) 가져옴
  const topicId = params.id as string; // 현재 토픽의 id를 문자열로 저장

  // API에서 받은 전체 트리 데이터를 저장하는 상태
  const [apiResponse, setApiResponse] = useState<TopicTreeResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    if (topicId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await getTopicById(topicId);
          setApiResponse(response); // 응답 데이터를 상태에 저장
        } catch (error) {
          console.error("Failed to fetch topic data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [topicId]); // topicId가 바뀔때마다 다시 호출

  // 로딩중
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  // 데이터 없을 경우 에러 표시
  if (!apiResponse) {
    return (
      <div className="flex items-center justify-center h-screen">
        Topic not found.
      </div>
    );
  }

  return (
    <EnhancedBreadcrumbFocusView
      initialResponse={apiResponse} // 초기 질문 트리 데이터를 전달
    />
  );
}
