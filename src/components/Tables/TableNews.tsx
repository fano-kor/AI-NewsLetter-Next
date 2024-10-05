'use client';
import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface News {
  id: number;
  title: string;
  content: string;
  published_at: string;
}

const columns = [
  { key: 'id', name: 'ID'},
  { key: 'title', name: '제목' },
  { key: 'content', name: '내용', width: 500 },
  { key: 'published_at', name: '발행일' }
];

const TableNews: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        뉴스 목록
      </h4>
      <DataGrid
        columns={columns}
        rows={news}
        className="rdg-light h-[calc(100vh-350px)]"
      />
    </div>
  );
};
export default TableNews;
