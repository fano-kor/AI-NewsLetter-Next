'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataGrid, { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { debounce } from 'lodash'; // lodash를 설치해야 합니다: npm install lodash @types/lodash

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchNews = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/news?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
      if (!response.ok) throw new Error('뉴스 데이터를 가져오는 데 실패했습니다.');
      const data: NewsResponse = await response.json();
      setNews(data.news);
      setTotalCount(data.totalCount);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류 발생');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        뉴스 목록
      </h4>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="뉴스 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-1/2 p-2 border border-gray-300 rounded dark:bg-boxdark dark:text-white"
        />
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="p-2 border border-gray-300 rounded dark:bg-boxdark dark:text-white"
        >
          <option value={10}>10개씩 보기</option>
          <option value={20}>20개씩 보기</option>
          <option value={30}>30개씩 보기</option>
        </select>
      </div>
      <style jsx global>{`
        .rdg-cell {
          padding: 0 !important;
        }
        .rdg-checkbox-label {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        .rdg-checkbox-input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .rdg-header-row {
          text-align: center;
        }
        .rdg-header-row .rdg-cell {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .rdg-row .rdg-cell:nth-child(-n + 2) {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <DataGrid
        columns={columns}
        rows={news}
        rowKeyGetter={rowKeyGetter}
        className="rdg-light h-[calc(100vh-500px)] overflow-auto"
        selectedRows={selectedRows}
        onSelectedRowsChange={handleSelectedRowsChange}
      />
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p>선택된 항목: {selectedRows.size}</p>
          <p>총 뉴스 수: {totalCount}</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
          >
            이전
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableNews;
