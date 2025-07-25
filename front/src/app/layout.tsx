"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from "sonner"; // Toaster import 추가

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = !["/login", "/register"].includes(pathname);

  return (
    <html lang="en">
      <body>
        <SidebarProvider> {/* SidebarProvider가 전체 flex 컨테이너를 감쌉니다. */}
          <div className="flex w-full h-screen">
            {showSidebar && (
              <AppSidebar /> 
            )}
            <main className="flex-1 items-center">{children}</main>
          </div>
        </SidebarProvider>
        <Toaster /> {/* Toaster 컴포넌트 추가 */}
      </body>
    </html>
  );
}
