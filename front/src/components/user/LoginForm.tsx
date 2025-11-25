"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/api/user";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await login({ email, password });

      if (res.status === 200) {
        const accessToken = res.data.token;
        const refreshToken = res.data.refreshToken;
        
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        toast.success("로그인 성공!", {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
        router.push("/");
      } else {
        toast.error("로그인 실패");
      }
    } catch (err) {
      console.error(err);
      toast.error("로그인 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // [Glassmorphism Card Style] - StartNewTopicForm과 통일된 스타일
  const glassCardClass = cn(
    "w-full max-w-md p-8 space-y-8",
    "rounded-[26px]", // 일관된 곡률

    // [Glass Effect]
    "bg-white/60 dark:bg-black/60",
    "backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-2xl shadow-black/10",

    // [Animation]
    "animate-in fade-in zoom-in duration-500"
  );

  // 입력 필드 스타일 - 유리 질감에 어울리게 조정
  const inputClass = cn(
    "w-full px-4 py-3 text-lg transition-all duration-200",
    "bg-white/50 dark:bg-black/20", // 배경을 반투명하게
    "border border-gray-200/50 dark:border-white/10", // 테두리 연하게
    "rounded-xl", // 둥근 모서리
    "focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:bg-white/80 dark:focus:bg-black/40",
    "placeholder:text-gray-400"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative">
      {/* 배경 장식 (선택사항 - 분위기를 맞추기 위함) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -z-10" />

      <div className={glassCardClass}>
        {/* 헤더 영역 (로고 + 타이틀) */}
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative w-[100px] h-[100px]">
             {/* 로고 뒤 광채 효과 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <Image
              src="/chatlogo.png"
              alt="Chat Logo"
              width={100}
              height={100}
              className="relative drop-shadow-xl"
            />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              다시 만나서 반가워요
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              계속하려면 로그인을 진행해주세요.
            </p>
          </div>
        </div>

        {/* 폼 영역 */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
              >
                이메일
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  비밀번호
                </Label>
                
              </div>
              <Input
                id="password"
                placeholder="비밀번호를 입력해주세요"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <Link 
                  href="/find" 
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </Link>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              type="submit"
              className={cn(
                "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg",
                "bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5",
                "dark:bg-white dark:text-black dark:hover:bg-gray-200"
              )}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              로그인
            </Button>
            
            <div className="text-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                계정이 없으신가요?{" "}
              </span>
              <Link 
                href="/register" 
                className="text-sm font-semibold text-gray-900 dark:text-white hover:underline transition-all"
              >
                회원가입 하기
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}