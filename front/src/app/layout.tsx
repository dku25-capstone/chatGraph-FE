// app/layout.tsx
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </div>
      </body>
    </html>
  );
}
