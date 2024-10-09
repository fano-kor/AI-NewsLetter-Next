import React from 'react';

interface NewsSummaryProps {
  summary: string | null;
  isLoading: boolean;
  children?: React.ReactNode;
}

const NewsSummary: React.FC<NewsSummaryProps> = ({ summary, isLoading, children }) => {
  return (
    <div className="h-full">
      {isLoading ? (
        <p>요약 중...</p>
      ) : summary ? (
        children || <p>{summary}</p>
      ) : (
        <p>선택된 뉴스가 없습니다.</p>
      )}
    </div>
  );
};

export default NewsSummary;
