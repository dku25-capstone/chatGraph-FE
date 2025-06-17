// app/graph/[topicId]/page.tsx
import { graphDataMap } from "@/data"; // 여러 topic의 그래프 데이터
import Graph from "@/components/Graph";

type Props = {
  params: { topicId: string };
};

export default async function GraphPage({ params }: Props) {
  const graphData = graphDataMap[params.topicId];

  if (!graphData) return <p>그래프를 찾을 수 없습니다.</p>;

  return (
    <div>
      <Graph data={graphData} />
    </div>
  );
}
