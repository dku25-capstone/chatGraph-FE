
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TopicTreeResponse } from "@/lib/data-transformer";
import { getTopicById } from "@/api/questions";
import { EnhancedBreadcrumbFocusView } from '@/components/enhanced-breadcrumb-focus-view';


export default function ChatPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [apiResponse, setApiResponse] = useState<TopicTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await getTopicById(topicId);
          setApiResponse(response);
        } catch (error) {
          console.error("Failed to fetch topic data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [topicId]);

  

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!apiResponse) {
    return <div className="flex items-center justify-center h-screen">Topic not found.</div>;
  }

  return (
    <EnhancedBreadcrumbFocusView 
      initialResponse={apiResponse} 
    />
  );
}
