import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 데이터베이스에서 키워드 목록 가져오기
    const keywords = await prisma.keywords.findMany({
      where: { isActive: true },
      select: { keyword: true },
      orderBy: { keyword: 'asc' }
    });

    // 키워드 배열로 변환
    const keywordList = keywords.map(k => k.keyword);

    // 키워드 배열 반환
    return NextResponse.json({ keywords: keywordList });
  } catch (error) {
    console.error('키워드 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '키워드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
