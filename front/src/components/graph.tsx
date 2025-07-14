"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import GraphDetailModal from "./GraphDetailModal";
import { ExternalLink, SquareX, Trash2 } from "lucide-react";

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  answer?: string;
  isRoot?: boolean;
}
export type Link = d3.SimulationLinkDatum<Node> & {
  source: string | Node;
  target: string | Node;
};
export type GraphData = { nodes: Node[]; links: Link[] };

export default function Graph({ data }: { data: GraphData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const rootNode = data.nodes.find((n) => n.isRoot);

  useEffect(() => {
    const svg = d3.select(svgRef.current as SVGSVGElement);
    svg.selectAll("*").remove();

    const width = 961.6;
    const height = 776;

    // 전체 그룹 <g>
    const g = svg.append("g");

    // 줌 설정
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        updateLabelVisibility(event.transform.k);
      });

    svg.call(zoom);

    // 링크 그룹
    const linkGroup = g.append("g").attr("stroke", "#aaa");

    // 노드 그룹
    const nodeGroup = g.append("g");

    // 라벨 그룹
    const labelGroup = g.append("g");

    // 시뮬레이션
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(data.links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 노드 드래그
    const drag = d3
      .drag<SVGCircleElement, Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;

        // 드래그 이동 후 종료 시 가까운 노드와 연결
        const radius = 40;

        const target = data.nodes.find(
          (n) =>
            n.id !== d.id &&
            Math.hypot((n.x ?? 0) - (d.x ?? 0), (n.y ?? 0) - (d.y ?? 0)) <
              radius &&
            !data.links.some(
              (l) =>
                ((l.source as Node).id === d.id &&
                  (l.target as Node).id === n.id) ||
                ((l.source as Node).id === n.id &&
                  (l.target as Node).id === d.id)
            )
        );

        if (target) {
          // 기존 연결 제거
          data.links = data.links.filter(
            (l) =>
              (l.source as Node).id !== d.id && (l.target as Node).id !== d.id
          );

          // 새 링크 추가
          data.links.push({ source: d.id, target: target.id });

          // 링크 업데이트
          linkGroup
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke", "#aaa")
            .attr("stroke-width", 2);

          // 시뮬레이션 반영
          simulation.force<d3.ForceLink<Node, Link>>("link")!.links(data.links);
          simulation.alpha(1).restart();
        }
      });

    // 초기 링크 렌더링
    linkGroup
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 2);

    // 노드 렌더링
    const node = nodeGroup
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => (d.isRoot ? "red" : "#69b3a2"))
      .on("mouseover", function () {
        d3.select(this).transition().duration(150).attr("r", 25);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(150).attr("r", 20);
      })
      .on("click", (event, d) => {
        setSelectedNode(d); // 모달에 넘길 노드 정보 저장
      })
      .call(drag);

    // 라벨 렌더링
    const label = labelGroup
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("dy", 35);

    // 확대 배율에 따라 라벨 보이기/숨기기
    function updateLabelVisibility(scale: number) {
      label.style("opacity", scale > 0.6 ? 1 : 0);
    }

    // tick 함수
    simulation.on("tick", () => {
      linkGroup
        .selectAll<SVGElement, Link>("line")
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      label.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div>
      {/* 그래프 화면 상단에 최상위 질문 표시 */}
      {rootNode && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {rootNode.label}
        </div>
      )}
      {selectedNode && (
        <GraphDetailModal onClose={() => setSelectedNode(null)}>
          <div className="flex flex-row justify-end space-x-2 gap-4 mr-4">
            {/* 해당 질문 위치 이동 아이콘 우측 상단 */}
            <div className="relative group flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                <ExternalLink size={20} />
              </button>
              {/* 툴팁 */}
              <div className="absolute -top-8 -right-10  hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                클릭하면 해당 질문으로 이동합니다.
              </div>
            </div>

            {/* 닫기 아이콘 우측 상단 */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                <SquareX size={20} />
              </button>
            </div>
          </div>
          {/* 질문/답변 양쪽 정렬 */}
          <div className="flex flex-col items-end mt-2 space-y-4">
            {/* 질문: 오른쪽 정렬 */}
            <div className="bg-gray-100 p-4 m-4 rounded shadow max-w-[60%] text-right self-end break-words">
              <p>{selectedNode.label}</p>
            </div>

            {/* 답변: 왼쪽 정렬 */}
            <div className="bg-gray-100 p-4 rounded shadow max-w-[60%] self-start break-words">
              <p>{selectedNode.answer}</p>
            </div>
          </div>

          {/* 삭제 아이콘 우측 하단 */}
          <div className="flex justify-end">
            <button
              onClick={() => alert("질문을 삭제하시겠습니까?")}
              className="text-gray-500 hover:text-black text-xl"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </GraphDetailModal>
      )}

      <svg
        ref={svgRef}
        width={961}
        height={700}
        style={{ background: "white" }}
      />
    </div>
  );
}
