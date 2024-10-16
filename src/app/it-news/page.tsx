import { Metadata } from 'next';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import ITNews from '@/components/News/ITNews';

export const metadata: Metadata = {
  title: 'IT News | AI-NewsLetter-Next',
  description: 'AI-NewsLetter-Next의 IT 뉴스 페이지입니다',
  // 기타 메타데이터
};

const ITNewsPage = () => {
  return (
    <DefaultLayout>
      <ITNews />
    </DefaultLayout>
  );
};

export default ITNewsPage;
