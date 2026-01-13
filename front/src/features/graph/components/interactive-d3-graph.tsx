// components/InteractiveD3Graph.tsx

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { ViewData } from "@/lib/data-transformer";
import { useQuestionTreeContext } from "./breadcrumb-view/question-tree-context";
import { cn } from "@/lib/utils";

interface InteractiveD3GraphProps {
  data: ViewData;
  onNodeClick: (question: ViewData) => void;
}

import { GRAPH_CONFIG } from "@/constants/ui-constants";

// ... imports remain the same

// ... imports


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

    // --- [색상 정의 로직] ---
    // 줄기(Stem)별로 다른 색상을 할당하기 위한 스케일
    const stemColorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // 각 노드의 줄기(root 바로 아래 자식)를 찾는 헬퍼 함수
    const getStem = (
      d: d3.HierarchyNode<ViewData>
    ): d3.HierarchyNode<ViewData> => {
      let stem = d;
      while (stem.depth > 1) {
        stem = stem.parent!;
      }
      return stem;
    };

    // 노드의 최종 색상을 결정하는 함수
    const getNodeColor = (d: d3.HierarchyNode<ViewData>): string => {
      // Root 노드는 회색으로 처리
      if (d.depth === 0) {
        return "#6b7280"; // gray-500
      }

      // 1. 노드의 줄기를 찾음
      const stem = getStem(d);

      // 2. 줄기의 ID를 기반으로 기본 색상 가져오기
      const baseColor = d3.color(stemColorScale(stem.data.id));
      if (!baseColor) return "#9ca3af"; // gray-400 (fallback)

      // 3. 깊이에 따라 명암 조절 (깊어질수록 어두워짐)
      // (d.depth - 1)을 사용하여 줄기(depth:1)는 기본 색상을 유지
      const darkeningFactor = (d.depth - 1) * 0.4;
      return baseColor.darker(darkeningFactor).toString();
    };

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
      .scaleExtent([GRAPH_CONFIG.ZOOM.MIN, GRAPH_CONFIG.ZOOM.MAX])
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
          .distance((d) => (d.source.depth === 0 ? GRAPH_CONFIG.LINK.DISTANCE.ROOT : GRAPH_CONFIG.LINK.DISTANCE.DEFAULT))
          .strength(GRAPH_CONFIG.LINK.STRENGTH)
      )
      .force("charge", d3.forceManyBody().strength(GRAPH_CONFIG.FORCE.CHARGE_STRENGTH))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide<d3.HierarchyNode<ViewData>>()
          .radius((d) => (d.depth === 0 ? GRAPH_CONFIG.FORCE.COLLISION_RADIUS.ROOT : GRAPH_CONFIG.FORCE.COLLISION_RADIUS.DEFAULT))
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

    const baseRadius = GRAPH_CONFIG.NODE.RADIUS.DEFAULT;
    const rootRadius = GRAPH_CONFIG.NODE.RADIUS.ROOT;

    // --- [Node Circle Drawing] ---
    node
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? rootRadius : baseRadius))
      .attr("fill", getNodeColor)
      .style("filter", (d) =>
        d.depth === 0 ? "url(#strong-shadow)" : "url(#drop-shadow)"
      );

    // --- [Node Text Label] ---
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

    // --- [Badge Group] ---
    const badgeGroup = node
      .filter((d) => d.data.favorite || d.data.children.length > 0)
      .append("g")
      .attr("transform", (d) => {
        const r = d.depth === 0 ? rootRadius : baseRadius;
        const angle = -Math.PI / 4;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        return `translate(${x}, ${y})`;
      });

    badgeGroup.each(function (d) {
      const group = d3.select(this);
      if (d.data.favorite) {
        const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
        group.append("path")
          .attr("d", starPath)
          .attr("transform", "translate(-11, -11) scale(0.9)")
          .attr("fill", "#f59e0b")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1)
          .style("filter", "url(#drop-shadow)");
      }
    });

    // --- [Mouse Interactions] ---
    node
      .on("mouseover", function (event, d: d3.HierarchyNode<ViewData>) {
        const subtreeNodeIds = new Set(d.descendants().map((n) => n.data.id));

        g.selectAll<SVGGElement, d3.HierarchyNode<ViewData>>("g.node")
          .select("circle")
          .transition()
          .duration(GRAPH_CONFIG.TRANSITION.DURATION.DEFAULT)
          .attr("fill", (n) => {
            if (subtreeNodeIds.has(n.data.id)) {
              if (n.data.id === d.data.id) {
                const color = d3.color(getNodeColor(n));
                return color ? color.brighter(0.7).toString() : "#fff";
              }
              return getNodeColor(n);
            } else {
              const originalColor = d3.color(getNodeColor(n));
              if (!originalColor) return "#374151";
              const hsl = d3.hsl(originalColor);
              hsl.s = 0.05;
              hsl.l = 0.35;
              return hsl.toString();
            }
          });

        d3.select(this)
          .select("circle")
          .transition()
          .duration(GRAPH_CONFIG.TRANSITION.DURATION.FAST)
          .attr("r", (d.depth === 0 ? rootRadius : baseRadius) + GRAPH_CONFIG.NODE.RADIUS.HOVER_INCREASE);
      })
      .on("mouseout", function () {
        g.selectAll<SVGGElement, d3.HierarchyNode<ViewData>>("g.node")
          .select("circle")
          .transition()
          .duration(GRAPH_CONFIG.TRANSITION.DURATION.DEFAULT)
          .attr("fill", (n) => getNodeColor(n))
          .attr("r", (n) => (n.depth === 0 ? rootRadius : baseRadius));
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
      // ... (tick logic remains the same)
      link
        .attr("x1", (d) => (d.source as d3.SimulationNodeDatum).x!)
        .attr("y1", (d) => (d.source as d3.SimulationNodeDatum).y!)
        .attr("x2", (d) => (d.target as d3.SimulationNodeDatum).x!)
        .attr("y2", (d) => (d.target as d3.SimulationNodeDatum).y!);

      node.attr("transform", (d) => {
        const simNode = d as d3.SimulationNodeDatum;
        return `translate(${simNode.x},${simNode.y})`;
      });
    });

    return () => { };
  }, [data, currentPath]);

  return (
    <div ref={containerRef} className={glassContainerClass}>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
