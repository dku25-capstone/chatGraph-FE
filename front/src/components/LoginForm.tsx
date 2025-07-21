"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handelLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      if (res.status === 200) {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
          alert("로그인!");
          router.push("/home");
        }
      } else {
        alert("로그인 실패");
      }
    } catch (err) {
      console.error(err);
      alert("로그인 오류 발생!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Image
        src="/chat-logo.png"
        alt="로고"
        width={100}
        height={100}
        className="mb-12"
        priority
      />
      <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
      <form className="w-full max-w-md space-y-4">
        {/* <div>
          <Label htmlFor="아이디" className="mb-2 pt-4 ml-1">
            아이디
          </Label>
          <Input
            id="아이디"
            placeholder="아이디"
            type="text"
            className="w-80 text-[10px]! border border-gray-500 focus:outline-none focus:ring-2! focus:ring-[#A599FF]! focus:border-[#A599FF]!"
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
        <div>
          <Label htmlFor="비밀번호" className="mb-2  pt-3 ml-1">
            비밀번호
          </Label>
          <Input
            id="비밀번호"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-80 text-[10px]! border border-gray-500 focus:outline-none focus:ring-2! focus:ring-[#A599FF]! focus:border-[#A599FF]!"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 px-1 text-[11px]">
          <Link href="/find">아이디/비밀번호 찾기</Link>
          <Link href="signup">회원가입</Link>
        </div>
        <Button
          onClick={(e) => handelLogin(e)}
          className="w-full bg-[#A599FF] hover:bg-[#8E7FFF]"
        >
          로그인
        </Button>
      </form>
    </div>
  );
}
