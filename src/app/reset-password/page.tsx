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
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white">
              비밀번호 초기화
            </h2>

            {error && (
              <div className="mb-4 text-red-500">{error}</div>
            )}
            {message && (
              <div className="mb-4 text-green-500">{message}</div>
            )}

            <form onSubmit={isCodeSent ? handleResetPassword : handleSendCode}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  이메일
                </label>
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isCodeSent}
                />
              </div>

              {isCodeSent && (
                <>
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      인증 코드
                    </label>
                    <input
                      type="text"
                      placeholder="6자리 코드를 입력하세요"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      placeholder="새 비밀번호를 입력하세요"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
              >
                {isCodeSent ? "비밀번호 재설정" : "인증 코드 전송"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
