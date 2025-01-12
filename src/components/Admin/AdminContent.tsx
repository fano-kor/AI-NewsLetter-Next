"use client";

import React, { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Toast from "@/components/Toast/Toast";

interface Keyword {
  value: string;
  label: string;
}

interface Tag {
  value: string;
  label: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const AdminContent = () => {
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keywordsResponse, tagsResponse] = await Promise.all([
          fetch('/api/keywords'),
          fetch('/api/tags')
        ]);

        if (!keywordsResponse.ok) {
          throw new Error('키워드를 불러오는데 실패했습니다.');
        }
        if (!tagsResponse.ok) {
          throw new Error('태그를 불러오는데 실패했습니다.');
        }

        const keywordsData = await keywordsResponse.json();
        const tagsData = await tagsResponse.json();

        setAllKeywords(keywordsData.keywords.map((keyword: string) => ({ value: keyword, label: keyword })));
        setAllTags(tagsData.tags.map((tag: string) => ({ value: tag, label: tag })));
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: newKeyword }),
      });
      if (response.ok) {
        setAllKeywords([...allKeywords, { value: newKeyword, label: newKeyword }]);
        setNewKeyword('');
        console.log('Showing toast for add keyword');
        showToast('키워드가 추가되었습니다.', 'success');
      } else {
        throw new Error('키워드 추가 실패');
      }
    } catch (error) {
      console.error("키워드 추가 중 오류 발생:", error);
      console.log('Showing toast for add keyword error');
      showToast('키워드 추가에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleSummarizeNews = async () => {
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
      });
      if (response.ok) {
        showToast('뉴스 요약 및 태그 분류가 완료되었습니다.', 'success');
      } else {
        throw new Error('뉴스 요약 실패');
      }
    } catch (error) {
      console.error("뉴스 요약 중 오류 발생:", error);
      showToast('뉴스 요약에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleDeleteKeyword = async (keywordToDelete: string) => {
    try {
      const response = await fetch(`/api/keywords/${encodeURIComponent(keywordToDelete)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAllKeywords(allKeywords.filter(k => k.value !== keywordToDelete));
        console.log('Showing toast for delete keyword');
        showToast('키워드가 삭제되었습니다.', 'success');
      } else {
        throw new Error('키워드 삭제 실패');
      }
    } catch (error) {
      console.error("키워드 삭제 중 오류 발생:", error);
      console.log('Showing toast for delete keyword error');
      showToast('키워드 삭제에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleCreateDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const response = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today }),
      });
      
      if (response.ok) {
        showToast('일간 요약이 생성되었습니다.', 'success');
      } else {
        throw new Error('일간 요약 생성 실패');
      }
    } catch (error) {
      console.error("일간 요약 생성 중 오류 발생:", error);
      showToast('일간 요약 생성에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: newTag }),
      });
      if (response.ok) {
        setAllTags([...allTags, { value: newTag, label: newTag }]);
        setNewTag('');
        showToast('태그가 추가되었습니다.', 'success');
      } else {
        throw new Error('태그 추가 실패');
      }
    } catch (error) {
      console.error("태그 추가 중 오류 발생:", error);
      showToast('태그 추가에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    try {
      const response = await fetch(`/api/tags/${encodeURIComponent(tagToDelete)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAllTags(allTags.filter(t => t.value !== tagToDelete));
        showToast('태그가 삭제되었습니다.', 'success');
      } else {
        throw new Error('태그 삭제 실패');
      }
    } catch (error) {
      console.error("태그 삭제 중 오류 발생:", error);
      showToast('태그 삭제에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTagSummary = async (tag: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/daily-summary/tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          date: today,
          tag: tag 
        }),
      });
      
      if (response.ok) {
        showToast(`${tag} 태그의 일간 요약이 생성되었습니다.`, 'success');
      } else {
        throw new Error('태그별 일간 요약 생성 실패');
      }
    } catch (error) {
      console.error("태그별 일간 요약 생성 중 오류 발생:", error);
      showToast('태그별 일간 요약 생성에 실패했습니다.', 'error');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="mx-auto max-w-270 relative">
      <Breadcrumb pageName="관리자 페이지" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            키워드 관리
          </h3>
        </div>
        <div className="p-7">
          <div className="mb-5.5 flex items-center">
            <input
              className="flex-grow rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="새 키워드 입력"
            />
            <button
              className="ml-2 whitespace-nowrap rounded bg-primary px-4 py-3 font-medium text-gray hover:bg-opacity-90"
              onClick={handleAddKeyword}
            >
              추가
            </button>
          </div>
          <ul className="mt-4">
            {allKeywords.map((keyword) => (
              <li key={keyword.value} className="flex justify-between items-center mb-2 py-2 border-b border-stroke dark:border-strokedark">
                <span>{keyword.label}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteKeyword(keyword.value)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            태그 관리
          </h3>
        </div>
        <div className="p-7">
          <div className="mb-5.5 flex items-center">
            <input
              className="flex-grow rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyPress}
              placeholder="새 태그 입력"
            />
            <button
              className="ml-2 whitespace-nowrap rounded bg-primary px-4 py-3 font-medium text-gray hover:bg-opacity-90"
              onClick={handleAddTag}
            >
              추가
            </button>
          </div>
          <ul className="mt-4">
            {allTags.map((tag) => (
              <li key={tag.value} className="flex justify-between items-center mb-2 py-2 border-b border-stroke dark:border-strokedark">
                <span>{tag.label}</span>
                <div className="flex gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded"
                    onClick={() => handleTagSummary(tag.value)}
                  >
                    요약
                  </button>
                  <button
                    className="text-red hover:text-red-700 px-2 py-1 rounded"
                    onClick={() => handleDeleteTag(tag.value)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            일간 요약 관리
          </h3>
        </div>
        <div className="p-7">
          <button
            className="w-full rounded bg-primary px-4 py-3 font-medium text-white hover:bg-opacity-90"
            onClick={handleCreateDailySummary}
          >
            오늘의 일간 요약 생성
          </button>
        </div>

        <div className="border-t border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            뉴스 요약 관리
          </h3>
        </div>
        <div className="p-7">
          <button
            className="w-full rounded bg-secondary px-4 py-3 font-medium text-white hover:bg-opacity-90"
            onClick={handleSummarizeNews}
          >
            뉴스 요약 및 태그 분류 실행
          </button>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default AdminContent;
