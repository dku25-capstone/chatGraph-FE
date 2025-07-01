"use client";
// 클라이언트 전용 래퍼 레이아웃
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login" || pathname === "/signup";

  if (hideSidebar) {
    return (
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </SidebarProvider>
  );
}
