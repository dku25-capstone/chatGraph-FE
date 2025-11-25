"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { signup } from "@/api/user";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidPassword = (pwd: string) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
    return regex.test(pwd);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordError || matchError || !email || !password || !passwordCheck) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup({ email, password });

      if (res.status === 201) {
        toast.success("회원가입이 완료되었습니다", {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
        router.push("/login");
      } else {
        toast.error("회원가입에 실패했습니다");
      }
    } catch (error) {
      console.error(error);
      toast.error("회원가입 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // [Glassmorphism Card Style] - 통일된 카드 디자인
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
      {/* 배경 장식 (선택사항) */}
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
              계정 만들기
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              ChatGraph와 함께 새로운 대화를 시작하세요.
            </p>
          </div>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-4">
            {/* 이메일 입력 */}
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

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
              >
                비밀번호
              </Label>
              <Input
                id="password"
                placeholder="비밀번호를 입력해주세요"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  if (passwordCheck && e.target.value !== passwordCheck) {
                    setMatchError("비밀번호가 일치하지 않습니다.");
                  } else {
                    setMatchError("");
                  }
                }}
                onBlur={() => {
                  if (!isValidPassword(password)) {
                    setPasswordError(
                      "비밀번호는 8~16자, 대소문자/숫자/특수문자를 포함해야 합니다."
                    );
                  }
                }}
                autoComplete="new-password"
                className={inputClass}
              />
              <div className="text-xs text-gray-500 ml-1">
                * 8~16자의 영문 대소문자, 숫자, 특수문자 포함
              </div>
              {passwordError && (
                <div className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1">
                  {passwordError}
                </div>
              )}
            </div>

            {/* 비밀번호 확인 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="passwordCheck"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1"
              >
                비밀번호 확인
              </Label>
              <Input
                id="passwordCheck"
                placeholder="비밀번호를 다시 입력해주세요"
                type="password"
                value={passwordCheck}
                onChange={(e) => {
                  setPasswordCheck(e.target.value);
                  if (password && e.target.value !== password) {
                    setMatchError("비밀번호가 일치하지 않습니다.");
                  } else {
                    setMatchError("");
                  }
                }}
                onBlur={() => {
                  if (password && passwordCheck && password !== passwordCheck) {
                    setMatchError("비밀번호가 일치하지 않습니다.");
                  }
                }}
                autoComplete="new-password"
                className={inputClass}
              />
              {matchError && (
                <div className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1">
                  {matchError}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              type="submit"
              className={cn(
                "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg",
                "bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5",
                "dark:bg-white dark:text-black dark:hover:bg-gray-200",
                (isLoading || !!passwordError || !!matchError || !email || !password || !passwordCheck) && 
                "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-lg"
              )}
              disabled={
                isLoading ||
                !!passwordError ||
                !!matchError ||
                !email ||
                !password ||
                !passwordCheck
              }
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              회원가입
            </Button>

            <div className="text-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                이미 계정이 있으신가요?{" "}
              </span>
              <Link 
                href="/login" 
                className="text-sm font-semibold text-gray-900 dark:text-white hover:underline transition-all"
              >
                로그인 하기
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}