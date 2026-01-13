import LoginForm from "@/components/user/login-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "로그인",
  description: "ChatGraph에 로그인하고 나만의 지식 지도를 만드세요.",
};

// 로그인 페이지
export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="w-full p-4 bg-white text-gray-900 flex items-center justify-between border-gray-200">
        <Link href="/" className="text-2xl font-bold">
          ChatGraph
        </Link>
      </header>
      <main className="flex items-center justify-center">
        <LoginForm />
      </main>
    </div>
  );
}
