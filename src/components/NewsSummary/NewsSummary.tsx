import React from 'react';

interface NewsSummaryProps {
  summary: string | null;
  isLoading: boolean;
}

const NewsSummary: React.FC<NewsSummaryProps> = ({ summary, isLoading }) => {
  return (
    <div className="w-full bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark p-4">
      {isLoading ? (
        <p className="text-black dark:text-white">요약 중...</p>
      ) : summary ? (
        <p className="text-black dark:text-white">{summary}</p>
      ) : (
        <p className="text-black dark:text-white">선택된 뉴스를 요약해 보세요.</p>
      )}
    </div>
  );
};

export default NewsSummary;
