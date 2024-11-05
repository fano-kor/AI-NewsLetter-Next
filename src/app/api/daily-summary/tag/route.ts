import { NextRequest, NextResponse } from 'next/server';
import { createTagSummary } from '@/lib/ai/news-summarizer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { date, tag } = await request.json();
    const targetDate = new Date(date);

    if (!tag) {
      return NextResponse.json({ error: '태그를 지정해주세요.' }, { status: 400 });
    }

    await createTagSummary(tag);

    return NextResponse.json({ message: `${tag} 관련 일간 요약이 생성되었습니다.` });
  } catch (error) {
    console.error('태그별 일간 요약 생성 중 오류 발생:', error);
    return NextResponse.json({ error: '일간 요약 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
