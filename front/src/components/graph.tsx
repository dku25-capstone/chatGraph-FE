"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isRoot?: boolean;
}
export type Link = d3.SimulationLinkDatum<Node> & {
  source: string | Node;
  target: string | Node;
};
export type GraphData = { nodes: Node[]; links: Link[] };

export default function Graph({ data }: { data: GraphData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current as SVGSVGElement);
    svg.selectAll("*").remove();

    const width = 961.6;
    const height = 776;

    // 전체 요소를 담을 그룹 <g>
    const g = svg.append("g");

    // 줌 핸들러 등록
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4]) // 축소/확대 비율 범위
      .on("zoom", (event) => {
        g.attr("transform", event.transform); // g 그룹에 transform 적용
        updateLabelVisibility(event.transform.k);
      });

    svg.call(zoom); // 줌 활성화

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

    // 링크
    const link = g
      .append("g")
      .attr("stroke", "#aaa")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", 2);

    // 노드
    const node = g
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d: Node) => (d.isRoot ? "red" : "#69b3a2"))
      .call(
        d3
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
          })
      );

    // 라벨
    const label = g
      .append("g")
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

    // 시뮬레이션 tick
    simulation.on("tick", () => {
      link
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
    <svg
      ref={svgRef}
      width={961}
      height={776}
      style={{ border: "1px solid black", background: "white" }}
    />
  );
}
