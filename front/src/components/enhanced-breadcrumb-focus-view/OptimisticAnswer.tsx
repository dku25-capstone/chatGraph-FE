"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

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
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
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
        wordBreak: "break-word",      // 구형 브라우저 호환
        overflowWrap: "anywhere"      // 최신 브라우저 강력한 줄바꿈 (빈틈없이 줄바꿈)
      }}
    >
      <ReactMarkdown
        components={{
          // 1. 문단(p): 마진 추가 및 줄바꿈 강제
          p: ({ node, ...props }) => (
            <p className="mb-2 whitespace-pre-wrap" {...props} />
          ),
          
          // 2. 링크(a): 긴 URL이 범인일 경우를 대비해 break-all 적용
          a: ({ node, ...props }) => (
            <a
              className="text-blue-500 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          
          // 3. [가장 유력한 범인] 코드 블록(pre):
          // Markdown에서 들여쓰기가 있으면 pre로 인식될 수 있음.
          // pre 태그는 기본적으로 줄바꿈을 안 함. -> whitespace-pre-wrap으로 강제 줄바꿈 시킴
          pre: ({ node, ...props }) => (
            <pre 
              className="bg-gray-100 rounded p-2 my-2 overflow-x-auto whitespace-pre-wrap break-all" 
              {...props} 
            />
          ),
          
          // 4. 인라인 코드(code):
          code: ({ node, ...props }) => (
            <code 
              className="bg-gray-100 rounded px-1 py-0.5 break-all whitespace-pre-wrap" 
              {...props} 
            />
          ),

          // 리스트 스타일 복구
          ul: ({ node, ...props }) => (
             <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
             <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />
          ),
        }}
      >
        {answer}
      </ReactMarkdown>
    </div>
  );
};