'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 로그인 로직을 구현합니다.
    // 예: API 호출, 인증 처리 등
    console.log('로그인 시도:', email, password);
    
    // 로그인 성공 시 메인 페이지로 이동
    // 실제 구현 시에는 인증 성공 여부를 확인한 후 이동해야 합니다.
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">AI-NewsLetter-Next에 로그인</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">이메일</label>
              <input
                type="email"
                placeholder="이메일"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">로그인</button>
              <a href="#" className="text-sm text-blue-600 hover:underline">비밀번호를 잊으셨나요?</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
