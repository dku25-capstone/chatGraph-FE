"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isMobile, toggleSidebar } = useSidebar();
  const showSidebar = !["/login", "/register"].includes(pathname);

  return (
    <div className="flex w-full h-screen">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 relative min-w-0">
        {showSidebar && isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu />
          </Button>
        )}
        <main className="w-full h-full items-center">{children}</main>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  // QueryClient는 한 번만 생성되도록 useState로 관리
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 탭 전환시 자동 리페치 방지 (예측 가능성 향상)
            refetchOnWindowFocus: false,
            // 에러 발생시 1번만 재시도 (빠른 피드백)
            retry: 1,
            // 데이터가 1분간 신선하다고 간주 (불필요한 네트워크 요청 방지)
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <MainContent>{children}</MainContent>
      </SidebarProvider>
      <Toaster position="top-center" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
