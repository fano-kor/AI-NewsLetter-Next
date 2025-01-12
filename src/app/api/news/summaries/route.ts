import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search } },
            { summary: { contains: search } }
          ]
        } : {},
        tag ? {
          tags: {
            has: tag
          }
        } : {}
      ]
    };

    const [total, items] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          url: true,
          publishedAt: true,
          tags: true
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('뉴스 요약 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '뉴스 요약 조회에 실패했습니다.' }, { status: 500 });
  }
}
