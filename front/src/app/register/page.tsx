import RegisterForm from "@/components/user/RegisterForm";
import Link from "next/link";

// 회원가입 페이지
export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="w-full p-4 bg-white text-gray-900 flex items-center justify-between  border-gray-200">
        <Link href="/" className="text-2xl font-bold">
          ChatGraph
        </Link>
      </header>
      <main className="flex items-center justify-center">
        <RegisterForm />
      </main>
    </div>
  );
}
