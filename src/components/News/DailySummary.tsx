'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import Toast from '@/components/Toast/Toast';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ReactMarkdown from 'react-markdown';

interface DailySummaryItem {
  id: string;
  date: string;
  summary: string;
  tag: string;
  createdAt: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const DailySummary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: dailySummaries, isLoading, error } = useQuery({
    queryKey: ['daily-summaries', page, itemsPerPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/news/daily-summaries?${params}`);
      if (!response.ok) throw new Error('일간 요약을 불러오는데 실패했습니다.');
      return response.json();
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="일간 요약" />
      
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchTerm}
                onChange={handleSearch}
                className="rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            >
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
            </select>
          </div>
        </div>

        <div className="p-6.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-lg">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="text-meta-1 py-10 text-center">
              데이터를 불러오는데 실패했습니다.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                {dailySummaries?.items.map((item: DailySummaryItem) => (
                  <div key={item.id} className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                    <div className="mb-2.5 flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                      [ {item.tag} ] - {new Date(item.date).toLocaleDateString()} 
                      </h3>
                      <span className="text-sm text-body">
                        작성: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-4 prose dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          // 기본 p 태그에 줄바꿈 스타일 추가
                          p: ({node, ...props}) => <p className="whitespace-pre-line" {...props} />
                        }}
                      >
                        {item.summary}
                      </ReactMarkdown>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded bg-gray px-2.5 py-1 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
                          #{item.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="mt-6.5 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                  이전
                </button>
                <span className="text-black dark:text-white">
                  {page} / {Math.ceil((dailySummaries?.total || 0) / itemsPerPage)}
                </span>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={page >= Math.ceil((dailySummaries?.total || 0) / itemsPerPage)}
                  className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
