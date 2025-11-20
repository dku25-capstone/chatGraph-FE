import "./globals.css";
import ClientLayout from "./client-layout";
import type { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://chatgraph.site/"),

  title: {
    template: "%s | ChatGraph",
    default: "ChatGraph - 생성형 AI 대화 시각화 플랫폼",
  },
  description:
    "선형적인 AI 대화를 그래프로 시각화하여 지식과 아이디어를 체계적으로 관리하세요.",

  icons: {
    icon: "/chatlogo.png",
  },

  // 공유시 보이는 카드
  openGraph: {
    title: "ChatGraph",
    description: "AI 대화 내용 그래프 시각화",
    url: "https://chatgraph.site/",
    siteName: "ChatGraph",
    images: [
      {
        url: "/chatlogo.png",
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
