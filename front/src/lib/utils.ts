import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ViewData } from "./data-transformer";
// 다양한 타입 클래스 깔끔한 문자열로 합쳐줌
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // css클래스 겹칠 때 우선 순위에 따라 중복 제거
}

export function findPathToNode(
  root: ViewData,
  targetId: string
): ViewData[] | null {
  const path: ViewData[] = [];
  const found = dfs(root, targetId, path);
  return found ? path : null;
}

function dfs(node: ViewData, targetId: string, path: ViewData[]): boolean {
  path.push(node);
  if (node.id === targetId) return true;

  for (const child of node.children || []) {
    if (dfs(child, targetId, path)) return true;
  }

  path.pop();
  return false;
}
