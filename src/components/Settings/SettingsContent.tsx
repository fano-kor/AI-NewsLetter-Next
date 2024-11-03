"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Select from 'react-select';
import axios from 'axios';

interface Tag {
  value: string;
  label: string;
}

interface User {
  name: string;
  interestTags: string[];
  aiPrompt: string;
  emailScheduleDays: string[];
  emailScheduleTime: string;
  isSubscribed: boolean;
}

interface TagsResponse {
  tags: string[];
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('사용자 데이터를 불러오는데 실패했습니다.');
  const userData = await response.json();
  return {
    ...userData,
  };
};

const fetchKeywords = async (): Promise<TagsResponse> => {
  const response = await fetch('/api/keywords');
  if (!response.ok) throw new Error('키워드를 불러오는데 실패했습니다.');
  return response.json();
};

const updateUser = async (userData: Partial<User>): Promise<void> => {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  console.log("userData");
  console.log(userData);
  if (!response.ok) throw new Error('설정 저장에 실패했습니다.');
};

const daysOfWeek = [
  { value: 'mon', label: '월요일' },
  { value: 'tue', label: '화요일' },
  { value: 'wed', label: '수요일' },
  { value: 'thu', label: '목요일' },
  { value: 'fri', label: '금요일' },
  { value: 'sat', label: '토요일' },
  { value: 'sun', label: '일요일' },
];

const SettingsContent = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });
  const { data: tagsData, isLoading: isTagsLoading } = useQuery<TagsResponse>({
    queryKey: ['tags'],
    queryFn: fetchKeywords
  });

  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [emailScheduleDays, setEmailScheduleDays] = useState<string[]>([]);
  const [emailScheduleTime, setEmailScheduleTime] = useState('09:00');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 사용자 데이터가 로드되면 상태를 업데이트합니다.
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedTags(user.interestTags?.map(tag => ({ value: tag, label: tag })) || []);
      setAiPrompt(user.aiPrompt || '');
      setEmailScheduleDays(user.emailScheduleDays || []);
      setEmailScheduleTime(user.emailScheduleTime || '09:00');
      setIsSubscribed(user.isSubscribed || false);
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      alert('설정이 저장되었습니다.');
    },
    onError: () => {
      alert('설정 저장에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  const sendImmediateEmailMutation = useMutation({
    mutationFn: () => axios.post('/api/email'),
    onSuccess: () => {
      alert('즉시 메일이 발송되었습니다.');
      setIsSending(false);
    },
    onError: () => {
      alert('메일 발송에 실패했습니다. 다시 시도해 주세요.');
      setIsSending(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUserMutation.mutate({
      name,
      interestTags: selectedTags.map(tag => tag.value),
      aiPrompt,
      emailScheduleDays,
      emailScheduleTime,
      isSubscribed,
    });
  };

  const handleDayChange = (day: string) => {
    setEmailScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  const handleSendImmediateEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 폼 제출 방지
    setIsSending(true);
    sendImmediateEmailMutation.mutate();
  };

  if (isUserLoading || isTagsLoading) {
    return <div>로딩 중...</div>;
  }

  // const keywordOptions: Keyword[] = keywordsData?.keywords.map(keyword => ({ value: keyword, label: keyword })) || [];
  //#################### 나중에 꼭 키워드 데이터 조회 후 추가하기 ####################
  const tagOptions: Tag[] = ['IT', '정치', '경제', '사회', '문화', '국제'].map(tag => ({ value: tag, label: tag }));

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="설정" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="p-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="name"
              >
                이름
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="keywords"
              >
                관심 주제
              </label>
              <Select
                isMulti
                name="tag"
                options={tagOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedTags}
                onChange={(newValue) => setSelectedTags(newValue as Tag[])}
              />
            </div>
            {/* <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="aiPrompt"
              >
                AI 요약 프롬프트
              </label>
              <textarea
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                name="aiPrompt"
                id="aiPrompt"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="AI 요약을 위한 프롬프트를 입력하세요"
              ></textarea>
            </div> */}
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                이메일 수신 요일
              </label>
              <div className="flex flex-wrap gap-4">
                {daysOfWeek.map((day) => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary"
                      checked={emailScheduleDays.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                    />
                    <span className="ml-2 text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-5.5">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="emailScheduleTime"
              >
                이메일 수신 시각
              </label>
              {/* <input
                className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                type="time"
                name="emailScheduleTime"
                id="emailScheduleTime"
                value={emailScheduleTime}
                onChange={(e) => setEmailScheduleTime(e.target.value)}
              /> */}
              <input
                className="w-full rounded border border-stroke bg-gray-100 px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white cursor-not-allowed"
                type="time"
                name="emailScheduleTime"
                id="emailScheduleTime"
                value="08:00"
                disabled
              />
            </div>
            <div className="mb-5.5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary"
                  name="isSubscribed"
                  id="isSubscribed"
                  checked={isSubscribed}
                  onChange={(e) => setIsSubscribed(e.target.checked)}
                />
                <span className="ml-2 text-sm font-medium text-black dark:text-white">
                  이메일 발송 활성화
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                type="submit"
              >
                저장
              </button>
              <button
                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendImmediateEmail}
                disabled={!isSubscribed || isSending}
              >
                {isSending ? '발송 중...' : '즉시 발송'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
