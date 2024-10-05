import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        published_at: 'desc'
      },
      take: 20 // 최근 20개의 뉴스 항목만 가져옵니다
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('뉴스 데이터 가져오기 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}