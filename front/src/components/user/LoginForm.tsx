"use client"

import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '@/api/user';
import { toast } from "sonner"; // sonner import 추가
import { Loader2, CheckCircle } from "lucide-react"; // 로딩 아이콘 추가

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const router = useRouter();

  const handelLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true); // 로딩 시작

    try {
      const res = await login({ email, password });

      if (res.status === 200) {
        const token = res.data.token;
        if (token) {
          localStorage.setItem('token', token);
          toast.success("로그인 성공!", { // sonner 성공 메시지
            icon: <CheckCircle className="h-5 w-5" />,
          });
          router.push('/'); // /로 페이지 이동
        }
      } else {
        toast.error("로그인 실패"); // sonner 실패 메시지
      }
    } catch (err) {
      console.error(err);
      toast.error("로그인 중 오류가 발생했습니다"); // sonner 오류 메시지
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-white text-gray-900">
      <div className="max-w-4xl w-full text-center space-y-6 p-8 rounded-lg shadow-lg bg-white border border-gray-200">
        <h1 className="text-4xl font-bold">로그인</h1>
        <p className="text-lg text-gray-600">
          ChatGraph에 오신 것을 환영합니다.
        </p>
        <form className="w-full space-y-6" onSubmit={handelLogin}>
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-50 text-gray-900"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              ""
            )}
            로그인
          </Button>
          <div className="flex justify-between text-base text-gray-600 mt-4">
            <Link href="/find" className="hover:underline">
              아이디/비밀번호 찾기
            </Link>
            <Link href="/register" className="hover:underline">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

