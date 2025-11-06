"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { askQuestion } from "@/api/questions";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StartNewTopicForm() {
  const [prompt, setPrompt] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
    }
  }, []);

  const handleStartNewTopic = async () => {
    if (!prompt.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    sessionStorage.setItem(tempId, JSON.stringify({ prompt, timestamp }));

    router.push(`/${tempId}?optimistic=true`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <Image
          src="/chatlogo.png"
          alt="Chat Logo"
          width={120}
          height={120}
          className="mx-auto mb-20"
        />
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
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleStartNewTopic();
                  }
                }}
                className="border-0 bg-transparent focus-visible:ring-0 text-lg py-3"
              />
            </div>
            {hasMounted && isLogin ? (
              <Button
                onClick={handleStartNewTopic}
                disabled={!prompt.trim()}
                size="lg"
                className="flex-shrink-0"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            ) : hasMounted && !isLogin ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0">
                    <Button disabled size="lg" className="cursor-not-allowed">
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>로그인이 필요합니다</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex-shrink-0">
                <Button disabled size="lg" className="cursor-not-allowed">
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
