"use client";

import { useEffect, useState, useRef } from "react"; // useRef 추가
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
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
  
  // Textarea DOM 요소에 접근하기 위한 Ref 생성
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
    }
  }, []);

  // prompt가 변경될 때마다 높이 조절 (오토 리사이징 로직)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 높이를 먼저 'auto'로 초기화하여 줄어드는 상황에 대비
      textarea.style.height = "auto";
      // 스크롤 높이만큼 높이 설정 (내용에 딱 맞게 늘어남)
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

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
          <div className="flex items-end gap-2 p-3 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg"> {/* items-start -> items-end로 변경하여 버튼이 하단에 위치하게 함 (선택사항) */}
            <div className="flex-1 min-w-0">
              <Textarea
                ref={textareaRef} // Ref 연결
                placeholder="질문을 입력해주세요"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 text-lg py-3 resize-none whitespace-normal min-h-[56px] max-h-[230px] overflow-y-auto" 
                // 변경점 설명:
                // min-h-[56px]: 최소 1줄 높이 보장
                // max-h-[160px]: 약 5줄 높이 제한 (폰트 크기에 따라 조절 가능)
                // overflow-y-auto: 5줄 넘어가면 스크롤 발생
                rows={1} // 초기 rows를 1로 설정
              />
            </div>
            {hasMounted && isLogin ? (
              <Button
                onClick={handleStartNewTopic}
                disabled={!prompt.trim()}
                size="lg"
                className="flex-shrink-0 mb-1" // mb-1으로 위치 미세 조정
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            ) : hasMounted && !isLogin ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0 mb-1">
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
              <div className="flex-shrink-0 mb-1">
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