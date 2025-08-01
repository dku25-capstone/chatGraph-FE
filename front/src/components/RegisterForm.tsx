"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState(""); // 비밀번호 확인 상태 추가
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState(""); // 비밀번호 일치 오류 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  const isValidPassword = (pwd: string) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
    return regex.test(pwd);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordError || matchError || !email || !password || !passwordCheck) { // 유효성 검사 추가
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/api/signup", {
        email,
        password,
      });

      if (res.status === 200) {
        toast.success("회원가입이 완료되었습니다", {
          icon: <CheckCircle className="h-5 w-5" />,
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

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-white text-gray-900">
      <div className="max-w-4xl w-full text-center space-y-6 p-8 rounded-lg shadow-lg bg-white border border-gray-200">
        <h1 className="text-4xl font-bold">회원가입</h1>
        <p className="text-lg text-gray-600">
          ChatGraph에 오신 것을 환영합니다.
        </p>
        <form onSubmit={handleSignup} className="w-full space-y-6">
          <div>
            <Label htmlFor="email" className="block text-left text-base font-medium text-gray-700 mb-2">
              이메일
            </Label>
            <Input
              id="email"
              placeholder="ex) 123@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-left text-base font-medium text-gray-700 mb-2">
              비밀번호
            </Label>
            <Input
              id="password"
              placeholder="비밀번호"
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-50 text-gray-900"
            />

            <div className="text-sm text-gray-500 mt-2 text-left">
              8~16자의 영문 대소문자, 숫자, 특수문자
            </div>
            {passwordError && (
              <div className="text-sm text-red-500 mt-2 text-left">
                {passwordError}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="passwordCheck" className="block text-left text-base font-medium text-gray-700 mb-2">
              비밀번호 확인
            </Label>
            <Input
              id="passwordCheck"
              placeholder="비밀번호 확인"
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-50 text-gray-900"
            />
            {matchError && (
              <div className="text-sm text-red-500 mt-2 text-left">
                {matchError}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            disabled={isLoading || !!passwordError || !!matchError || !email || !password || !passwordCheck} // 버튼 비활성화 조건 추가
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              ""
            )}
            회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}