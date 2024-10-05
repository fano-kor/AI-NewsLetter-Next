'use client';
import React, { useState, useEffect, useMemo } from 'react';
import DataGrid, { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface News {
  id: number;
  title: string;
  content: string;
  published_at: string;
}

const TableNews: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);  // Loading state
  const [error, setError] = useState<string | null>(null);  // Error state
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);  // Reset error on new fetch
    try {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('뉴스 데이터를 가져오는 데 실패했습니다.');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류 발생');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const filteredNews = useMemo(() => {
    const searchTermWithoutSpaces = searchTerm.replace(/\s+/g, '').toLowerCase();
    return news.filter(item =>
      item.title.replace(/\s+/g, '').toLowerCase().includes(searchTermWithoutSpaces) ||
      item.content.replace(/\s+/g, '').toLowerCase().includes(searchTermWithoutSpaces)
    );
  }, [news, searchTerm]);

  if (loading) {
    return <p>로딩 중...</p>; // Loading feedback
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>; // Display error message
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        뉴스 목록
      </h4>
      <div className="mb-4">
        <input
          type="text"
          placeholder="뉴스 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded dark:bg-boxdark dark:text-white"
        />
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
        rows={filteredNews}
        rowKeyGetter={rowKeyGetter}  // Pass the key getter function
        className="rdg-light h-[calc(100vh-400px)] overflow-auto" // Add overflow handling
        selectedRows={selectedRows}  // Pass selected rows to DataGrid
        onSelectedRowsChange={handleSelectedRowsChange}  // Ensure state is updated when selected rows change
      />
      <div className="mt-4">
        <p>선택된 항목: {selectedRows.size}</p>
        <p>검색 결과: {filteredNews.length}개의 뉴스</p>
      </div>
    </div>
  );
};

export default TableNews;
