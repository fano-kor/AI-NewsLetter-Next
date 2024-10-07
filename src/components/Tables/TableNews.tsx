'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SelectColumn } from 'react-data-grid';
import BCDataGrid from '@/components/BCCard/BCDataGrid';
import NewsSummary from '@/components/NewsSummary/NewsSummary';
import axios from 'axios';
import { debounce } from 'lodash';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'; // 아이콘 추가

interface News {
  id: number;
  title: string;
  content: string;
  published_at: string;
}

interface NewsResponse {
  news: News[];
  totalCount: number;
}

const TableNews: React.FC = () => {
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
  const [isExpanded, setIsExpanded] = useState(true); // 요약 화면 확장 상태

  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(async (search: string) => {
    setLoading(true);
    setShowLoading(false);
    setError(null);

    // 2초 후에 showLoading을 true로 설정하는 타이머 시작
    loadingTimerRef.current = setTimeout(() => {
      setShowLoading(true);
    }, 2000);

    try {
      const response = await fetch(`/api/news?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
      if (!response.ok) throw new Error('뉴스 데이터를 가져오는 데 실패했습니다.');
      const data: NewsResponse = await response.json();
      setNews(prevNews => {
        if (JSON.stringify(prevNews) !== JSON.stringify(data.news)) {
          return data.news;
        }
        return prevNews;
      });
      setTotalCount(data.totalCount);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류 발생');
    } finally {
      setLoading(false);
      setShowLoading(false);
      // 타이머가 아직 실행 중이라면 클리어
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    }
  }, [currentPage, itemsPerPage]);

  const debouncedFetchNews = useMemo(
    () => debounce((search: string) => fetchNews(search), 1000),
    [fetchNews]
  );

  useEffect(() => {
    debouncedFetchNews(searchTerm);
    return () => {
      debouncedFetchNews.cancel();
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [debouncedFetchNews, searchTerm, currentPage, itemsPerPage]);

  // Memoize columns to avoid re-creating them on every render
  const columns = useMemo(() => [
    SelectColumn, // Default checkbox column
    { 
      key: 'id', 
      name: 'ID', 
      width: 70,
      formatter: ({ row }: { row: News }) => (
        <div style={{ textAlign: 'center' }}>{row.id}</div>
      ),
    },
    { key: 'title', name: '제목' },
    { key: 'content', name: '내용', width: 500 },
    { key: 'published_at', name: '발행일' }
  ], []);

  // Key getter function to return the 'id' for each row
  const rowKeyGetter = (row: News) => row.id;

  const handleSelectedRowsChange = (selectedRows: Set<number>) => {
    setSelectedRows(selectedRows);  // Ensure selected rows are updated correctly
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // 검색어 변경 시 첫 페이지로 이동
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // 페이지당 항목 수 변경 시 첫 페이지로 이동
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
      const selectedNews = news.filter((item) => selectedRows.has(item.id));
      const response = await axios.post('/api/ai/summarize', {
        news: selectedNews
      });

      setSummary(response.data.summary);
    } catch (error) {
      console.error('AI 뉴스 요약 중 오류 발생:', error);
      alert('AI 뉴스 요약 중 오류가 발생했습니다.');
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
            뉴스 목록
          </h4>
          <button
            onClick={handleAISummarize}
            disabled={summarizing || selectedRows.size === 0}
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
        <div className="flex justify-between items-center mb-2">
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
          <NewsSummary summary={summary} isLoading={summarizing} />
        )}
      </div>
    </div>
  );
};

export default TableNews;