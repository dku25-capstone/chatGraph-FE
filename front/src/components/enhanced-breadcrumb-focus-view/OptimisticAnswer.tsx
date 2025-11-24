"use client";

import { useState, useEffect } from "react";
import { GlobalMarkdown } from "@/utils/GlobalMarkDown"; // 경로에 맞게 수정
const loadingMessages = [
  "답을 찾는 중입니다 .",
  "답을 찾는 중입니다 ..",
  "답을 찾는 중입니다 ...",
  "잠시만 기다려주세요!",
  "잠시만 기다려주세요!!",
  "잠시만 기다려주세요!!!",
  "더 좋은 답이 있는지 탐색 중.",
  "더 좋은 답이 있는지 탐색 중..",
  "더 좋은 답이 있는지 탐색 중...",
];

interface OptimisticAnswerProps {
  answer: string | null | undefined;
}

export const OptimisticAnswer = ({ answer }: OptimisticAnswerProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!answer) {
      const interval = setInterval(() => {
        setMessageIndex(
          (prevIndex) => (prevIndex + 1) % loadingMessages.length
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [answer]);

  if (!answer) {
    return (
      <div className="text-gray-500 animate-pulse">
        {loadingMessages[messageIndex]}
      </div>
    );
  }

  return (
    // [최종 해결책]
    // 1. overflow-hidden: 혹시라도 튀어나가는 녀석은 가차없이 자름 (레이아웃 깨짐 방지)
    // 2. w-full: 부모 너비 100% 강제
    // 3. prose: (만약 tailwind typography 플러그인이 있다면 좋지만 없어도 아래 스타일로 커버)
    // 4. 사용자 정의 스타일(style prop): tailwind 클래스로 안 먹히는 악질적인 경우를 대비해 CSS 속성 직접 주입
    <div
      className="w-full max-w-full overflow-hidden text-gray-800 leading-7"
      style={{
        wordBreak: "break-word", // 구형 브라우저 호환
        overflowWrap: "anywhere", // 최신 브라우저 강력한 줄바꿈 (빈틈없이 줄바꿈)
      }}
    >
      <GlobalMarkdown>{answer}</GlobalMarkdown>
    </div>
  );
};
