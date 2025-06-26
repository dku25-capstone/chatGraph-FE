"use client";

import { use, useEffect, useState } from "react";
import Graph, { GraphData } from "@/components/graph";

type Props = {
  params: Promise<{ topicId: string }>;
};

export default function GraphPage({ params }: Props) {
  const { topicId } = use(params);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/graph/${topicId}`)
      .then((res) => {
        if (!res.ok) {
          setError(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setGraphData(data);
        }
      })
      .catch(() => setError(true));
  }, [topicId]);

  if (error) return <p>그래프를 찾을 수 없습니다.</p>;
  if (!graphData) return <p>그래프를 불러오는 중입니다...</p>;

  return (
    <div>
      {/* d3로 시각화 */}
      <Graph data={graphData} />
    </div>
  );
}
