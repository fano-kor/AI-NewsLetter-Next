import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  console.log('키워드 조회 API 호출');
  try {
    const keywords = await prisma.keywords.findMany({
      select: {
        keyword: true
      }
    });

    console.log('조회된 키워드:', keywords);
    return NextResponse.json({ keywords: keywords.map(k => k.keyword) });
  } catch (error) {
    console.error('키워드 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '키워드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
