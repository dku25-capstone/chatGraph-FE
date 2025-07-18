// app/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <main className="flex-1">
              {children}
            </main>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
