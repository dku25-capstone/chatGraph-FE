"use client";

import { useEffect, useState, useRef } from "react";
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
import { cn } from "@/lib/utils"; // cn 유틸리티 import 가정

export function StartNewTopicForm() {
  const [prompt, setPrompt] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
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

  // [Glassmorphism Container Style - FocusViewHeader/NewQuestionForm과 통일]
  const glassContainerClass = cn(
    "relative w-full flex items-end gap-2 p-2", // 내부 패딩과 정렬
    "rounded-[26px]", // 일관된 곡률 (알약 형태)

    // [Glass Effect]
    "bg-white/60 dark:bg-black/60", // 기본 반투명
    "backdrop-blur-2xl", // 강한 블러
    "border border-white/40 dark:border-white/10", // 유리 테두리
    "shadow-2xl shadow-black/10", // 깊이감 있는 그림자

    // [Interaction]
    "transition-all duration-300 ease-out",
    "focus-within:bg-white/80 dark:focus-within:bg-black/80", // 포커스 시 불투명도 증가
    "focus-within:shadow-black/20 focus-within:scale-[1.01]" // 포커스 시 미세하게 강조
  );

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 min-h-[80vh]">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* 로고 및 타이틀 영역 */}
        <div className="space-y-6">
          <div className="relative w-[120px] h-[120px] mx-auto">
            {/* 로고에 은은한 광채 추가 (선택사항) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <Image
              src="/chatlogo.png"
              alt="Chat Logo"
              width={120}
              height={120}
              className="relative mx-auto drop-shadow-xl"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              새로운 질문을 시작해보세요
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              무엇이든 물어보세요. 깊이 있는 대화가 기다리고 있습니다.
            </p>
          </div>
        </div>

        {/* 입력 폼 영역 */}
        <div className="relative px-2 sm:px-0">
          <div className={glassContainerClass}>
            <div className="flex-1 min-w-0 pl-2 py-1">
              <Textarea
                ref={textareaRef}
                placeholder="질문을 입력해주세요..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && hasMounted && isLogin) {
                      handleStartNewTopic();
                    }
                  }
                }}
                className={cn(
                  "border-0 shadow-none focus-visible:ring-0 px-0 py-2",
                  "bg-transparent", // 컨테이너의 Glass 효과를 투과
                  "text-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-500/70",
                  "resize-none min-h-[56px] max-h-[230px] overflow-y-auto",
                  "scrollbar-hide"
                )}
                rows={1}
              />
            </div>

            {/* 전송 버튼 영역 */}
            <div className="flex-shrink-0 mb-1 mr-1">
              {hasMounted && isLogin ? (
                <Button
                  onClick={handleStartNewTopic}
                  disabled={!prompt.trim()}
                  size="icon"
                  className={cn(
                    "rounded-full h-12 w-12 transition-all duration-200",
                    prompt.trim()
                      ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200/50 text-gray-400 dark:bg-white/10 dark:text-gray-500 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
              ) : hasMounted && !isLogin ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-not-allowed">
                      <Button
                        disabled
                        size="icon"
                        className="rounded-full h-12 w-12 bg-gray-200/50 text-gray-400 dark:bg-white/10"
                      >
                        <ArrowUp className="h-6 w-6" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>로그인이 필요합니다</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                // 로딩/초기 상태
                <Button
                  disabled
                  size="icon"
                  className="rounded-full h-12 w-12 bg-gray-200/50 text-gray-400 dark:bg-white/10"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
