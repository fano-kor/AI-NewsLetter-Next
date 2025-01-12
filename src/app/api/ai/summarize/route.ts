import { NextResponse } from 'next/server';
import { summarizeNewsWithoutSummary, tagNewsWithoutTags } from '@/lib/ai/news-summarizer';

export async function POST() {
  try {
    //await summarizeNewsWithoutSummary();
    await tagNewsWithoutTags();
    return NextResponse.json({ message: '요약 및 태그 분류가 완료되었습니다.' });
  } catch (error) {
    console.error('요약 및 태그 분류 중 오류 발생:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}

