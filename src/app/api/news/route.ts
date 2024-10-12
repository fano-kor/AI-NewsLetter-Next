import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (e) => {
  console.log(`${e.query} ${e.params}`);
});

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('news.jsonl') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const fileContent = await file.text();
    const lines = fileContent.split('\n');

    let createdCount = 0;
    let updatedCount = 0;

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const article = JSON.parse(line);
      
      const existingArticle = await prisma.news.findUnique({
        where: { url: article.url } as Prisma.newsWhereUniqueInput,
      });

      if (existingArticle) {
        // 기존 기사가 존재하면 업데이트
        const updatedKeywords = Array.from(new Set([...existingArticle.keywords, ...article.keywords]));
        await prisma.news.update({
          where: { url: article.url } as Prisma.newsWhereUniqueInput,
          data: {
            title: article.title,
            content: article.content,
            published_at: new Date(article.published_at),
            keywords: updatedKeywords,
          },
        });
        updatedCount++;
      } else {
        // 새로운 기사면 생성
        await prisma.news.create({
          data: {
            title: article.title,
            content: article.content,
            published_at: new Date(article.published_at),
            url: article.url,
            keywords: article.keywords,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      message: `${createdCount}개의 새 기사가 저장되었고, ${updatedCount}개의 기사가 업데이트되었습니다.`
    });
  } catch (error) {
    console.error('뉴스 데이터 처리 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
