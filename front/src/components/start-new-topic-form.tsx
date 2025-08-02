"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { askQuestion } from "@/api/questions";

export function StartNewTopicForm() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartNewTopic = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await askQuestion({ questionText: prompt });
      router.push(`/${response.topic}`); // 동적 라우팅
    } catch (error) {
      console.error("Error starting new topic:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          새로운 질문을 시작해보세요
        </h1>
        <p className="text-lg text-gray-600">새로운 토픽을 생성해주세요</p>
        <div className="relative">
          <div className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <Input
                placeholder="질문을 입력해주세요"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleStartNewTopic();
                  }
                }}
                className="border-0 bg-transparent focus-visible:ring-0 text-lg py-3"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleStartNewTopic}
              disabled={!prompt.trim() || isLoading}
              size="lg"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
