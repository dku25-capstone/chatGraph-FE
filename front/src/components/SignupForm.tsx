"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // const [name, setName] = useState("");
  // const [id, setId] = useState("");
  // const [passwordCheck, setPasswordCheck] = useState("");
  // const [matchError, setMatchError] = useState("");

  //   비밀번호 유효성 검사
  const isValidPassword = (pwd: string) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
    return regex.test(pwd);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSignup 실행");

    if (passwordError) {
      return;
    }

    try {
      const res = await api.post("/signup", {
        email,
        password,
      });

      if (res.status === 200) {
        alert("가입 완료!");
        router.push("/login");
      } else {
        alert("회원가입에 실패했습니다");
      }
    } catch (error) {
      console.error(error);
      alert("회원가입 중 오류가 발생했습니다");
    }
    // if (!name || !email || !id || !password || !passwordCheck) {
    //   alert("모든 항목을 입력해주세요.");
    //   return;
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Image
        src="/chat-logo.png"
        alt="로고"
        width={100}
        height={100}
        className="mb-8"
        priority
      />
      <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>

      <form onSubmit={handleSignup} className="w-full max-w-md space-y-4">
        {/* <div>
          <Label htmlFor="name" className="mb-2 pt-4 ml-1">
            이름
          </Label>
          <Input
            id="name"
            placeholder="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-80 text-[10px] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A599FF] focus:border-[#A599FF]"
          />
        </div> */}

        <div>
          <Label htmlFor="email" className="mb-2 pt-4 ml-1">
            이메일
          </Label>
          <Input
            id="email"
            placeholder="ex) 123@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-80 text-[10px] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A599FF] focus:border-[#A599FF]"
          />
        </div>

        {/* <div>
          <Label htmlFor="id" className="mb-2 pt-4 ml-1">
            아이디
          </Label>
          <Input
            id="id"
            placeholder="아이디"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-80 text-[10px] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A599FF] focus:border-[#A599FF]"
          />
        </div> */}

        <div>
          <Label htmlFor="password" className="mb-2 pt-3 ml-1">
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
            }}
            onBlur={() => {
              if (!isValidPassword(password)) {
                setPasswordError(
                  "비밀번호는 8~16자, 대소문자/숫자/특수문자를 포함해야 합니다."
                );
              }
            }}
            autoComplete="new-password"
            className="w-80 text-[10px] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A599FF] focus:border-[#A599FF]"
          />

          <div className="text-[9px] ml-1 mt-1 text-gray-500">
            8~16자의 영문 대소문자, 숫자, 특수문자
          </div>
          {passwordError && (
            <div className="text-[9px] text-red-500 mt-1 ml-1">
              {passwordError}
            </div>
          )}
        </div>

        {/* <div>
          <Label htmlFor="passwordCheck" className="mb-2 pt-4 ml-1">
            비밀번호 확인
          </Label>
          <Input
            id="passwordCheck"
            value={passwordCheck}
            placeholder="비밀번호 확인"
            onChange={(e) => {
              setPasswordCheck(e.target.value);
              setMatchError(""); // 입력 시 에러 초기화
            }}
            onBlur={() => {
              if (password !== passwordCheck) {
                setMatchError("비밀번호가 일치하지 않습니다.");
              }
            }}
            type="password"
            autoComplete="new-password"
            className="w-80 text-[10px] border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A599FF] focus:border-[#A599FF]"
          />
          {matchError && (
            <div className="text-[9px] text-red-500 mt-1 ml-1">
              {matchError}
            </div>
          )}
        </div> */}

        <Button
          type="submit"
          className="w-full bg-[#A599FF] hover:bg-[#8E7FFF]"
        >
          회원가입
        </Button>
      </form>
    </div>
  );
}
