import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const keywords = await prisma.keywords.findMany({
      where: { isActive: true },
      select: { keyword: true },
      orderBy: { keyword: 'asc' }
    });

    const keywordList = keywords.map(k => k.keyword);
    return NextResponse.json({ keywords: keywordList });
  } catch (error) {
    console.error('키워드 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '키워드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();
    const newKeyword = await prisma.keywords.create({
      data: { keyword, isActive: true }
    });
    return NextResponse.json(newKeyword);
  } catch (error) {
    console.error('키워드 추가 중 오류 발생:', error);
    return NextResponse.json({ error: '키워드 추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}