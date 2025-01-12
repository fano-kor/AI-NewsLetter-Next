import { NextResponse } from 'next/server';
import { createDailySummary, getDailySummaries } from '@/lib/ai/news-summarizer';

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    const targetDate = new Date(date);

    //아직 targetDate를 사용하지는 않음
    await createDailySummary(targetDate);

    return NextResponse.json({ message: '일간 요약이 생성되었습니다.' });
  } catch (error) {
    console.error('일간 요약 생성 중 오류 발생:', error);
    return NextResponse.json({ error: '일간 요약 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const tag = searchParams.get('tag');

    const summaries = await getDailySummaries(date, tag);
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('일간 요약 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '일간 요약 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
