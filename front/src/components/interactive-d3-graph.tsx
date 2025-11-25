// components/InteractiveD3Graph.tsx

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { ViewData } from "@/lib/data-transformer";
import { useQuestionTreeContext } from "./enhanced-breadcrumb-focus-view/QuestionTreeContext";
import { cn } from "@/lib/utils";

interface InteractiveD3GraphProps {
  data: ViewData;
  onNodeClick: (question: ViewData) => void;
}

export function InteractiveD3Graph({
  data,
  onNodeClick,
}: InteractiveD3GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentPath } = useQuestionTreeContext();

  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  const glassContainerClass = cn(
    "w-full h-full rounded-[26px] overflow-hidden",
    "bg-white/60 dark:bg-black/60",
    "backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-2xl shadow-black/10",
    "transition-all duration-300 ease-out"
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    d3.select(svgRef.current).selectAll("*").remove();

    const root = d3.hierarchy(data, (d) => d.children);
    const nodes = root.descendants();
    const links = root.links();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");

    const dropShadow = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    dropShadow
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    dropShadow
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("result", "offsetBlur");
    const feMergeShadow = dropShadow.append("feMerge");
    feMergeShadow.append("feMergeNode").attr("in", "offsetBlur");
    feMergeShadow.append("feMergeNode").attr("in", "SourceGraphic");

    const strongShadow = defs
      .append("filter")
      .attr("id", "strong-shadow")
      .attr("height", "150%");
    strongShadow
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5);
    strongShadow.append("feOffset").attr("dx", 4).attr("dy", 4);
    const feMergeStrong = strongShadow.append("feMerge");
    feMergeStrong.append("feMergeNode");
    feMergeStrong.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom).on("dblclick.zoom", null);

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => (d as d3.HierarchyNode<ViewData>).data.id)
          .distance((d) => (d.source.depth === 0 ? 180 : 120))
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<d3.HierarchyNode<ViewData>>().radius((d) => (d.depth === 0 ? 80 : 55))
      );

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(156, 163, 175, 0.4)")
      .attr("stroke-width", 1.5);

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .style("isolation", "isolate");

    const baseRadius = 35;
    const rootRadius = 60;

    // --- [노드 원형(Circle) 그리기] ---
    node
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? rootRadius : baseRadius))
      .attr("fill", (d) => {
        if (d.depth === 0) return "rgba(0, 0, 0, 1)";
        const opacity = Math.max(0.1, 0.7 - d.depth * 0.15);
        return `rgba(0, 0, 0, ${opacity})`;
      })
      .style("filter", (d) =>
        d.depth === 0 ? "url(#strong-shadow)" : "url(#drop-shadow)"
      );

    // --- [노드 텍스트 라벨] ---
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => {
        const r = d.depth === 0 ? rootRadius : baseRadius;
        return `${r + 18}px`;
      })
      .attr("fill", (d) => (d.depth === 0 ? "#000000" : "#1f2937"))
      .attr("font-size", (d) => (d.depth === 0 ? "16px" : "12px"))
      .attr("font-weight", (d) => (d.depth === 0 ? "700" : "600"))
      .attr("pointer-events", "none")
      .style("text-shadow", "0 1px 3px rgba(255,255,255,0.8)")
      .text((d) => {
        const text = d.data.questionText;
        const maxLength = d.depth === 0 ? 25 : 15;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
      });

    // --- [뱃지 그룹 (즐겨찾기 또는 자식 개수)] ---
    // ✅ 수정됨: 즐겨찾기이거나 자식이 있는 경우에 뱃지 그룹 생성
    const badgeGroup = node
      .filter((d) => d.data.favorite || d.data.children.length > 0)
      .append("g")
      .attr("transform", (d) => {
        const r = d.depth === 0 ? rootRadius : baseRadius;
        // 우측 상단 45도 위치
        const angle = -Math.PI / 4;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        return `translate(${x}, ${y})`;
      });

    //조건부 뱃지 렌더링
    badgeGroup.each(function (d) {
      const group = d3.select(this);

      if (d.data.favorite) {
        // 1. 즐겨찾기인 경우: 별 아이콘 표시 (우선순위 높음)
        // 간단한 별 모양 SVG 경로 데이터
        const starPath =
          "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

        group
          .append("path")
          .attr("d", starPath)
          // 아이콘 크기 및 위치 조정 (중심점 맞추기)
          .attr("transform", "translate(-11, -11) scale(0.9)")
          .attr("fill", "#f59e0b") // amber-500 (황금색)
          .attr("stroke", "#ffffff") // 흰색 테두리로 선명하게
          .attr("stroke-width", 1)
          .style("filter", "url(#drop-shadow)");
      }
      // } else {
      //   // 2. 즐겨찾기가 아니고 자식만 있는 경우: 기존 숫자 뱃지 표시
      //   group
      //     .append("circle")
      //     .attr("r", 11)
      //     .attr("fill", "rgba(75, 85, 99, 0.9)") // gray-600
      //     .attr("stroke", "rgba(255, 255, 255, 0.8)")
      //     .attr("stroke-width", 1.5)
      //     .style("filter", "url(#drop-shadow)");

      //   group
      //     .append("text")
      //     .attr("text-anchor", "middle")
      //     .attr("dy", "0.35em")
      //     .attr("fill", "white")
      //     .attr("font-size", "10px")
      //     .attr("font-weight", "bold")
      //     .attr("pointer-events", "none")
      //     .text(d.data.children.length);
      // }
    });

    // --- [마우스 인터랙션] ---
    node
      .on("mouseover", function (event, d: d3.HierarchyNode<ViewData>) {
        const currentRadius = d.depth === 0 ? rootRadius : baseRadius;
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", currentRadius + 8)
          .attr("fill", () => {
            if (d.depth === 0) return "rgba(50, 50, 50, 1)";
            const opacity = Math.max(0.1, 0.7 - d.depth * 0.15);
            return `rgba(50, 50, 50, ${opacity + 0.2})`;
          });
      })
      .on("mousemove", () => { })
      .on("mouseout", function (event, d: d3.HierarchyNode<ViewData>) {
        const currentRadius = d.depth === 0 ? rootRadius : baseRadius;
        let originalFill;
        if (d.depth === 0) {
          originalFill = "rgba(0, 0, 0, 1)";
        } else {
          const opacity = Math.max(0.1, 0.7 - d.depth * 0.15);
          originalFill = `rgba(0, 0, 0, ${opacity})`;
        }

        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", currentRadius)
          .attr("fill", originalFill);
      })
      .on("click", function (event, d) {
        onNodeClickRef.current(d.data);
      });

    const drag = d3
      .drag<SVGGElement, d3.HierarchyNode<ViewData> & d3.SimulationNodeDatum>()
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
      });
    node.call(drag);

    simulation.on("tick", () => {
      link
        .attr(
          "x1",
          (d) =>
            (d.source as d3.SimulationNodeDatum & { x: number; y: number }).x
        )
        .attr(
          "y1",
          (d) =>
            (d.source as d3.SimulationNodeDatum & { x: number; y: number }).y
        )
        .attr(
          "x2",
          (d) =>
            (d.target as d3.SimulationNodeDatum & { x: number; y: number }).x
        )
        .attr(
          "y2",
          (d) =>
            (d.target as d3.SimulationNodeDatum & { x: number; y: number }).y
        );

      node.attr(
        "transform",
        (d) =>
          `translate(${(d as d3.SimulationNodeDatum).x},${(d as d3.SimulationNodeDatum).y
          })`
      );
    });

    return () => { };
  }, [data, currentPath]);

  return (
    <div ref={containerRef} className={glassContainerClass}>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}