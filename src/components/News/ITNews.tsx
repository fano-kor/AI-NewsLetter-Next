'use client';
import React, { useState } from 'react';
import NewsBase from './NewsBase';

const ITNews: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('IT');

  const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(event.target.value);
  };

  return (
    <div>
      <NewsBase title={`${selectedTag} 뉴스 목록`} tag={"IT"} />
    </div>
  );
};

export default ITNews;
