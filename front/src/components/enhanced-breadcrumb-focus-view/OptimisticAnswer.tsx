"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const loadingMessages = [
  "답을 찾는 중입니다 .",
  "답을 찾는 중입니다 ..",
  "답을 찾는 중입니다 ...",
  "잠시만 기다려주세요!!",
  "더 좋은 답이 있는지 탐색중.",
  "더 좋은 답이 있는지 탐색중..",
  "더 좋은 답이 있는지 탐색중...",
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
      }, 2000);

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

  return <ReactMarkdown>{answer}</ReactMarkdown>;
};
