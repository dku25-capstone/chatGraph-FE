import type { GraphData } from "@/components/graph";

export const graphDataMap: Record<string, GraphData> = {
  "1": {
    nodes: [
      { id: "1", label: "DB 정규화 방법", isRoot: true },
      {
        id: "q-1-1",
        label: "정규화란 무엇인가요?",
        answer:
          "정규화는 데이터베이스 설계에서 중복을 줄이고, 데이터의 무결성을 유지하기 위해 데이터를 구조화하는 과정이야. 중복을 줄이기 위해: 같은 데이터를 여러 군데 저장하지 않게 해서 저장 공간을 아끼고 오류를 줄여.수정 이상(anomaly)을 방지하기 위해: 데이터를 삽입, 수정, 삭제할 때 문제가 생기지 않도록.정규화는 읽기 성능보다 무결성과 유지보수성을 더 중요시할 때 쓰이고,반대로 읽기 성능을 높이고자 **정규화를 일부러 깨는 경우(비정규화)**도 있어.",
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
