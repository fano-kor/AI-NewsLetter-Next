"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEmailSent(true);
        setTimeLeft(180); // 3분 = 180초
      } else {
        setError(data.error || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.");
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode, password, name }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "이메일 인증 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("이메일 인증 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
          AI-NewsLetter-Next 회원가입
        </h2>

        {error && (
          <div className="mb-4 text-sm text-center text-red-500">{error}</div>
        )}

        <form onSubmit={isEmailSent ? handleVerification : handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              이름
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isEmailSent}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              이메일
            </label>
            <input
              type="email"
              placeholder="@bccard.com 이메일을 입력하세요"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEmailSent}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isEmailSent}
            />
          </div>

          {isEmailSent && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                인증 코드
              </label>
              <input
                type="text"
                placeholder="이메일로 받은 6자리 코드를 입력하세요"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              {timeLeft !== null && timeLeft > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  남은 시간: {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
                </p>
              )}
              {timeLeft !== null && timeLeft <= 0 && (
                <p className="mt-2 text-sm text-red-500">
                  인증 시간이 만료되었습니다. 다시 시도해주세요.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={(isEmailSent && timeLeft !== null && timeLeft <= 0)}
          >
            {isEmailSent ? "이메일 인증" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
