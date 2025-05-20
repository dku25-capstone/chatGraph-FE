// app/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { FC, useState, useRef, useEffect } from "react";
// JSON 데이터를 코드 내부로 인라인
interface Question {
  questionId: string;
  question: string;
  answerId: string;
  answer: string;
  children?: Question[];
}

interface TopicData {
  topicId: string;
  topicName: string;
  questions: Question[];
}

// id별 mock 데이터 맵
const mockDataMap: Record<string, TopicData> = {
  "1": {
    topicId: "1",
    topicName: "DB 정규화 방법",
    questions: [
      {
        questionId: "q-1-1",
        question: "정규화란 무엇인가요?",
        answerId: "a-1-1",
        answer: "정규화는 데이터 중복을 최소화하고 무결성을 유지하기 위해 테이블을 분해하여 설계하는 과정입니다.",
        children: [
          {
            questionId: "q-1-1-1",
            question: "정규화의 장점은 무엇인가요?",
            answerId: "a-1-1-1",
            answer: "중복된 데이터를 제거해 저장 공간을 절약하고, 업데이트 이상을 방지할 수 있습니다.",
            children: [
              {
                questionId: "q-1-1-1-1",
                question: "업데이트 이상이란 무엇인가요?",
                answerId: "a-1-1-1-1",
                answer: "한 부분만 수정하면 결합된 여러 데이터가 불일치 상태가 되는 현상을 의미합니다.",
                children: []
              }
            ]
          },
          {
            questionId: "q-1-1-2",
            question: "정규화의 단점은 무엇인가요?",
            answerId: "a-1-1-2",
            answer: "조인이 많아져 성능이 저하될 수 있으며, 설계 복잡도가 증가합니다.",
            children: []
          }
        ]
      },
      {
        questionId: "q-1-2",
        question: "1차 정규화(1NF)란 무엇인가요?",
        answerId: "a-1-2",
        answer: "1차 정규화는 모든 컬럼이 원자값을 가지도록 하는 단계로, 반복 컬럼을 제거합니다.",
        children: []
      }
    ]
  },
  "2": {
    topicId: "2",
    topicName: "운영체제 프로세스 스위칭 정책",
    questions: [
      {
        questionId: "q-2-1",
        question: "컨텍스트 스위칭이 뭐에요?",
        answerId: "a-2-1",
        answer: "컨텍스트 스위칭은 CPU가 한 프로세스의 상태(레지스터, 프로그램 카운터 등)를 저장하고 다른 프로세스로 전환하는 작업입니다.",
        children: [
          {
            questionId: "q-2-1-1",
            question: "컨텍스트 스위칭 비용은 어떻게 되나요?",
            answerId: "a-2-1-1",
            answer: "스위칭 시 레지스터와 캐시를 저장/복원하므로 수 마이크로초 단위의 오버헤드가 발생합니다.",
            children: []
          }
        ]
      },
      {
        questionId: "q-2-2",
        question: "스케줄링 정책 종류 알려주세요",
        answerId: "a-2-2",
        answer: "대표적인 스케줄링 정책으로는 FCFS, SJF, Round Robin(RR), Priority Scheduling 등이 있습니다.",
        children: [
          {
            questionId: "q-2-2-1",
            question: "Round Robin의 타임 퀀텀 결정 기준은?",
            answerId: "a-2-2-1",
            answer: "시스템 부하와 응답 시간 요구를 고려하며, 너무 짧으면 스위칭 비용 증가, 너무 길면 응답 지연이 커집니다.",
            children: []
          }
        ]
      },
      {
        questionId: "q-2-3",
        question: "Priority Scheduling의 문제점은 무엇인가요?",
        answerId: "a-2-3",
        answer: "낮은 우선순위 프로세스가 기아(Starvation)에 빠질 수 있습니다. 이를 해결하려면 에이징 기법을 적용합니다.",
        children: []
      }
    ]
  },
  "3": {
    topicId: "3",
    topicName: "IPv4 프로토콜 개요",
    questions: [
      {
        questionId: "q-3-1",
        question: "IPv4 헤더 구조 설명해 주세요",
        answerId: "a-3-1",
        answer: "IPv4 헤더는 버전, IHL, 서비스 유형, 전체 길이, 식별자, 플래그, 프래그먼트 오프셋, TTL, 프로토콜, 헤더 체크섬, 출발지/목적지 주소로 구성됩니다.",
        children: [
          {
            questionId: "q-3-1-1",
            question: "IHL이란 무엇인가요?",
            answerId: "a-3-1-1",
            answer: "IHL(Internet Header Length)은 헤더 길이를 32비트 워드 단위로 표시하며, 최소값은 5(20바이트)입니다.",
            children: []
          }
        ]
      },
      {
        questionId: "q-3-2",
        question: "브로드캐스트 주소는 어떻게 되나요?",
        answerId: "a-3-2",
        answer: "서브넷 마스크가 /24 일 때, 네트워크 주소가 192.168.0.0 이면 브로드캐스트 주소는 192.168.0.255 입니다.",
        children: []
      },
      {
        questionId: "q-3-3",
        question: "TTL(Time To Live)의 역할은?",
        answerId: "a-3-3",
        answer: "TTL은 패킷이 네트워크를 떠도는 최대 홉 수를 제한하여 무한 루프를 방지합니다. 홉마다 값이 1씩 감소합니다.",
        children: []
      }
    ]
  }
};

// 재귀 컴포넌트: 질문과 자식 질문 렌더링
const QuestionItem: FC<{
  q: Question;
  level?: number;
  activeParentId: string | null;
  setActiveParentId: (id: string | null) => void;
}> = ({ q, level = 0, activeParentId, setActiveParentId }) => (
  <div className={`mb-4 p-2 pl-${level * 4}`}> {/* 단계별 들여쓰기 */}
    <div className="font-semibold mb-1">Q: {q.question}</div>
    <div
      onClick={() => setActiveParentId(activeParentId === q.questionId ? null : q.questionId)}
      className={`p-3 rounded-lg mb-2 cursor-pointer ${
        activeParentId === q.questionId
          ? 'ring-2 ring-black-500 bg-gray-200'
          : 'bg-gray-100'
      }`}
    >
      A: {q.answer}
    </div>
    {q.children?.map((child) => (
      <QuestionItem
        key={child.questionId}
        q={child}
        level={level + 1}
        activeParentId={activeParentId}
        setActiveParentId={setActiveParentId}
      />
    ))}
  </div>
);

const ChatPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const initialData = id ? mockDataMap[id] : null;

  // 질문 상태를 로컬 state로 복사하여 수정 가능하게 함
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [newQuestion, setNewQuestion] = useState<string>(""
  );
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [newQuestion]);

  if (!id || !initialData) {
    return <div className="p-4">해당 ID의 토픽을 찾을 수 없습니다.</div>;
  }

  // 재귀: parentId에 새 질문을 추가
  const addQuestionToParent = (
    list: Question[],
    parentId: string,
    newQ: Question
  ): Question[] => {
    return list.map((q) => {
      if (q.questionId === parentId) {
        const updatedChildren = q.children ? [...q.children, newQ] : [newQ];
        return { ...q, children: updatedChildren };
      }
      if (q.children) {
        return { ...q, children: addQuestionToParent(q.children, parentId, newQ) };
      }
      return q;
    });
  };

  // 새로운 질문 추가 핸들러
  const handleAddQuestion = () => {
    const text = newQuestion.trim();
    if (!text) return;
    const newQ: Question = {
      questionId: `q-${id}-${Date.now()}`,
      question: text,
      answerId: "",
      answer: "",
      children: []
    };
    if (activeParentId) {
      setQuestions((prev) => addQuestionToParent(prev, activeParentId, newQ));
    } else {
      setQuestions((prev) => [...prev, newQ]);
    }
    setNewQuestion("");
    setActiveParentId(null);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{initialData.topicName} 채팅</h1>

      <div className="flex-1 overflow-y-auto">
        {/* 질문 목록 렌더링 */}
        {questions.map((q) => (
          <QuestionItem
            key={q.questionId}
            q={q}
            activeParentId={activeParentId}
            setActiveParentId={setActiveParentId}
          />
        ))}
      </div>

      {/* 새 질문 추가 UI */}
      <div className="relative mt-4">
        <Textarea
          ref={textareaRef}
          className="w-full h-42 resize-none break-words p-4 pr-12 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            activeParentId
              ? '답변을 클릭하여 하위 질문으로 입력하세요.'
              : '여기에 질문을 입력하세요…'
          }
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          rows={1}
        />
        <Button
          onClick={handleAddQuestion}
          className="absolute bottom-2 right-2 rounded-full bg-primary text-white p-2"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;