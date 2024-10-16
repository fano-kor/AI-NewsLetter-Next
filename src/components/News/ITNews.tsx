'use client';
import React, { useState, useEffect } from 'react';
import NewsBase from './NewsBase';

const ITNews: React.FC = () => {
    const [selectedKeyword, setSelectedKeyword] = useState<string>('IT');
  
    const handleKeywordChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedKeyword(event.target.value);
    };
  
    useEffect(() => {
      // 컴포넌트 마운트 시 초기 키워드 설정
      setSelectedKeyword('IT');
    }, []);

    return (
      <div>
        <select onChange={handleKeywordChange} value={selectedKeyword}>
          <option value="IT">IT</option>
          {/* 더 많은 키워드 옵션을 추가할 수 있습니다 */}
        </select>
        <NewsBase title="IT 뉴스 목록" keyword={selectedKeyword} />
      </div>
    );
  };

export default ITNews;
