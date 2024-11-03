import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const tags = await prisma.tags.findMany({
      select: {
        tag: true,
      },
    });

    return NextResponse.json({ tags: tags.map(tag => tag.tag) });
  } catch (error) {
    console.error('태그 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '태그 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tag } = await request.json();

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json({ error: '유효하지 않은 태그입니다.' }, { status: 400 });
    }

    await prisma.tags.create({
      data: {
        tag: tag,
      },
    });

    return NextResponse.json({ message: '태그가 추가되었습니다.' });
  } catch (error) {
    console.error('태그 추가 중 오류 발생:', error);
    return NextResponse.json({ error: '태그 추가에 실패했습니다.' }, { status: 500 });
  }
}
