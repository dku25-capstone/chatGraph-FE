"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation"; // 현재 URL 경로를 가져오는 훅
import "./globals.css";
import { Toaster } from "sonner"; // Toaster import 추가

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // 현재 페이지의 경로 추출
  const showSidebar = !["/login", "/register"].includes(pathname); //로그인, 회원가입 페이지에서는 사이드바 숨김

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {" "}
          {/* SidebarProvider가 전체 flex 컨테이너를 감쌉니다. */}
          <div className="flex w-full h-screen">
            {showSidebar && <AppSidebar />}
            <main className="flex-1 items-center">{children}</main>
          </div>
        </SidebarProvider>
        <Toaster position="top-center" /> {/* Toaster 컴포넌트 추가 */}
      </body>
    </html>
  );
}
