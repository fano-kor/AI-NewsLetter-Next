"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setIsCodeSent(true);
      } else {
        setError(data.error || "코드 전송 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("코드 전송 중 오류가 발생했습니다.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "비밀번호 재설정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("비밀번호 재설정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
          비밀번호 초기화
        </h2>

        {error && (
          <div className="mb-4 text-sm text-center text-red-500">{error}</div>
        )}
        {message && (
          <div className="mb-4 text-sm text-center text-green-500">{message}</div>
        )}

        <form onSubmit={isCodeSent ? handleResetPassword : handleSendCode} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              이메일
            </label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isCodeSent}
            />
          </div>

          {isCodeSent && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  인증 코드
                </label>
                <input
                  type="text"
                  placeholder="6자리 코드를 입력하세요"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isCodeSent ? "비밀번호 재설정" : "인증 코드 전송"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
