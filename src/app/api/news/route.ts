import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const keyword = searchParams.get('keyword') || '';

  const skip = (page - 1) * limit;

  try {
    const [news, totalCount] = await Promise.all([
      prisma.news.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          url: true,
          publishedAt: true,
          tags: true,
          criticalLevel: true
        },
        where: {
          AND: [
            keyword ? { keywords: { has: keyword } } : {},
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        },
        orderBy: {
          //publishedAt: 'desc'
          tags: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.news.count({
        where: {
          AND: [
            keyword ? { keywords: { has: keyword } } : {},
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        },
      })
    ]);

    return NextResponse.json({ news, totalCount });
  } catch (error) {
    console.error('뉴스 데이터 가져오기 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}
