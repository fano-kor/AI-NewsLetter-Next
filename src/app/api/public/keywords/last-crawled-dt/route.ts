import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    console.log('키워드 lastCrawledAt 업데이트 API 호출');
    const keywordUpdates = await request.json();

    if (!Array.isArray(keywordUpdates)) {
      return NextResponse.json({ error: '유효하지 않은 데이터 형식입니다.' }, { status: 400 });
    }

    const updatePromises = keywordUpdates.map(async (update) => {
      const { keyword, last_crawled_dt } = update;
      console.log(keyword, last_crawled_dt);
      return prisma.keywords.update({
        where: { keyword },
        data: { lastCrawledAt: new Date(last_crawled_dt) }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: '키워드 lastCrawledAt 업데이트 완료' });
  } catch (error) {
    console.error('키워드 lastCrawledAt 업데이트 중 오류 발생:', error);
    return NextResponse.json({ error: '키워드 lastCrawledAt 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
