"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isMobile, toggleSidebar } = useSidebar();
  const showSidebar = !["/login", "/register"].includes(pathname);

  return (
    <div className="flex w-full h-screen">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 relative">
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
  return (
    <>
      <SidebarProvider>
        <MainContent>{children}</MainContent>
      </SidebarProvider>
      <Toaster position="top-center" />
    </>
  );
}
