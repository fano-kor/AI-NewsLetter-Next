import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  try {
    const [news, totalCount] = await Promise.all([
      prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          published_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.news.count({
        where: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      })
    ]);

    return NextResponse.json({ news, totalCount });
  } catch (error) {
    console.error('뉴스 데이터 가져오기 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}