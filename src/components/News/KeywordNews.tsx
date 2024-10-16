'use client';
import React, { useState } from 'react';
import NewsBase from './NewsBase';

const KeywordNews: React.FC = () => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | undefined>(undefined);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKeyword(event.target.value === '' ? undefined : event.target.value);
  };

  return (
    <div>
      <NewsBase title="키워드 뉴스 목록"/>
    </div>
  );
};

export default KeywordNews;
