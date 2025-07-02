import type { GraphData } from "@/components/graph";

export const graphDataMap: Record<string, GraphData> = {
  "1": {
    nodes: [
      { id: "1", label: "DB 정규화 방법", isRoot: true },
      {
        id: "q-1-1",
        label: "정규화란 무엇인가요?",
        answer:
          "정규화는 정규화입니다dsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssddddddddddddddddddddddddddddddddd",
      },
      { id: "q-1-1-1", label: "정규화의 장점은 무엇인가요?" },
      { id: "q-1-1-1-1", label: "업데이트 이상이란 무엇인가요?" },
      { id: "q-1-1-2", label: "정규화의 단점은 무엇인가요?" },
      { id: "q-1-2", label: "1차 정규화(1NF)란 무엇인가요?" },
    ],
    links: [
      { source: "1", target: "q-1-1" },
      { source: "q-1-1", target: "q-1-1-1" },
      { source: "q-1-1-1", target: "q-1-1-1-1" },
      { source: "q-1-1", target: "q-1-1-2" },
      { source: "1", target: "q-1-2" },
    ],
  },
  "2": {
    nodes: [
      { id: "2", label: "운영체제 프로세스 스위칭 정책", isRoot: true },
      { id: "q-2-1", label: "컨텍스트 스위칭이 뭐에요?" },
      { id: "q-2-1-1", label: "컨텍스트 스위칭 비용은 어떻게 되나요?" },
      { id: "q-2-2", label: "스케줄링 정책 종류 알려주세요" },
      { id: "q-2-2-1", label: "Round Robin의 타임 퀀텀 결정 기준은?" },
      { id: "q-2-3", label: "Priority Scheduling의 문제점은 무엇인가요?" },
    ],
    links: [
      { source: "2", target: "q-2-1" },
      { source: "q-2-1", target: "q-2-1-1" },
      { source: "2", target: "q-2-2" },
      { source: "q-2-2", target: "q-2-2-1" },
      { source: "2", target: "q-2-3" },
    ],
  },
  "3": {
    nodes: [
      { id: "3", label: "IPv4 프로토콜 개요", isRoot: true },
      { id: "q-3-1", label: "IPv4 헤더 구조 설명해 주세요" },
      { id: "q-3-1-1", label: "IHL이란 무엇인가요?" },
      { id: "q-3-2", label: "브로드캐스트 주소는 어떻게 되나요?" },
      { id: "q-3-3", label: "TTL(Time To Live)의 역할은?" },
    ],
    links: [
      { source: "3", target: "q-3-1" },
      { source: "q-3-1", target: "q-3-1-1" },
      { source: "3", target: "q-3-2" },
      { source: "3", target: "q-3-3" },
    ],
  },
};
