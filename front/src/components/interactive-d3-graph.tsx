import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { ViewData } from "@/lib/data-transformer";
import { useQuestionTreeContext } from "./enhanced-breadcrumb-focus-view/QuestionTreeContext";

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

  // onNodeClick prop이 바뀔때마다 최신버전 함수 저장
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Convert data to D3 hierarchy
    const root = d3.hierarchy(data, (d) => d.children);
    const nodes = root.descendants();
    const links = root.links();

    // 그래프 전체 노드 확인
    console.log("그래프 전체 노드:", nodes);

    // SVG dimensions and setup
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Add filter for glow effect
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", 4)
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    // 더블클릭 줌 방지
    svg.call(zoom).on("dblclick.zoom", null);

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => (d as d3.HierarchyNode<ViewData>).data.id)
          .distance(120)
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Create node groups
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add circles for nodes
    const fixedRadius = 25;

    const circles = node
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? fixedRadius + 5 : fixedRadius))
      .attr("fill", (d) => {
        const isInCurrentPath = currentPath.some((q) => q.id === d.data.id);
        const depth = d.depth;
        const colors = [
          "#3b82f6", // blue-500
          "#10b981", // emerald-500
          "#f59e0b", // amber-500
          "#ef4444", // red-500
          "#8b5cf6", // violet-500
          "#06b6d4", // cyan-500
          "#f43f5e", // rose-500
          "#22c55e", // green-500
          "#eab308", // yellow-500
          "#0ea5e9", // sky-500
        ];
        const baseColor = colors[depth % colors.length];
        return isInCurrentPath ? "#1d4ed8" : baseColor;
      })
      .attr("stroke", (d) => {
        if (d.data.isFavorite) return "#f59e0b"; // amber-500
        const isInCurrentPath = currentPath.some((q) => q.id === d.data.id);
        return isInCurrentPath ? "#1e40af" : "#fff";
      })
      .attr("stroke-width", (d) => {
        if (d.data.isFavorite) return 4;
        const isInCurrentPath = currentPath.some((q) => q.id === d.data.id);
        return isInCurrentPath ? 4 : 2;
      })
      .style("filter", (d) => (d.data.isFavorite ? "url(#glow)" : null));

    // Add text labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.depth === 0 ? "45" : "37"))
      .attr("fill", "black")
      .attr("font-size", (d) => (d.depth === 0 ? "13px" : "11px"))
      .attr("font-weight", "600")
      .attr("pointer-events", "bold")
      .text((d) => {
        const text = d.data.questionText;
        if (text.length <= 20) return text;
        return text.substring(0, 30) + "...";
      });

    // Add child count badges
    node
      .filter((d) => d.data.children.length > 0)
      .append("circle")
      .attr("cx", 20)
      .attr("cy", -20)
      .attr("r", 10)
      .attr("fill", "#ef4444")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node
      .filter((d) => d.data.children.length > 0)
      .append("text")
      .attr("x", 20)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text((d) => d.data.children.length);

    // Node interactions
    node
      .on("mouseover", function (event, d) {
        const baseRadius = d.depth === 0 ? fixedRadius + 5 : fixedRadius;
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", baseRadius + 5);
      })
      .on("mousemove", () => {})
      .on("mouseout", function (event, d) {
        const baseRadius = d.depth === 0 ? fixedRadius + 5 : fixedRadius;
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", baseRadius);
      })
      .on("click", function (event, d) {
        onNodeClickRef.current(d.data);

        // 현재 클릭한 노드
        console.log("클릭된 노드:", d.data.questionText);
        console.log("클릭한 노드 아이디:", d.data.id);
        console.log("클릭한 노드 위치:", d.x, d.y);

        // 클릭한 노드의 부모 노드 정보
        if (d.parent) {
          console.log("부모 노드:", d.parent.data.id);
        } else {
          console.log("루트 노드입니다");
        }

        // 자식 노드 정보
        // 자식 배열 존재하고 내용이 0보다 많으면
        if (d.children && d.children.length > 0) {
          const childNames = d.children.map((child) => child.data.questionText);
          console.log("자식 노드 목록:", childNames);
        } else {
          console.log("리프 노드입니다.");
        }

        // Visual feedback
        circles.attr("stroke-width", 2);
        d3.select(this).select("circle");
        // .attr("stroke-width", 4)
        // .attr("stroke", "#1e40af");
      });

    // Drag behavior
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.call(drag as any);

    // Update positions on simulation tick
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
          `translate(${(d as d3.SimulationNodeDatum).x},${
            (d as d3.SimulationNodeDatum).y
          })`
      );
    });

    // Cleanup function
    return () => {};
  }, [data, currentPath]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border"
    >
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
