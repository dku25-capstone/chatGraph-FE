"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !["/login", "/register"].includes(pathname);

  return (
    <>
      <SidebarProvider>
        <div className="flex w-full h-screen">
          {showSidebar && <AppSidebar />}
          <main className="flex-1 items-center">{children}</main>
        </div>
      </SidebarProvider>
      <Toaster position="top-center" />
    </>
  );
}
