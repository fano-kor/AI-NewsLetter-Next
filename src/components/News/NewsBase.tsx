'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SelectColumn } from 'react-data-grid';
import BCDataGrid from '@/components/BCCard/BCDataGrid';
import NewsSummary from '@/components/NewsSummary/NewsSummary';
import axios from 'axios';
import { debounce } from 'lodash';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface News {
  id: number;
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  summary?: string;
  tags?: string[];
  criticalLevel?: string;
}

interface NewsResponse {
  news: News[];
  totalCount: number;
}

interface NewsBaseProps {
  title: string;
  tag?: string;
}

const NewsBase: React.FC<NewsBaseProps> = ({ title, tag }) => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = async (search: string) => {
    try {
      setLoading(true);
      setShowLoading(false);
      setError(null);

      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 2000);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(tag && { tag })
      });

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error('뉴스를 불러오는데 실패했습니다.');
      const data = await response.json();
      setNews(data.news);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('뉴스 데이터 로딩 중 오류:', error);
      setError('뉴스를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setShowLoading(false);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    }
  };

  const debouncedFetchNews = useMemo(
    () => debounce((search: string) => fetchNews(search), 500),
    [tag, currentPage, itemsPerPage]
  );

  useEffect(() => {
    debouncedFetchNews(searchTerm);
    return () => {
      debouncedFetchNews.cancel();
    };
  }, [debouncedFetchNews, searchTerm, tag, currentPage, itemsPerPage]);

  const CriticalLevelCell = ({ row }: { row: News }) => {
    console.log("Formatting criticalLevel for row:", row);
    const level = row.criticalLevel;
    const color = level === '크리티컬' ? 'text-red-500' : level === '영향' ? 'text-orange-500' : 'text-green-500';
    return <span className={`font-semibold ${color}`}>{level}</span>;
  };

  const TagsCell = ({ row }: { row: News }) => {
    return <>{row.tags?.join(', ') || ''}</>;
  };

  const DateFormatter = ({ row }: { row: News }) => {
    const date = new Date(row.publishedAt);
    return (
      <div className="text-sm">
        {format(date, 'yyyy-MM-dd HH:mm', { locale: ko })}
      </div>
    );
  };

  const columns = useMemo(() => {
    console.log("Columns being created");
    return [
      SelectColumn,
      { key: 'title', name: '제목' },
      { key: 'content', name: '내용', width: 500 },
      { key: 'tags', name: '태그', renderCell: ({ row }: { row: News }) => row.tags?.join(', ') || '' },
      { key: 'criticalLevel', name: '민감도', renderCell: CriticalLevelCell },
      {
        key: 'publishedAt',
        name: '발행일',
        width: 150,
        renderCell: DateFormatter
      },
      // { key: 'summary', name: '요약', width: 300 },
    ];
  }, []);

  const rowKeyGetter = (row: News) => row.id;

  const handleSelectedRowsChange = (selectedRows: Set<number>) => {
    setSelectedRows(selectedRows);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleAISummarize = useCallback(async () => {
    if (selectedRows.size === 0) {
      alert('뉴스를 선택해주세요.');
      return;
    }

    setSummarizing(true);
    setSummary(null);

    try {
      const selectedNews = news
        .filter((item) => selectedRows.has(item.id))
        .map(({ title, content, url }) => ({ title, content, url }));

      const response = await axios.post('/api/ai/letter', {
        news: selectedNews
      });

      setSummary(response.data.summary);
    } catch (error) {
      console.error('AI 뉴스 요약 중 오류 발생:', error);
      alert('AI 뉴 요약 중 오류가 발생했습니다.');
    } finally {
      setSummarizing(false);
    }
  }, [selectedRows, news]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex space-x-4">
      <div className={`rounded-sm border border-stroke bg-white dark:bg-boxdark px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark sm:px-7.5 xl:pb-1 ${isExpanded ? 'w-2/3' : 'w-11/12'}`}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h4>
          <button
            onClick={handleAISummarize}
            // disabled={summarizing || selectedRows.size === 0}
            disabled={true}
            title="현재는 유료API 사용으로 내부 BCGPT전환 시 이용가능 합니다."
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {summarizing ? 'AI 요약 중...' : 'AI 요약'} 
          </button>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="뉴스 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-1/2 p-2 border border-gray-300 rounded bg-white dark:bg-boxdark dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border border-gray-300 rounded bg-white dark:bg-boxdark dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10개씩 보기</option>
            <option value={50}>50개씩 보기</option>
            <option value={100}>100개씩 보기</option>
          </select>
        </div>
        <div className="relative h-[calc(100vh-550px)]">
          <BCDataGrid
            columns={columns}
            rows={news}
            rowKeyGetter={rowKeyGetter}
            selectedRows={selectedRows}
            onSelectedRowsChange={handleSelectedRowsChange}
            isLoading={showLoading}
            containerClassName="h-[calc(100vh-550px)]"
          />
          {showLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-boxdark dark:bg-opacity-70">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                로딩 중...
              </div>
            </div>
          )}
        </div>
        {error && <div className="mt-4 text-red-500">{error}</div>}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p className="flex space-x-4 font-semibold">
              <span>선택: {selectedRows.size}</span>
              <span>총 뉴스 수: {totalCount}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border border-gray-300 rounded bg-white dark:bg-boxdark dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              이전
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border border-gray-300 rounded bg-white dark:bg-boxdark dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              다음
            </button>
          </div>
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'w-1/3' : 'w-1/12'}`}>
        <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark shadow-default dark:border-strokedark h-[calc(100vh-100px)] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-stroke dark:border-strokedark">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              요약
            </h4>
            <button
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </div>
          {isExpanded && (
            <div className="flex-grow overflow-auto p-4">
              <NewsSummary summary={summary} isLoading={summarizing}>
                {summary && <ReactMarkdown>{summary}</ReactMarkdown>}
              </NewsSummary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsBase;
