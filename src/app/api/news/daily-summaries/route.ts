import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { summary: { contains: search } },
        { tag: { equals: search } }
      ]
    } : {};

    const [total, items] = await Promise.all([
      prisma.dailySummary.count({ where }),
      prisma.dailySummary.findMany({
        where,
        select: {
          id: true,
          date: true,
          summary: true,
          tag: true,
          createdAt: true
        },
        orderBy: {
          date: 'desc'
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
    console.error('일간 요약 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '일간 요약 조회에 실패했습니다.' }, { status: 500 });
  }
} 