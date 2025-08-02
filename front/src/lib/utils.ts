import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// 다양한 타입 클래스 깔끔한 문자열로 합쳐줌
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // css클래스 겹칠 때 우선 순위에 따라 중복 제거
}
