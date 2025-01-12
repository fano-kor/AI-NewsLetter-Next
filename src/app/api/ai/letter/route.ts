import { NextResponse } from 'next/server';
import { makeLetter } from '@/lib/ai/news-summarizer';

export async function POST(request: Request) {
  try {
    const { news } = await request.json();
    
    const summary = await makeLetter(news);
    
    return NextResponse.json({ summary });

  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    return NextResponse.json({ error: '뉴스 요약 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
